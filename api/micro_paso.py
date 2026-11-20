"""
Flow it! · Generador de micro-pasos con búsqueda web (función de Python en Vercel).

POST /api/micro_paso   {"tarea": "Hacer test autoescuela", "esfuerzo": "pesado"}

Busca en internet cómo se empieza la tarea (librería `webless`, sin claves de API): la web general
explica de qué va la tarea y con qué herramienta se hace; understood.org (es-mx) aporta una estrategia
para arrancar con TDAH. Devuelve SOLO el primer paso físico: nunca el proceso entero, para no abrumar.
Todo el análisis es local y determinista (expresiones regulares, sin IA generativa).

Respuestas (JSON estricto):
  success           → {"status", "tarea_original", "contexto", "micro_paso", "categoria", "objeto", "tipo_objeto", "origen",
                        "estrategia", "fuente_estrategia", "fuentes", "diagnostico"}
  incomprehensible  → {"status", "mensaje"}
  blocked           → {"status", "mensaje", "ayuda"?}

Reglas de la app que se respetan (las mismas que comprueba `npm run validar`):
  - Empieza por un verbo de acción física y nombra un objeto concreto (la app, el libro…).
  - Nunca el verbo «hacer», nunca «la primera parte», una sola acción (sin «y» ni «o»).
  - Sin tiempos ni prisas («minutos», «segundos», «rápido»). Decide la persona.
  - Pesado: ridículamente fácil, empieza por «Solo…» (se puede hacer tumbado en la cama).
  - El sabor INCUP lo pone la app en cada carta (cambia el enfoque, sin fricción artificial).
"""

from __future__ import annotations

import asyncio
import json
import re
import unicodedata
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler

LIMITE_SEGUNDOS = 30  # búsqueda + lectura
MAX_CARACTERES_PAGINA = 12000
NIVELES = ("ligero", "medio", "pesado")

MENSAJE_INCOMPRENSIBLE = (
    "No he entendido muy bien qué quieres empezar. ¿Puedes escribirlo de otra forma? "
    "Por ejemplo: 'Estudiar tema 3' o 'Limpiar la mesa'."
)
MENSAJE_BLOQUEO = (
    "Lo siento, no puedo ayudarte con esa tarea. Flow It está diseñado para tareas "
    "cotidianas seguras y positivas."
)
AYUDA_CRISIS = (
    "Si estás pensando en hacerte daño, pide ayuda ahora: llama gratis al 024 "
    "(atención a la conducta suicida, 24 horas). Si es una emergencia, llama al 112."
)


# ── Utilidades de texto ─────────────────────────────────────────


def normalizar(texto: str) -> str:
    """Minúsculas, sin tildes ni signos (la ñ se conserva)."""
    texto = texto.lower().replace("ñ", "\0")
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn").replace("\0", "ñ")
    texto = re.sub(r"[^a-z0-9ñ\s]", " ", texto)
    return re.sub(r"\s+", " ", texto).strip()


def respuesta(status: str, **datos) -> dict:
    return {"status": status, **datos}


# ── 1. Filtro de seguridad (moderación) ─────────────────────────

AUTOLESION = re.compile(
    r"\b(suicid\w*|quitarme la vida|matarme|autolesi\w*|hacerme daño|cortarme las venas|"
    r"ahorcarme|tirarme por la ventana|tirarme por un puente|sobredosis|no quiero vivir)\b"
)
PROHIBIDAS = re.compile(
    r"\b("
    # violencia y daño físico
    r"matar(le|la|lo|les|los|las)?|asesin\w*|apuñal\w*|disparar a|pegar a|pegarle|golpear a|"
    r"envenen\w*|secuestr\w*|tortur\w*|bomba|explosivo\w*|arma de fuego|hacer daño a|hacerle daño|"
    # contenido sexual
    r"sexo|sexual\w*|porno\w*|desnud\w*|follar|violar|violacion|"
    # actividades ilegales
    r"robar|hackear|cocaina|heroina|vender droga\w*|comprar droga\w*|falsific\w*|estafar|blanquear"
    r")\b"
)


def filtrar_seguridad(tarea: str) -> dict | None:
    """Devuelve un bloqueo si la tarea no es segura; None si se puede seguir."""
    texto = normalizar(tarea)
    if AUTOLESION.search(texto):
        return respuesta("blocked", mensaje=MENSAJE_BLOQUEO, ayuda=AYUDA_CRISIS)
    if PROHIBIDAS.search(texto):
        return respuesta("blocked", mensaje=MENSAJE_BLOQUEO)
    return None


# ── 2. Texto sin sentido o sin verbo de acción ──────────────────

SECUENCIAS_TECLADO = ("qwert", "werty", "asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl", "zxcv", "xcvb", "cvbn", "vbnm", "poiu", "lkjh", "ñlkj")
VERBOS_CORTOS = {"ir", "ver", "dar", "oir", "leer", "ser", "reir"}
NO_VERBOS = {
    "lugar", "hogar", "azucar", "collar", "altar", "dolar", "bar", "par", "mar", "militar", "popular",
    "mujer", "taller", "placer", "ayer", "primer", "tercer", "alfiler", "cancer", "carácter", "caracter",
    "elixir", "nadir",
}
VERBO = re.compile(r"^[a-zñ]{2,}(ar|er|ir)(me|te|se|lo|la|le|los|las|les|nos)?$")


def tiene_verbo(texto: str) -> bool:
    for palabra in normalizar(texto).split():
        if palabra in VERBOS_CORTOS:
            return True
        if palabra not in NO_VERBOS and VERBO.match(palabra):
            return True
    return False


def es_galimatias(texto: str) -> bool:
    limpio = normalizar(texto)
    letras = re.sub(r"[^a-zñ]", "", limpio)
    if len(letras) < 3:
        return True
    if any(s in letras for s in SECUENCIAS_TECLADO) or re.search(r"(.)\1{3,}", letras):
        return True
    vocales = sum(c in "aeiou" for c in letras)
    if vocales / len(letras) < 0.2:
        return True
    return any(len(p) >= 6 and not re.search(r"[aeiou]", p) for p in limpio.split())


def comprobar_comprension(tarea: str) -> dict | None:
    """Devuelve el error amigable si no se entiende la tarea; None si se entiende."""
    # No hace falta verbo: una palabra sola («café», «gafas») también es una tarea.
    # Solo se rechaza el texto sin sentido y las respuestas vacías («nada», «no sé»).
    if es_galimatias(tarea) or SIN_TAREA.match(normalizar(tarea)):
        return respuesta("incomprehensible", mensaje=MENSAJE_INCOMPRENSIBLE)
    return None


SIN_TAREA = re.compile(r"^(nada|no se|nose|ninguna|ninguno|no lo se|ni idea|nose que|algo|cosas|no)$")


# ── 3. Búsqueda web con límite de tiempo ────────────────────────
#
# Reglas de la búsqueda:
#   1. Fuentes de confianza según el tipo de tarea (FUENTES_CONFIANZA); se buscan primero.
#   2. Solo resultados en español; fuera buscadores, tiendas y foros (DOMINIOS_BLOQUEADOS).
#   3. Solo resultados que hablan de la tarea (la mitad de sus palabras importantes).
#   4. understood.org solo en español (es-mx), y solo para la estrategia de arranque.
#   5. Cada respuesta lleva un diagnóstico: qué buscador respondió y cuál falló.


@dataclass
class Contexto:
    titulo: str
    documentos: list[str]  # un texto por resultado (resumen + página): sirve para contar coincidencias
    fuentes: list[str]
    tipo_busqueda: str = "Otro"
    guia: str = ""  # texto de understood.org/es-mx (estrategias para arrancar con TDAH)
    url_guia: str = ""
    enciclopedia: str = ""  # Wikipedia: qué es la cosa de la tarea (solo para catalogar)
    materiales: str = ""  # página de «qué necesitas para…»: sus listas dan los materiales de los retos
    diagnostico: dict = field(default_factory=dict)

    @property
    def texto(self) -> str:
        return "\n".join(self.documentos)


UNDERSTOOD = "understood.org"
UNDERSTOOD_ES = "understood.org/es-mx"
PORTADA_UNDERSTOOD = "https://www.understood.org/es-mx"

# Fuentes de confianza por tipo de tarea
FUENTES_CONFIANZA: dict[str, dict] = {
    "Trámites": {
        "dominios": ["dgt.es", "sede.gob.es", "administracion.gob.es", "inclusion.gob.es",
                     "interior.gob.es", "policia.es", "sepe.es", "seg-social.es", "agenciatributaria.gob.es"]
    },
    # Estudio de autoescuela: la DGT y webs de autoescuelas
    "Autoescuela": {"dominios": ["dgt.es"], "host_contiene": ["autoescuel", "autoescola"]},
    # Casa: guías de limpieza
    "Casa": {"texto_contiene": ["limpi", "guia", "paso a paso", "trucos para"]},
}

DOMINIOS_BLOQUEADOS = [
    # buscadores
    "google.com", "google.es", "bing.com", "duckduckgo.com", "yahoo.com", "mojeek.com",
    # tiendas
    "amazon.es", "amazon.com", "ebay.es", "ebay.com", "aliexpress.com", "mercadolibre.com", "wallapop.com",
    "milanuncios.com", "temu.com", "shein.com",
    # foros y redes
    "reddit.com", "pinterest.com", "pinterest.es", "quora.com", "forocoches.com", "facebook.com",
    "instagram.com", "tiktok.com", "x.com", "twitter.com", "youtube.com",
    # diccionarios y conjugadores: definen la palabra, no explican cómo se hace la tarea
    "rae.es", "dle.rae.es", "reverso.net", "wordreference.com", "conjugacion.es", "conjugador.reverso.net",
    "spanishdict.com", "linguee.es", "definicion.de", "significados.com", "thefreedictionary.com",
]
RUTA_FORO_O_TIENDA = re.compile(r"(/foro|foro\.|forum|/tienda/|/shop/|/producto|/product/|/comprar/|/carrito)")
PALABRAS_ES = {"de", "la", "el", "en", "los", "las", "para", "con", "por", "que", "del", "una", "como", "tu", "paso"}
PALABRAS_EN = {"the", "and", "how", "to", "of", "with", "for", "your", "step", "what"}


def tipo_de_busqueda(tarea: str) -> str:
    texto = normalizar(tarea)
    if re.search(r"\b(autoescuela|dgt|carnet|permiso de conducir|test de conducir|examen teorico)\b", texto) or (
        re.search(r"\btests?\b", texto) and re.search(r"\b(conducir|coche|moto|autoescuela)\b", texto)
    ):
        return "Autoescuela"
    return categoria_de(tarea, None)


def _host(url: str) -> str:
    return re.sub(r"^https?://(www\.)?", "", url).split("/")[0].lower()


def bloqueado(url: str) -> bool:
    host = _host(url)
    return any(host == d or host.endswith("." + d) for d in DOMINIOS_BLOQUEADOS) or bool(RUTA_FORO_O_TIENDA.search(url.lower()))


def en_espanol(hit) -> bool:
    url = hit.url.lower()
    if _host(url).endswith(".es") or "/es/" in url or "/es-" in url:
        return True
    palabras = normalizar(f"{hit.title} {hit.snippet or ''}").split()
    es = sum(p in PALABRAS_ES for p in palabras)
    en = sum(p in PALABRAS_EN for p in palabras)
    return es >= 2 and es > en


def de_confianza(hit, tipo: str) -> bool:
    regla = FUENTES_CONFIANZA.get(tipo)
    if not regla:
        return False
    host = _host(hit.url)
    if any(host == d or host.endswith("." + d) for d in regla.get("dominios", [])):
        return True
    if any(c in host for c in regla.get("host_contiene", [])):
        return True
    texto = normalizar(f"{hit.title} {hit.snippet or ''}")
    return any(c in texto for c in regla.get("texto_contiene", []))


def _claves(tarea: str) -> tuple[list[str], int]:
    nombre = normalizar(nombre_de(tarea))
    claves = [p for p in nombre.split() if len(p) >= 4 and p not in PALABRAS_ES] or nombre.split()
    return claves, max(1, (len(claves) + 1) // 2)


# Trámites: resultados de España (no de otros países hispanohablantes)
OTRO_PAIS = re.compile(r"(estadounidense|americano|eeuu|estados unidos|mexic\w*|argentin\w*|colombia\w*|chile\w*|peru\w*|\.gov/|\.gob\.mx|\.gob\.ar|\.gov\.co)")


def habla_de(hit, claves: list[str], necesarias: int) -> bool:
    texto = f" {normalizar(f'{hit.title} {hit.snippet or ''}')} "
    return sum(f" {c}" in texto for c in claves) >= necesarias


# ── Reglas de relevancia de la búsqueda ─────────────────────────
#   R1. El resultado nombra la acción (raíz del verbo: «pint-», «escrib-») y el objeto de la tarea.
#   R2. Se puntúa: el título pesa más que el resumen; suman las señales de guía («cómo», «paso a paso»,
#       «consejos»); restan las de tienda, noticia o definición («comprar», «precio», «significado»).
#   R3. Solo pasan los resultados con PUNTOS_MINIMOS; se leen primero los que más puntúan.
#   R4. La página leída tiene que hablar de la tarea (sus palabras salen varias veces) o se descarta.
#   R5. La página de materiales tiene que hablar de materiales («necesitas», «lista», «herramientas»).
SENAL_GUIA = re.compile(r"\b(como|paso a paso|guia|tutorial|consejos|trucos|aprende|principiantes|empezar|instrucciones|tecnicas)\b")
SENAL_RUIDO = re.compile(r"\b(comprar|precio|precios|oferta|ofertas|tienda|venta|rebajas|noticia|noticias|definicion|significado|sinonimo\w*|traduccion|letra|cancion|pelicula|resena|opiniones|wikipedia|conjugacion|conjugar|diccionario|rae)\b")
SENAL_MATERIAL = re.compile(r"\b(necesit\w*|material\w*|herramienta\w*|lista|kit|equipo|utensilio\w*|hace falta|imprescindible\w*)\b")
PUNTOS_MINIMOS = 3
MENCIONES_MINIMAS = 3


def raiz_verbo(tarea: str) -> str | None:
    """«pintar la habitación» → «pint» (vale para pintar, pintura, pintado)."""
    verbo = verbo_de_tarea(tarea)
    if not verbo or verbo in {"hacer", "tener", "ir", "ver", "dar", "ser"}:
        return None
    return verbo[: max(4, len(verbo) - 2)]


def puntuar(hit, claves: list[str], raiz: str | None) -> int:
    titulo = f" {normalizar(hit.title or '')} "
    resumen = f" {normalizar(hit.snippet or '')} "
    puntos = sum(3 if f" {c}" in titulo else 1 if f" {c}" in resumen else 0 for c in claves)
    if raiz:
        puntos += 3 if f" {raiz}" in titulo else 1 if f" {raiz}" in resumen else -2
    if SENAL_GUIA.search(titulo):
        puntos += 2
    if SENAL_RUIDO.search(titulo):
        puntos -= 4
    return puntos


def menciones(texto: str, claves: list[str], raiz: str | None) -> int:
    t = f" {normalizar(texto[:MAX_CARACTERES_PAGINA])} "
    return sum(t.count(f" {c}") for c in claves + ([raiz] if raiz else []))


async def _consultar(consulta: str, **opciones) -> tuple[list, dict]:
    """Una búsqueda con su diagnóstico: qué buscadores respondieron y cuáles fallaron."""
    from webless import search  # importación tardía: si falta la librería, salta el respaldo

    try:
        resultado = await search(consulta, **opciones)
    except Exception as error:
        return [], {"consulta": consulta, "respondieron": [], "fallaron": {"webless": str(error)[:120]}, "resultados": 0}
    return list(resultado.hits), {
        "consulta": consulta,
        "respondieron": list(resultado.succeeded),
        "fallaron": {k: str(v)[:120] for k, v in dict(resultado.failed).items()},
        "resultados": len(resultado.hits),
    }


async def _leer(url: str, segundos: float = 8.0, completa: bool = False) -> tuple[str, str]:
    """Contenido en Markdown y título; vacío si la página bloquea o tarda."""
    from webless import fetch

    try:
        pagina = await asyncio.wait_for(
            fetch(url, format="markdown", full_page=completa, max_chars=MAX_CARACTERES_PAGINA), timeout=segundos
        )
        return pagina.content or "", pagina.title or ""
    except Exception:
        return "", ""


async def _buscar_general(tarea: str, tipo: str) -> tuple[str, list[str], list[str], dict] | None:
    """Web general: de qué va la tarea y con qué herramienta se hace. Fuentes de confianza primero."""
    claves, necesarias = _claves(tarea)
    raiz = raiz_verbo(tarea)
    regla = FUENTES_CONFIANZA.get(tipo, {})
    pais = " España" if tipo == "Trámites" else ""
    bloqueados = DOMINIOS_BLOQUEADOS + [UNDERSTOOD]
    # Dos formulaciones a la vez: si una no da resultados válidos, la otra suele darlos.
    # Tarea de una palabra («escribir»): se concreta para no traer páginas de cualquier cosa
    corta = len(normalizar(tema_de(tarea)).split()) <= 1
    consultas = [
        _consultar(
            f"cómo {tarea}{pais} paso a paso",
            limit=10, blocked_domains=bloqueados, timeout=12.0,
        ),
        _consultar(
            f"{tarea}{pais} guía para principiantes" if corta else f"{tarea}{pais} paso a paso guía",
            limit=10, blocked_domains=bloqueados, timeout=12.0,
        ),
    ]
    if regla.get("dominios"):
        # «site:» en la consulta: así el buscador ya devuelve páginas de las sedes oficiales
        sitios = " OR ".join(f"site:{d}" for d in regla["dominios"])
        consultas.append(_consultar(f"{tarea} ({sitios})", limit=10, allowed_domains=regla["dominios"], timeout=12.0))
    respuestas = await asyncio.gather(*consultas)

    vistos, confianza, resto = set(), [], []
    descartes = {"repetido": 0, "bloqueado": 0, "idioma": 0, "otro_pais": 0, "no_habla_de_la_tarea": 0, "poco_relevante": 0}
    for hits, _ in reversed(respuestas):  # primero la búsqueda en dominios de confianza
        for h in hits:
            puntos = puntuar(h, claves, raiz)
            motivo = (
                "repetido" if h.url in vistos
                else "bloqueado" if bloqueado(h.url)
                else "idioma" if not en_espanol(h)
                else "otro_pais" if tipo == "Trámites" and OTRO_PAIS.search(h.url.lower() + " " + normalizar(f"{h.title} {h.snippet or ''}"))
                else "no_habla_de_la_tarea" if not habla_de(h, claves, necesarias)
                else "poco_relevante" if puntos < PUNTOS_MINIMOS and not de_confianza(h, tipo)
                else None
            )
            if motivo:
                descartes[motivo] += 1
                continue
            vistos.add(h.url)
            (confianza if de_confianza(h, tipo) else resto).append((puntos, h))
    # Los que más puntúan, primero (dentro de las fuentes de confianza y del resto)
    elegidos = [h for _, h in sorted(confianza, key=lambda x: -x[0]) + sorted(resto, key=lambda x: -x[0])][:4]
    diagnostico = {
        "tipo": tipo,
        "general": respuestas[0][1],
        "general_2": respuestas[1][1],
        "confianza": respuestas[2][1] if len(respuestas) > 2 else None,
        "validos": len(confianza) + len(resto),
        "de_confianza": len(confianza),
        "descartes": descartes,
    }
    if not elegidos:
        return "", [], [], diagnostico

    # Se leen hasta 3 páginas a la vez: cada una es un documento independiente
    paginas = await asyncio.gather(*(_leer(h.url) for h in elegidos[:3]))
    leidas = list(zip(elegidos, list(paginas) + [("", "")] * 4))
    # R4: una página leída que casi no nombra la tarea no habla de ella (menús, portadas, otra cosa)
    utiles = [(h, p) for h, p in leidas if not p[0] or menciones(p[0], claves, raiz) >= MENCIONES_MINIMAS]
    diagnostico["paginas_descartadas"] = len(leidas) - len(utiles)
    if not utiles:
        return "", [], [], diagnostico
    documentos = [f"{h.title}. {h.snippet or ''}\n{p[0]}" for h, p in utiles]
    titulo = utiles[0][1][1] or utiles[0][0].title
    return titulo, documentos, [h.url for h, _ in utiles], diagnostico


ENLACE_UNDERSTOOD = re.compile(r"https://www\.understood\.org/es-mx/[a-z0-9/\-]+")
TEMAS_ARRANQUE = re.compile(r"(empez|comenzar|tarea|funcion.ejecutiva|executive.function|procrastin|motiva|organiz|concentr|evitar)")
# understood.org habla mucho de crianza: esos artículos no sirven para arrancar una tarea propia
TEMAS_CRIANZA = re.compile(r"(hijo|hija|preescolar|kinder|bebe|nino|nina|maestro|escuela primaria)")


def sobre_arranque(texto: str) -> bool:
    t = normalizar(texto.replace("-", " "))
    return bool(TEMAS_ARRANQUE.search(t)) and not TEMAS_CRIANZA.search(t)


async def _buscar_understood(tarea: str) -> tuple[str, str, dict] | None:
    """understood.org solo en español (es-mx): estrategias para empezar con TDAH.
    No se usa para saber con qué se hace la tarea. Si la búsqueda no da nada, se mira su portada es-mx."""
    diagnostico: dict = {"busquedas": [], "via": None}
    url = ""
    for consulta in (f"site:{UNDERSTOOD_ES} cómo empezar {tarea}", f"site:{UNDERSTOOD_ES} cómo empezar una tarea TDAH"):
        hits, diag = await _consultar(consulta, limit=8, allowed_domains=[UNDERSTOOD], timeout=10.0)
        diagnostico["busquedas"].append(diag)
        hits = [h for h in hits if "/es-mx/" in h.url and sobre_arranque(h.url + " " + h.title)]
        if hits:
            url, diagnostico["via"] = hits[0].url, "busqueda"
            break
    if not url:  # portada en español: se elige un artículo sobre empezar tareas o función ejecutiva
        portada, _ = await _leer(PORTADA_UNDERSTOOD, completa=True)
        enlaces = [e for e in dict.fromkeys(ENLACE_UNDERSTOOD.findall(portada)) if sobre_arranque(e)]
        enlaces.sort(key=lambda e: "/articles/" not in e)
        if enlaces:
            url, diagnostico["via"] = enlaces[0], "portada"
    if not url:
        return None
    contenido, _ = await _leer(url)
    diagnostico["pagina_leida"] = bool(contenido)
    return contenido, url, diagnostico


WIKIPEDIA_API = "https://es.wikipedia.org/w/api.php"


async def _buscar_wikipedia(tarea: str) -> tuple[str, str, dict] | None:
    """Wikipedia en español (API abierta, sin clave): qué es la cosa de la tarea («café», «estantería»).
    No dice cómo se hace, pero ayuda a la app a catalogar la tarea."""
    from urllib.parse import urlencode

    from webless import fetch

    tema = nombre_de(tema_de(tarea))
    parametros = urlencode({"action": "query", "list": "search", "srsearch": tema, "srlimit": 3, "format": "json", "utf8": 1})
    try:
        pagina = await asyncio.wait_for(fetch(f"{WIKIPEDIA_API}?{parametros}", format="raw"), timeout=8.0)
        datos = json.loads(pagina.content or "{}")
    except Exception as error:
        return "", "", {"error": repr(error)[:120]}
    resultados = datos.get("query", {}).get("search", [])
    texto = " ".join(f"{x.get('title', '')}. {re.sub(r'<[^>]+>', '', x.get('snippet', ''))}" for x in resultados)
    url = f"https://es.wikipedia.org/wiki/{resultados[0]['title'].replace(' ', '_')}" if resultados else ""
    return texto, url, {"resultados": len(resultados)}


async def _buscar_materiales(tarea: str) -> str:
    """Qué hace falta para la tarea (libreta, lápiz, esterilla…): la primera página en español que se pueda leer.
    La app saca de sus listas los materiales y los convierte en retos («Coge la libreta»)."""
    claves, necesarias = _claves(tarea)
    raiz = raiz_verbo(tarea)
    hits, _ = await _consultar(
        f"qué necesitas para {tarea} lista de materiales", limit=8, blocked_domains=DOMINIOS_BLOQUEADOS + [UNDERSTOOD], timeout=10.0
    )
    # R5: solo páginas que hablan de la tarea Y de materiales, las que más puntúan primero
    candidatos = sorted(
        (
            (puntuar(h, claves, raiz), h) for h in hits
            if not bloqueado(h.url) and en_espanol(h) and habla_de(h, claves, necesarias)
            and SENAL_MATERIAL.search(normalizar(f"{h.title} {h.snippet or ''}"))
        ),
        key=lambda x: -x[0],
    )
    for puntos, h in candidatos[:3]:
        if puntos < PUNTOS_MINIMOS:
            break
        contenido, _ = await _leer(h.url, segundos=7.0)
        if contenido and menciones(contenido, claves, raiz) >= MENCIONES_MINIMAS:
            return contenido
    return ""


async def _buscar(tarea: str) -> Contexto:
    """Las búsquedas a la vez: web general (qué es la tarea), materiales, understood.org (cómo arrancar) y Wikipedia."""
    tipo = tipo_de_busqueda(tarea)
    general, guia, wiki, materiales = await asyncio.gather(
        _buscar_general(tarea, tipo), _buscar_understood(tarea), _buscar_wikipedia(tarea), _buscar_materiales(tarea),
        return_exceptions=True,
    )
    texto_wiki, url_wiki, diag_wiki = wiki if wiki and not isinstance(wiki, BaseException) else ("", "", {"error": "fallo"})
    error_general = repr(general)[:120] if isinstance(general, BaseException) else None
    error_guia = repr(guia)[:120] if isinstance(guia, BaseException) else None
    vacio_general = ("", [], [], {"tipo": tipo, "error": error_general})
    vacio_guia = ("", "", {"error": error_guia})
    titulo, documentos, fuentes, diag_general = general if general and not isinstance(general, BaseException) else vacio_general
    fuentes = fuentes if documentos else []
    texto_guia, url_guia, diag_guia = guia if guia and not isinstance(guia, BaseException) else vacio_guia
    return Contexto(
        titulo=titulo,
        documentos=documentos,
        materiales=materiales if isinstance(materiales, str) else "",
        fuentes=fuentes + ([url_guia] if url_guia else []),
        tipo_busqueda=tipo,
        guia=texto_guia,
        url_guia=url_guia,
        enciclopedia=texto_wiki,
        diagnostico={"web": diag_general, "understood": diag_guia, "wikipedia": {**diag_wiki, "url": url_wiki}},
    )


def buscar_contexto(tarea: str) -> Contexto:
    """Búsqueda + lectura con un límite total de LIMITE_SEGUNDOS. Si falla, un contexto vacío con el motivo."""
    try:
        return asyncio.run(asyncio.wait_for(_buscar(tarea), timeout=LIMITE_SEGUNDOS))
    except Exception as error:
        motivo = "tiempo agotado" if isinstance(error, (asyncio.TimeoutError, TimeoutError)) else repr(error)[:120]
        return Contexto(titulo="", documentos=[], fuentes=[], tipo_busqueda=tipo_de_busqueda(tarea), diagnostico={"error": motivo})


# ── 4. Extracción del micro-paso (filtro de abstracción) ────────

ARTICULO_INICIAL = re.compile(r"^(el|la|los|las|un|una|unos|unas|mi|mis|tu|tus)\s+", re.I)
ABSTRACTOS = re.compile(
    r"^(tengo que |hay que |debo |quiero |necesito )?(hacer|realizar|terminar|acabar|empezar|completar|ponerme con|ponerse con)\s+",
    re.I,
)


def tema_de(tarea: str) -> str:
    """«Hacer el test de autoescuela» → «test de autoescuela»."""
    tema = ABSTRACTOS.sub("", tarea.strip().rstrip(".!?"))
    return ARTICULO_INICIAL.sub("", tema).strip() or tarea.strip()


VERBO_INICIAL = re.compile(r"^[a-záéíóúñ]{2,}(ar|er|ir)(me|te|se|lo|la|le)?\s+", re.I)


def nombre_de(tema: str) -> str:
    """Para nombrar el objeto: sin verbo ni artículo y en minúscula («Renovar el pasaporte» → «pasaporte»)."""
    nombre = ARTICULO_INICIAL.sub("", VERBO_INICIAL.sub("", tema)).strip()
    return (nombre or tema).lower()


@dataclass
class Herramienta:
    patron: re.Pattern
    objeto: str  # {tema} se sustituye por el tema de la tarea
    tipo: str  # "digital" o "fisico"
    tipos_tarea: frozenset[str] | None = None  # None: vale para cualquier tipo de tarea


DIGITALES = frozenset({"Trámites", "Autoescuela", "Estudio", "Salud", "Trabajo", "Otro"})
ESTUDIO = frozenset({"Estudio", "Autoescuela"})
CASA = frozenset({"Casa"})


HERRAMIENTAS = [
    Herramienta(re.compile(r"\btests?\b"), "la app de {tema}", "digital", frozenset({"Autoescuela", "Estudio"})),
    Herramienta(re.compile(r"\b(app|apps|aplicacion|aplicaciones)\b"), "la app de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\bsede electronica\b"), "la sede electrónica de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\bcita previa\b"), "la web de cita previa", "digital", DIGITALES),
    Herramienta(re.compile(r"\b(formulario|impreso|solicitud|modelo \d{3})\b"), "el formulario de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\b(instrucciones|manual de instrucciones|manual de montaje|folleto de montaje)\b"), "las instrucciones de {tema}", "fisico"),
    Herramienta(re.compile(r"\b(libro|manual|temario)\b"), "el libro de {tema}", "fisico", ESTUDIO),
    Herramienta(re.compile(r"\b(apuntes|cuaderno|libreta)\b"), "los apuntes de {tema}", "fisico", ESTUDIO),
    Herramienta(re.compile(r"\b(documento|pdf)\b"), "el documento de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\b(descalcificad\w*)\b"), "el descalcificador", "fisico", CASA),
    Herramienta(re.compile(r"\b(cafetera|cafeteras)\b"), "la cafetera", "fisico", CASA),
    Herramienta(re.compile(r"\b(desengrasante|quitagrasas)\b"), "el desengrasante", "fisico", CASA),
    Herramienta(re.compile(r"\b(fregona|fregar el suelo)\b"), "la fregona", "fisico", CASA),
    Herramienta(re.compile(r"\b(escoba|barrer)\b"), "la escoba", "fisico", CASA),
    Herramienta(re.compile(r"\baspiradora\b"), "la aspiradora", "fisico", CASA),
    Herramienta(re.compile(r"\b(bayeta|trapo|estropajo|pano)\b"), "la bayeta", "fisico", CASA),
    Herramienta(re.compile(r"\b(lavavajillas|platos)\b"), "el primer plato del fregadero", "fisico", CASA),
    Herramienta(re.compile(r"\b(web|pagina web|portal|plataforma|online)\b"), "la web de {tema}", "digital", DIGITALES),
]
# Si ninguna herramienta llega a 2 resultados: objeto por defecto según el tipo de tarea
POR_DEFECTO = {"Casa": ("el producto de limpieza", "fisico")}
MIN_COINCIDENCIAS = 2  # la herramienta debe salir en al menos 2 resultados distintos

# Verbos físicos que pueden abrir el primer paso de una guía (infinitivo o imperativo) → imperativo de tú
VERBO_FISICO = {
    "abrir": "Abre", "abre": "Abre", "entrar": "Entra en", "entra": "Entra en", "acceder": "Entra en", "accede": "Entra en",
    "descargar": "Descarga", "descarga": "Descarga", "buscar": "Busca", "busca": "Busca", "coger": "Coge", "coge": "Coge",
    "leer": "Lee", "lee": "Lee", "rellenar": "Rellena", "rellena": "Rellena", "escribir": "Escribe", "escribe": "Escribe",
    "pedir": "Pide", "pide": "Pide", "llamar": "Llama a", "llama": "Llama a", "mojar": "Moja", "moja": "Moja",
    "llenar": "Llena", "llena": "Llena", "vaciar": "Vacía", "vacia": "Vacía",
    "verter": "Vierte", "vierte": "Vierte", "echar": "Echa", "echa": "Echa",
    "añadir": "Añade", "anadir": "Añade", "añade": "Añade", "anadie": "Añade",
    "meter": "Mete", "mete": "Mete", "sacar": "Saca", "saca": "Saca",
    "encender": "Enciende", "enciende": "Enciende", "apagar": "Apaga", "apaga": "Apaga",
    "poner": "Pon", "pon": "Pon", "insertar": "Mete", "inserta": "Mete",
}
PRIMER_PASO = re.compile(r"(primer paso|lo primero|paso 1|^\s*1[.)]\s)", re.M)
CATEGORIAS = [
    ("Estudio", r"\b(examen|test|estudiar|temario|autoescuela|oposicion\w*|tema \d+|carnet)\b"),
    ("Trámites", r"\b(dni|pasaporte|hacienda|renta|cita previa|seguridad social|empadron\w*|tramite\w*|certificado|sepe|paro|prestacion|subsidio|nie|tarjeta sanitaria)\b"),
    ("Casa", r"\b(limpiar|cocina|fregar|ropa|lavadora|barrer|ordenar|bano|descalcif\w*|mantenim\w*|desatascar|bombilla|horno|nevera)\b"),
    ("Salud", r"\b(medico|dentista|farmacia|receta|centro de salud|vacuna)\b"),
    ("Trabajo", r"\b(correo|email|informe|curriculum|cv|reunion|cliente|factura)\b"),
]
# Estrategias para arrancar que aparecen en understood.org → consejo propio de la app.
# No se copia su texto: se detecta la idea y se dice con las pautas de Flow it! (literal, sin prisas).
ESTRATEGIAS = [
    (r"body doubling|doble de cuerpo|acompanamiento|alguien (cerca|contigo|al lado)|companer\w*", "Tener a alguien cerca mientras empiezas ayuda a arrancar."),
    (r"recompensa\w*|premio\w*|refuerzo\w* positivo", "Elige un premio para cuando lo consigas."),
    (r"dividir|divide\w*|pasos (mas )?pequen\w*|partes pequen\w*|trozos", "Con un paso pequeño cada vez es suficiente."),
    (r"distraccion\w*|notificacion\w*|silenci\w*", "Deja el móvil boca abajo mientras empiezas."),
    (r"lista de (tareas|control|verificacion)|checklist|tachar", "Apunta en tu libreta lo que ya has conseguido."),
    (r"rutina\w*|misma hora|mismo momento", "Repetirlo a la misma hora del día lo vuelve más fácil."),
    (r"movimiento|moverse|ejercicio fisico", "Moverte un poco antes de empezar ayuda a arrancar."),
]


def elegir_estrategia(contexto: Contexto) -> str | None:
    """La estrategia que más menciona understood.org para esta tarea (o para empezar en general)."""
    if not contexto.guia:
        return None
    texto = normalizar(contexto.guia)
    puntos = [(len(re.findall(patron, texto)), frase) for patron, frase in ESTRATEGIAS]
    mejor = max(puntos, key=lambda p: p[0])
    return mejor[1] if mejor[0] > 0 else None


PROHIBIDO_EN_PASO = re.compile(
    r"\b(minutos?|segundos?|horas?|rapido|deprisa|haz|hacer|tarea|primera parte)\b|\s(y|o)\s", re.I
)


def elegir_herramienta(tarea: str, contexto: Contexto) -> tuple[Herramienta | None, dict]:
    """La herramienta que nombra la tarea o, si no, la que sale en al menos MIN_COINCIDENCIAS
    resultados distintos (no depende de una sola página). Solo herramientas de ese tipo de tarea."""
    en_tarea = normalizar(tarea)
    documentos = [normalizar(d) for d in contexto.documentos]
    mejor, puntos_mejor, recuento = None, 0.0, {}
    for h in HERRAMIENTAS:
        if h.tipos_tarea is not None and contexto.tipo_busqueda not in h.tipos_tarea:
            continue
        nombrada = bool(h.patron.search(en_tarea))
        # «la app de {tema}» solo si la tarea es de un tipo digital conocido o la frase la nombra:
        # muchas webs dicen «descarga nuestra app» y no por eso se pinta una habitación con una app
        if "{tema}" in h.objeto and not nombrada and contexto.tipo_busqueda == "Otro":
            continue
        coincidencias = sum(bool(h.patron.search(d)) for d in documentos)
        if coincidencias:
            recuento[h.objeto.split(" de ")[0]] = coincidencias
        if not nombrada and coincidencias < MIN_COINCIDENCIAS:
            continue
        puntos = 10 * nombrada + coincidencias
        if puntos > puntos_mejor:
            mejor, puntos_mejor = h, puntos
    return mejor, recuento


def verbo_de_tarea(tarea: str) -> str | None:
    """«descalcificar cafetera» → «descalcificar»; «limpiar el horno» → «limpiar»."""
    texto = normalizar(tarea.strip())
    texto = ABSTRACTOS.sub("", texto)
    for p in texto.split()[:2]:
        if p in VERBOS_CORTOS:
            return p
        if p not in NO_VERBOS and VERBO.match(p):
            return re.sub(r"(me|te|se|lo|la|le|los|las|les|nos)$", "", p) or None
    return None


def verbo_del_primer_paso(contexto: Contexto) -> str | None:
    """Busca la frase del primer paso en la guía y se queda solo con su verbo físico."""
    if not contexto.documentos:
        return None
    lineas = contexto.texto.splitlines()
    for i, linea in enumerate(lineas):
        if PRIMER_PASO.search(linea.lower()):
            for candidata in lineas[i : i + 3]:
                for palabra in normalizar(candidata).split()[:6]:
                    if palabra in VERBO_FISICO:
                        return VERBO_FISICO[palabra]
    return None


# ── Independencia del lugar ──────────────────────────────────────
# Tareas que dependen de un sitio físico concreto (limpiar la cocina, hacer ejercicio): se
# pregunta dónde está la persona para avisar de que hace falta moverse. Las demás (estudiar,
# escribir, llamar) se pueden hacer desde cualquier sitio: no se pregunta ni se asume un lugar.
REQUIERE_LUGAR = re.compile(
    r"\b(limpiar|fregar|barrer|aspirar|ordenar|recoger|tender|planchar|colada|lavadora|cocinar|"
    r"guisar|hornear|regar|pintar|montar|desmontar|arreglar|reparar|taladrar|lijar|atornillar|"
    r"ejercicio|entrenar|gimnasio|pesas|correr|caminar|pasear|nadar|bici|yoga|estirar|bailar|"
    r"ducharme|ducha|bano|afeitarme|maquillarme|pasear al perro|sacar al perro|jardin|huerto|"
    r"descalcificar|desatascar|lavar los platos|lavar el coche|aparcar)\b"
)
LUGAR_DE_TAREA = [
    (re.compile(r"\b(cocina|platos|nevera|horno|fregadero)\b"), "la cocina"),
    (re.compile(r"\b(bano|ducha|lavabo)\b"), "el baño"),
    (re.compile(r"\b(jardin|huerto|plantas|terraza)\b"), "el jardín o la terraza"),
    (re.compile(r"\b(gimnasio|pesas|ejercicio|entrenar)\b"), "el gimnasio o donde entrenes"),
    (re.compile(r"\b(coche|garaje)\b"), "el garaje"),
]


def requiere_lugar_tarea(tarea: str) -> tuple[bool, str]:
    """true si la tarea necesita un sitio físico concreto, y cuál (orientativo, para la pregunta)."""
    texto = normalizar(tarea)
    if not REQUIERE_LUGAR.search(texto):
        return False, "cualquiera"
    lugar = next((l for patron, l in LUGAR_DE_TAREA if patron.search(texto)), "ese sitio")
    return True, lugar


def categoria_de(tarea: str, contexto: Contexto | None) -> str:
    texto = normalizar(tarea + " " + (contexto.titulo if contexto else ""))
    for nombre, patron in CATEGORIAS:
        if re.search(patron, texto):
            return nombre
    return "Otro"


def contexto_corto(contexto: Contexto, tema: str) -> str:
    if not contexto.titulo:
        return tema
    titulo = re.split(r"\s[|\-–—:]\s", contexto.titulo)[0].strip()
    if len(titulo) > 60:  # se corta en una palabra entera
        titulo = titulo[:60].rsplit(" ", 1)[0]
    return titulo or tema


def generar_micro_paso(tarea: str, esfuerzo: str, contexto: Contexto) -> dict:
    """Extrae UN micro-paso físico calibrado por el esfuerzo. Nunca el proceso entero."""
    tema = nombre_de(tema_de(tarea))
    requiere_lugar, lugar_probable = requiere_lugar_tarea(tarea)
    herramienta, recuento = elegir_herramienta(tarea, contexto)
    if herramienta:
        objeto, tipo = herramienta.objeto.format(tema=tema), herramienta.tipo
    else:
        objeto, tipo = POR_DEFECTO.get(contexto.tipo_busqueda, (f"la web de {tema}", "digital"))
    contexto.diagnostico["herramientas"] = recuento

    verbo = verbo_del_primer_paso(contexto)
    # Solo verbos que encajan con el objeto («Descarga la app», nunca «Llama a la web»)
    if tipo == "digital":
        validos = {"Abre", "Entra en", "Busca"} | ({"Descarga"} if "app" in objeto else set())
    else:
        validos = {"Coge", "Abre", "Moja", "Llena", "Vacía", "Echa", "Mete", "Saca", "Añade", "Pon", "Enciende"}
    verbo = verbo if verbo in validos else None
    if esfuerzo == "pesado":
        paso = f"Solo abre {objeto}" if tipo == "digital" else f"Solo toca {objeto}"
    elif esfuerzo == "medio":
        paso = f"{verbo} {objeto}" if verbo else (f"Abre {objeto}" if tipo == "digital" else f"Coge {objeto}")
    else:
        paso = f"Lee la primera pantalla de {objeto}" if tipo == "digital" else f"Pon {objeto} sobre la mesa"

    paso = paso.replace(" de el ", " del ").replace(" a el ", " al ")
    if PROHIBIDO_EN_PASO.search(normalizar(paso)):  # nunca debería pasar; por si la web cuela algo raro
        paso = f"Solo abre en el móvil la web de {tema}"
    # Verbo de acción para el motor de retos de la app: el del primer paso de la guía o el natural del objeto
    verbo_accion = verbo or ("Abre" if tipo == "digital" else "Coge")
    # Filtro de seguridad también sobre lo extraído de la web
    if filtrar_seguridad(objeto):
        objeto, tipo, herramienta, verbo_accion = f"la web de {tema}", "digital", None, "Abre"
        paso = f"Solo abre en el móvil la web de {tema}"

    return respuesta(
        "success",
        tarea_original=tarea,
        contexto=contexto_corto(contexto, tema),
        micro_paso=f"{paso}.",
        categoria=categoria_de(tarea, contexto if contexto.titulo else None),
        objeto=objeto,
        tipo_objeto=tipo,
        # «web» solo si la búsqueda encontró una herramienta concreta en 2 resultados (o en la tarea):
        # nunca se inventa «la web de café» para algo que se hace con las manos
        # o si la propia frase la nombra («descalcificar cafetera»), aunque el buscador no responda
        origen="web" if herramienta and (contexto.documentos or herramienta.patron.search(normalizar(tarea))) else "respaldo",
        verbo_tarea=verbo_de_tarea(tarea),
        verbo_accion=verbo_accion,
        requiere_lugar=requiere_lugar,
        lugar_probable=lugar_probable,
        estrategia=elegir_estrategia(contexto),
        fuente_estrategia=contexto.url_guia or None,
        fuentes=contexto.fuentes,
        # Lo que encontró la búsqueda (títulos y resúmenes): la app lo usa para catalogar la tarea
        resumen=resumen_de(contexto),
        lineas_pasos=lineas_de_pasos(contexto),
        lineas_listas=lineas_de_listas(contexto),
        diagnostico=contexto.diagnostico,
    )


# Líneas numeradas de las guías («1. Vacía el depósito», «Paso 2: Llena…»). La app las limpia
# (src/datos/pasos.ts) y monta los retos con ellas: los datos reales de cómo se hace la tarea.
LINEA_PASO = re.compile(r"^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:paso\s*)?(\d{1,2})\s*[.):\-–]\s*(.+)$", re.I)


def lineas_de_pasos(contexto: Contexto, maximo: int = 60) -> list[dict]:
    salida: list[dict] = []
    try:
        for i, documento in enumerate(contexto.documentos):
            for linea in documento.splitlines():
                m = LINEA_PASO.match(linea)
                if m and len(m.group(2).strip()) > 8:
                    salida.append({"doc": i, "n": int(m.group(1)), "texto": m.group(2).strip()[:200]})
                    if len(salida) >= maximo:
                        return salida
    except Exception:
        return salida
    return salida


# Listas con viñetas y el título de su sección («Materiales», «Consejos», «Técnicas»…). La app saca
# de ellas los materiales y las técnicas que recomiendan las webs (src/datos/pasos.ts).
LINEA_LISTA = re.compile(r"^\s*[-*•+]\s+(.+)$")
ENCABEZADO = re.compile(r"^\s*(#{1,6}\s+.{3,90}|\*\*[^*]{3,80}\*\*:?\s*|[^.\n]{3,80}:\s*)$")


def lineas_de_listas(contexto: Contexto, maximo: int = 150) -> list[dict]:
    salida: list[dict] = []
    try:
        # Primero la página de materiales: así su lista entra aunque las guías tengan muchas viñetas
        documentos = ([contexto.materiales] if contexto.materiales else []) + contexto.documentos
        for i, documento in enumerate(documentos):
            seccion = ""
            for linea in documento.splitlines():
                m = LINEA_LISTA.match(linea)
                if m:
                    texto = m.group(1).strip()
                    if 2 < len(texto) <= 160:
                        salida.append({"doc": i, "seccion": seccion, "texto": texto})
                        if len(salida) >= maximo:
                            return salida
                elif ENCABEZADO.match(linea):
                    seccion = re.sub(r"[#*:]", "", linea).strip()[:90]
    except Exception:
        return salida
    return salida


def resumen_de(contexto: Contexto, maximo: int = 1500) -> str:
    """Títulos y primeras líneas de los resultados, sin Markdown, para que la app catalogue la tarea."""
    trozos = [re.sub(r"[#*_>\[\]()`|]", " ", d.split("\n", 2)[0] + " " + d[:400]) for d in contexto.documentos]
    if contexto.enciclopedia:
        trozos.append(contexto.enciclopedia)
    return re.sub(r"\s+", " ", " ".join(trozos)).strip()[:maximo]


# ── 4b. Trámites oficiales: lista fija, sin buscador ────────────
#
# Los buscadores gratuitos bloquean a menudo al servidor y devuelven páginas de otros países.
# Para los trámites más comunes la web oficial es siempre la misma, así que se usa una lista
# fija (enlaces comprobados): gratis, sin cuenta, al instante y siempre de España.


@dataclass
class Tramite:
    patron: re.Pattern
    objeto: str
    url: str
    nombre: str


TRAMITES_OFICIALES = [
    Tramite(re.compile(r"\b(dni|pasaporte|carnet de identidad|documento de identidad)\b"), "la web de cita previa del DNI y el pasaporte",
            "https://www.citapreviadnie.es/", "Cita previa del DNI y el pasaporte (Policía Nacional)"),
    Tramite(re.compile(r"\b(sepe|paro|desempleo|prestacion|subsidio)\b"), "la web de cita previa del SEPE",
            "https://sede.sepe.gob.es/portalSede/procedimientos-y-servicios/personas/proteccion-por-desempleo/cita-previa.html",
            "Cita previa del SEPE"),
    Tramite(re.compile(r"\b(vida laboral|seguridad social|numero de afiliacion|importass)\b"), "el portal Importass de la Seguridad Social",
            "https://portal.seg-social.gob.es/wps/portal/importass/importass", "Portal Importass de la Seguridad Social"),
    Tramite(re.compile(r"\b(hacienda|agencia tributaria|irpf|borrador de la renta|modelo \d{3})\b"), "la sede de la Agencia Tributaria",
            "https://sede.agenciatributaria.gob.es/", "Sede de la Agencia Tributaria"),
    Tramite(re.compile(r"\b(dgt|multa|multas|itv|permiso de conducir|carnet de conducir|transferencia del coche)\b"), "la sede de la DGT",
            "https://sede.dgt.gob.es/es/", "Sede electrónica de la DGT"),
    Tramite(re.compile(r"\b(nie|tie|extranjeria|toma de huellas)\b"), "la web de cita previa de extranjería",
            "https://icp.administracionelectronica.gob.es/icpplus/index.html", "Cita previa de extranjería"),
    Tramite(re.compile(r"\b(clave pin|clave permanente|cl ve)\b"), "la web de Cl@ve", "https://clave.gob.es/", "Cl@ve"),
]


def tramite_oficial(tarea: str) -> Tramite | None:
    texto = normalizar(tarea)
    return next((t for t in TRAMITES_OFICIALES if t.patron.search(texto)), None)


def buscar_guia(tarea: str) -> tuple[str, str, dict] | None:
    """Solo understood.org (estrategia de arranque), con límite de tiempo."""
    try:
        return asyncio.run(asyncio.wait_for(_buscar_understood(tarea), timeout=20))
    except Exception:
        return None


def micro_paso_tramite(tarea: str, esfuerzo: str, tramite: Tramite) -> dict:
    o = tramite.objeto
    paso = {"pesado": f"Solo abre {o}", "medio": f"Entra en {o}", "ligero": f"Lee la primera pantalla de {o}"}[esfuerzo]
    guia = buscar_guia(tema_de(tarea))
    texto_guia, url_guia, diag_guia = guia or ("", "", {"error": "sin resultados"})
    contexto = Contexto(titulo=tramite.nombre, documentos=[], fuentes=[tramite.url], tipo_busqueda="Trámites",
                        guia=texto_guia, url_guia=url_guia)
    return respuesta(
        "success",
        tarea_original=tarea,
        contexto=tramite.nombre,
        micro_paso=f"{paso}.",
        categoria="Trámites",
        objeto=o,
        tipo_objeto="digital",
        origen="oficial",
        enlace=tramite.url,
        verbo_tarea=verbo_de_tarea(tarea),
        verbo_accion="Entra en",
        # Un trámite se hace con el móvil o el ordenador: independiente del lugar
        requiere_lugar=False,
        lugar_probable="cualquiera",
        estrategia=elegir_estrategia(contexto),
        fuente_estrategia=url_guia or None,
        fuentes=[tramite.url] + ([url_guia] if url_guia else []),
        diagnostico={"web": {"tipo": "Trámites", "lista_fija": tramite.nombre}, "understood": diag_guia},
    )



# ── 5. Orquestación ─────────────────────────────────────────────


def procesar_tarea(tarea: str, esfuerzo: str = "medio") -> dict:
    """Punto de entrada: seguridad → comprensión → trámite oficial o búsqueda (≤ 30 s) → micro-paso."""
    try:
        tarea = (tarea or "").strip()[:200]
        esfuerzo = esfuerzo if esfuerzo in NIVELES else "medio"
        bloqueo = filtrar_seguridad(tarea)
        if bloqueo:
            return bloqueo
        error = comprobar_comprension(tarea)
        if error:
            return error
        tramite = tramite_oficial(tarea)
        if tramite:
            return micro_paso_tramite(tarea, esfuerzo, tramite)
        contexto = buscar_contexto(tema_de(tarea))
        return generar_micro_paso(tarea, esfuerzo, contexto)
    except Exception:
        # La app nunca se rompe: reto universal de emergencia (cumple las reglas de redacción)
        tema = tema_de(tarea) if tarea else "lo que quieres empezar"
        return respuesta(
            "success",
            tarea_original=tarea,
            contexto=tema,
            micro_paso=f"Solo abre en el móvil la web de {tema}.",
            categoria="Otro",
            objeto=f"la web de {tema}",
            tipo_objeto="digital",
            origen="emergencia",
        )


# ── 6. Función HTTP de Vercel ───────────────────────────────────


class handler(BaseHTTPRequestHandler):  # noqa: N801 (nombre que exige Vercel)
    def _enviar(self, codigo: int, cuerpo: dict) -> None:
        datos = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(datos)))
        self.end_headers()
        self.wfile.write(datos)

    def do_POST(self) -> None:  # noqa: N802
        try:
            largo = min(int(self.headers.get("Content-Length") or 0), 4096)
            pedido = json.loads(self.rfile.read(largo) or b"{}")
        except Exception:
            self._enviar(400, respuesta("incomprehensible", mensaje=MENSAJE_INCOMPRENSIBLE))
            return
        tarea = str(pedido.get("tarea", ""))
        esfuerzo = str(pedido.get("esfuerzo", "medio"))
        self._enviar(200, procesar_tarea(tarea, esfuerzo))

    def do_GET(self) -> None:  # noqa: N802
        self._enviar(405, {"status": "error", "mensaje": "Usa POST con {\"tarea\": …, \"esfuerzo\": …}"})


if __name__ == "__main__":  # prueba local: python api/micro_paso.py "Hacer test autoescuela" pesado
    import sys

    print(json.dumps(procesar_tarea(sys.argv[1] if len(sys.argv) > 1 else "Hacer test autoescuela", sys.argv[2] if len(sys.argv) > 2 else "pesado"), ensure_ascii=False, indent=2))
