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
    if es_galimatias(tarea) or not tiene_verbo(tarea):
        return respuesta("incomprehensible", mensaje=MENSAJE_INCOMPRENSIBLE)
    return None


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
    regla = FUENTES_CONFIANZA.get(tipo, {})
    pais = " España" if tipo == "Trámites" else ""
    consultas = [_consultar(f"cómo {tarea}{pais} primer paso", limit=10, blocked_domains=DOMINIOS_BLOQUEADOS + [UNDERSTOOD], timeout=12.0)]
    if regla.get("dominios"):
        # «site:» en la consulta: así el buscador ya devuelve páginas de las sedes oficiales
        sitios = " OR ".join(f"site:{d}" for d in regla["dominios"])
        consultas.append(_consultar(f"{tarea} ({sitios})", limit=10, allowed_domains=regla["dominios"], timeout=12.0))
    respuestas = await asyncio.gather(*consultas)

    vistos, confianza, resto = set(), [], []
    descartes = {"repetido": 0, "bloqueado": 0, "idioma": 0, "otro_pais": 0, "no_habla_de_la_tarea": 0}
    for hits, _ in reversed(respuestas):  # primero la búsqueda en dominios de confianza
        for h in hits:
            motivo = (
                "repetido" if h.url in vistos
                else "bloqueado" if bloqueado(h.url)
                else "idioma" if not en_espanol(h)
                else "otro_pais" if tipo == "Trámites" and OTRO_PAIS.search(h.url.lower() + " " + normalizar(f"{h.title} {h.snippet or ''}"))
                else "no_habla_de_la_tarea" if not habla_de(h, claves, necesarias)
                else None
            )
            if motivo:
                descartes[motivo] += 1
                continue
            vistos.add(h.url)
            (confianza if de_confianza(h, tipo) else resto).append(h)
    elegidos = (confianza + resto)[:4]
    diagnostico = {
        "tipo": tipo,
        "general": respuestas[0][1],
        "confianza": respuestas[1][1] if len(respuestas) > 1 else None,
        "validos": len(confianza) + len(resto),
        "de_confianza": len(confianza),
        "descartes": descartes,
    }
    if not elegidos:
        return "", [], [], diagnostico

    # Se leen hasta 3 páginas a la vez: cada una es un documento independiente
    paginas = await asyncio.gather(*(_leer(h.url) for h in elegidos[:3]))
    documentos = [f"{h.title}. {h.snippet or ''}\n{p[0]}" for h, p in zip(elegidos, list(paginas) + [("", "")] * 4)]
    titulo = paginas[0][1] or elegidos[0].title
    return titulo, documentos, [h.url for h in elegidos], diagnostico


ENLACE_UNDERSTOOD = re.compile(r"https://www\.understood\.org/es-mx/[a-z0-9/\-]+")
TEMAS_ARRANQUE = re.compile(r"(empez|comenzar|tarea|funcion.ejecutiva|executive.function|procrastin|motiva|organiz|concentr|tdah|adhd|atencion)")
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


async def _buscar(tarea: str) -> Contexto:
    """Las dos búsquedas a la vez: web general (qué es la tarea) y understood.org (cómo arrancar)."""
    tipo = tipo_de_busqueda(tarea)
    general, guia = await asyncio.gather(_buscar_general(tarea, tipo), _buscar_understood(tarea), return_exceptions=True)
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
        fuentes=fuentes + ([url_guia] if url_guia else []),
        tipo_busqueda=tipo,
        guia=texto_guia,
        url_guia=url_guia,
        diagnostico={"web": diag_general, "understood": diag_guia},
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
ESTUDIO = frozenset({"Estudio", "Autoescuela", "Otro"})
CASA = frozenset({"Casa"})


HERRAMIENTAS = [
    Herramienta(re.compile(r"\btests?\b"), "la app de {tema}", "digital", frozenset({"Autoescuela", "Estudio"})),
    Herramienta(re.compile(r"\b(app|apps|aplicacion|aplicaciones)\b"), "la app de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\bsede electronica\b"), "la sede electrónica de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\bcita previa\b"), "la web de cita previa", "digital", DIGITALES),
    Herramienta(re.compile(r"\b(formulario|impreso|solicitud|modelo \d{3})\b"), "el formulario de {tema}", "digital", DIGITALES),
    Herramienta(re.compile(r"\b(libro|manual|temario)\b"), "el libro de {tema}", "fisico", ESTUDIO),
    Herramienta(re.compile(r"\b(apuntes|cuaderno|libreta)\b"), "los apuntes de {tema}", "fisico", ESTUDIO),
    Herramienta(re.compile(r"\b(documento|pdf)\b"), "el documento de {tema}", "digital", DIGITALES),
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
}
PRIMER_PASO = re.compile(r"(primer paso|lo primero|paso 1|^\s*1[.)]\s)", re.M)
CATEGORIAS = [
    ("Estudio", r"\b(examen|test|estudiar|temario|autoescuela|oposicion\w*|tema \d+|carnet)\b"),
    ("Trámites", r"\b(dni|pasaporte|hacienda|renta|cita previa|seguridad social|empadron\w*|tramite\w*|certificado|sepe|paro|prestacion|subsidio|nie|tarjeta sanitaria)\b"),
    ("Casa", r"\b(limpiar|cocina|fregar|ropa|lavadora|barrer|ordenar|bano)\b"),
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
        coincidencias = sum(bool(h.patron.search(d)) for d in documentos)
        if coincidencias:
            recuento[h.objeto.split(" de ")[0]] = coincidencias
        if not nombrada and coincidencias < MIN_COINCIDENCIAS:
            continue
        puntos = 10 * nombrada + coincidencias
        if puntos > puntos_mejor:
            mejor, puntos_mejor = h, puntos
    return mejor, recuento


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
        validos = {"Coge", "Abre", "Moja"}
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

    return respuesta(
        "success",
        tarea_original=tarea,
        contexto=contexto_corto(contexto, tema),
        micro_paso=f"{paso}.",
        categoria=categoria_de(tarea, contexto if contexto.titulo else None),
        objeto=objeto,
        tipo_objeto=tipo,
        origen="web" if contexto.documentos else "respaldo",
        estrategia=elegir_estrategia(contexto),
        fuente_estrategia=contexto.url_guia or None,
        fuentes=contexto.fuentes,
        diagnostico=contexto.diagnostico,
    )


# ── 5. Orquestación ─────────────────────────────────────────────


def procesar_tarea(tarea: str, esfuerzo: str = "medio") -> dict:
    """Punto de entrada: seguridad → comprensión → búsqueda (≤ 30 s) → micro-paso."""
    try:
        tarea = (tarea or "").strip()[:200]
        esfuerzo = esfuerzo if esfuerzo in NIVELES else "medio"
        bloqueo = filtrar_seguridad(tarea)
        if bloqueo:
            return bloqueo
        error = comprobar_comprension(tarea)
        if error:
            return error
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
        self._enviar(200, procesar_tarea(str(pedido.get("tarea", "")), str(pedido.get("esfuerzo", "medio"))))

    def do_GET(self) -> None:  # noqa: N802
        self._enviar(405, {"status": "error", "mensaje": "Usa POST con {\"tarea\": …, \"esfuerzo\": …}"})


if __name__ == "__main__":  # prueba local: python api/micro_paso.py "Hacer test autoescuela" pesado
    import sys

    print(json.dumps(procesar_tarea(sys.argv[1] if len(sys.argv) > 1 else "Hacer test autoescuela", sys.argv[2] if len(sys.argv) > 2 else "pesado"), ensure_ascii=False, indent=2))
