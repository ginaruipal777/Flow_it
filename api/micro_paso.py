"""
Flow it! · Generador de micro-pasos con búsqueda web (función de Python en Vercel).

POST /api/micro_paso   {"tarea": "Hacer test autoescuela", "esfuerzo": "pesado"}

Busca en internet cómo se empieza la tarea (librería `webless`, sin claves de API) y
devuelve SOLO el primer paso físico: nunca el proceso entero, para no abrumar.
Todo el análisis es local y determinista (expresiones regulares, sin IA generativa).

Respuestas (JSON estricto):
  success           → {"status", "tarea_original", "contexto", "micro_paso", "categoria", "objeto", "tipo_objeto", "origen"}
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
from dataclasses import dataclass
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


@dataclass
class Contexto:
    titulo: str
    texto: str  # snippets + página en Markdown


async def _buscar(tarea: str) -> Contexto:
    from webless import fetch, search  # importación tardía: si falta la librería, salta el respaldo

    resultado = await search(f"{tarea} primer paso cómo empezar", limit=3, timeout=12.0)
    hits = list(resultado.hits)[:3]
    if not hits:
        raise LookupError("La búsqueda no devolvió resultados")
    snippets = "\n".join(f"{h.title}. {h.snippet or ''}" for h in hits)
    try:
        pagina = await fetch(hits[0].url, format="markdown", max_chars=MAX_CARACTERES_PAGINA)
        contenido, titulo = pagina.content or "", pagina.title or hits[0].title
    except Exception:  # la página puede bloquear: con los snippets basta
        contenido, titulo = "", hits[0].title
    return Contexto(titulo=titulo or "", texto=f"{snippets}\n{contenido}")


def buscar_contexto(tarea: str) -> Contexto | None:
    """Búsqueda + lectura con un límite total de LIMITE_SEGUNDOS. None si falla o tarda más."""
    try:
        return asyncio.run(asyncio.wait_for(_buscar(tarea), timeout=LIMITE_SEGUNDOS))
    except Exception:
        return None


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


@dataclass
class Herramienta:
    patron: re.Pattern
    objeto: str  # {tema} se sustituye por el tema de la tarea
    tipo: str  # "digital" o "fisico"


HERRAMIENTAS = [
    Herramienta(re.compile(r"\b(app|apps|aplicacion|aplicaciones)\b"), "la app de {tema}", "digital"),
    Herramienta(re.compile(r"\bsede electronica\b"), "la sede electrónica de {tema}", "digital"),
    Herramienta(re.compile(r"\bcita previa\b"), "la web de cita previa", "digital"),
    Herramienta(re.compile(r"\b(formulario|impreso|solicitud|modelo \d{3})\b"), "el formulario de {tema}", "digital"),
    Herramienta(re.compile(r"\b(libro|manual|temario)\b"), "el libro de {tema}", "fisico"),
    Herramienta(re.compile(r"\b(apuntes|cuaderno|libreta)\b"), "los apuntes de {tema}", "fisico"),
    Herramienta(re.compile(r"\b(documento|pdf)\b"), "el documento de {tema}", "digital"),
    Herramienta(re.compile(r"\b(fregona|fregar el suelo)\b"), "la fregona", "fisico"),
    Herramienta(re.compile(r"\b(escoba|barrer)\b"), "la escoba", "fisico"),
    Herramienta(re.compile(r"\baspiradora\b"), "la aspiradora", "fisico"),
    Herramienta(re.compile(r"\b(bayeta|trapo|estropajo)\b"), "la bayeta", "fisico"),
    Herramienta(re.compile(r"\b(lavavajillas|platos)\b"), "el primer plato del fregadero", "fisico"),
    Herramienta(re.compile(r"\b(web|pagina web|portal|plataforma|online)\b"), "la web de {tema}", "digital"),
]

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
    ("Trámites", r"\b(dni|pasaporte|hacienda|renta|cita previa|seguridad social|empadron\w*|tramite\w*|certificado)\b"),
    ("Casa", r"\b(limpiar|cocina|fregar|ropa|lavadora|barrer|ordenar|bano)\b"),
    ("Salud", r"\b(medico|dentista|farmacia|receta|centro de salud|vacuna)\b"),
    ("Trabajo", r"\b(correo|email|informe|curriculum|cv|reunion|cliente|factura)\b"),
]
PROHIBIDO_EN_PASO = re.compile(
    r"\b(minutos?|segundos?|horas?|rapido|deprisa|haz|hacer|tarea|primera parte)\b|\s(y|o)\s", re.I
)


def elegir_herramienta(tarea: str, contexto: Contexto | None) -> Herramienta | None:
    """La herramienta más citada (la tarea cuenta 5 veces más que la web)."""
    en_tarea = normalizar(tarea)
    en_web = normalizar(contexto.texto) if contexto else ""
    mejor, puntos_mejor = None, 0
    for h in HERRAMIENTAS:
        puntos = 5 * len(h.patron.findall(en_tarea)) + len(h.patron.findall(en_web))
        if puntos > puntos_mejor:
            mejor, puntos_mejor = h, puntos
    return mejor


def verbo_del_primer_paso(contexto: Contexto | None) -> str | None:
    """Busca la frase del primer paso en la guía y se queda solo con su verbo físico."""
    if not contexto:
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


def contexto_corto(contexto: Contexto | None, tema: str) -> str:
    if not contexto or not contexto.titulo:
        return tema
    titulo = re.split(r"\s[|\-–—:]\s", contexto.titulo)[0].strip()
    return titulo[:60] or tema


def generar_micro_paso(tarea: str, esfuerzo: str, contexto: Contexto | None) -> dict:
    """Extrae UN micro-paso físico calibrado por el esfuerzo. Nunca el proceso entero."""
    tema = tema_de(tarea)
    herramienta = elegir_herramienta(tarea, contexto)
    if herramienta:
        objeto, tipo = herramienta.objeto.format(tema=tema), herramienta.tipo
    else:
        objeto, tipo = f"la web de {tema}", "digital"

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
        categoria=categoria_de(tarea, contexto),
        objeto=objeto,
        tipo_objeto=tipo,
        origen="web" if contexto else "respaldo",
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
