# -*- coding: utf-8 -*-
"""
DISC GESEM — Análisis de Especificaciones y Gap Analysis.
Vuelca lo que piden los 11 PDFs de especificación del cliente y lo compara
con la implementación real del proyecto, marcando qué falta.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether, Flowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os, datetime

# ── Colores ───────────────────────────────────────────────────────────────────
INDIGO    = colors.HexColor("#6366f1")
VIOLET    = colors.HexColor("#8b5cf6")
FUCHSIA   = colors.HexColor("#d946ef")
SLATE_900 = colors.HexColor("#0f172a")
SLATE_700 = colors.HexColor("#334155")
SLATE_500 = colors.HexColor("#64748b")
SLATE_200 = colors.HexColor("#e2e8f0")
SLATE_50  = colors.HexColor("#f8fafc")
WHITE     = colors.white
GREEN     = colors.HexColor("#059669")
GREEN_BG  = colors.HexColor("#d1fae5")
AMBER     = colors.HexColor("#b45309")
AMBER_BG  = colors.HexColor("#fef3c7")
RED       = colors.HexColor("#dc2626")
RED_BG    = colors.HexColor("#fee2e2")
INDIGO_LIGHT = colors.HexColor("#eef2ff")
VIOLET_LIGHT = colors.HexColor("#f5f3ff")

W, H = A4
CONTENT_W = W - 4*cm
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "disc-gesem-analisis-especificaciones.pdf")

base = getSampleStyleSheet()
def st(name, parent="Normal", **kw):
    return ParagraphStyle(name, parent=base[parent], **kw)

S = {
    "cover_title": st("ct", fontSize=28, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=33),
    "cover_sub":   st("cs", fontSize=13, textColor=colors.HexColor("#c7d2fe"), alignment=TA_CENTER, leading=18),
    "cover_meta":  st("cm", fontSize=10, textColor=colors.HexColor("#a5b4fc"), alignment=TA_CENTER, leading=15),
    "h2":   st("h2", fontSize=13, fontName="Helvetica-Bold", textColor=INDIGO, spaceAfter=5, spaceBefore=12, leading=16),
    "h3":   st("h3", fontSize=10.5, fontName="Helvetica-Bold", textColor=SLATE_700, spaceAfter=3, spaceBefore=8, leading=13),
    "body": st("body", fontSize=9.5, textColor=SLATE_700, leading=14, spaceAfter=4),
    "body_sm": st("bsm", fontSize=8.3, textColor=SLATE_500, leading=11, spaceAfter=2),
    "bullet": st("bul", fontSize=9, textColor=SLATE_700, leading=13, leftIndent=12, spaceAfter=2),
    "cell":  st("cell", fontSize=8, textColor=SLATE_700, leading=10.5),
    "cell_b":st("cellb", fontSize=8, textColor=SLATE_900, leading=10.5, fontName="Helvetica-Bold"),
    "cell_w":st("cellw", fontSize=8, textColor=WHITE, leading=10.5, fontName="Helvetica-Bold"),
    "quote": st("quote", fontSize=9, textColor=SLATE_700, leading=14, leftIndent=10, rightIndent=10,
                fontName="Helvetica-Oblique", spaceAfter=4, spaceBefore=2),
    "status":st("status", fontSize=7.5, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=9),
}

# ── Flowables ─────────────────────────────────────────────────────────────────
class SectionHeader(Flowable):
    def __init__(self, num, title, color=INDIGO):
        Flowable.__init__(self); self.num=num; self.title=title; self.color=color
    def wrap(self, aw, ah): return (aw, 30)
    def draw(self):
        c=self.canv
        c.setFillColor(self.color); c.circle(10,8,10,fill=1,stroke=0)
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold",9); c.drawCentredString(10,5,str(self.num))
        c.setFillColor(SLATE_900); c.setFont("Helvetica-Bold",15); c.drawString(26,3,self.title)
        c.setStrokeColor(self.color); c.setLineWidth(1.5); c.line(0,-5,CONTENT_W,-5)

def section(num,title,color=INDIGO):
    return KeepTogether([Spacer(1,0.25*cm), SectionHeader(num,title,color), Spacer(1,0.35*cm)])

def h2(t): return Paragraph(t,S["h2"])
def h3(t): return Paragraph(t,S["h3"])
def p(t):  return Paragraph(t,S["body"])
def small(t): return Paragraph(t,S["body_sm"])
def bullet(t): return Paragraph("• "+t,S["bullet"])
def quote(t): return Paragraph("“"+t+"”",S["quote"])

def status_chip(kind):
    """kind: ok | partial | missing | future"""
    m = {
        "ok":     ("HECHO",   GREEN, GREEN_BG),
        "partial":("PARCIAL", AMBER, AMBER_BG),
        "missing":("FALTA",   RED,   RED_BG),
        "future": ("V2",      SLATE_500, SLATE_50),
    }
    label, fg, bg = m[kind]
    t = Table([[Paragraph(label, ParagraphStyle("x", fontSize=7.5, fontName="Helvetica-Bold",
              textColor=fg, alignment=TA_CENTER, leading=9))]], colWidths=[1.7*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg), ("BOX",(0,0),(-1,-1),0.5,fg),
        ("TOPPADDING",(0,0),(-1,-1),2.5),("BOTTOMPADDING",(0,0),(-1,-1),2.5),
        ("LEFTPADDING",(0,0),(-1,-1),2),("RIGHTPADDING",(0,0),(-1,-1),2),
    ]))
    return t

def C(t, bold=False): return Paragraph(t, S["cell_b"] if bold else S["cell"])

def gap_table(rows, widths):
    """rows: [ [req_text, status_kind, detail_text], ... ]  widths: [w1,w2,w3]"""
    data=[[Paragraph("Requisito de la especificación",S["cell_w"]),
           Paragraph("Estado",S["cell_w"]),
           Paragraph("Implementación real / qué falta",S["cell_w"])]]
    for req,kind,detail in rows:
        data.append([C(req,bold=True), status_chip(kind), C(detail)])
    t=Table(data,colWidths=widths,repeatRows=1)
    style=[
        ("BACKGROUND",(0,0),(-1,0),INDIGO),
        ("FONTSIZE",(0,0),(-1,-1),8),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("ALIGN",(1,0),(1,-1),"CENTER"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,SLATE_50]),
        ("GRID",(0,0),(-1,-1),0.4,SLATE_200),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]
    t.setStyle(TableStyle(style))
    return t

def simple_table(headers, rows, widths):
    data=[[Paragraph(h,S["cell_w"]) for h in headers]]
    for r in rows:
        data.append([C(str(x)) for x in r])
    t=Table(data,colWidths=widths,repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),INDIGO),
        ("FONTSIZE",(0,0),(-1,-1),8),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,SLATE_50]),
        ("GRID",(0,0),(-1,-1),0.4,SLATE_200),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("TOPPADDING",(0,0),(-1,-1),4.5),("BOTTOMPADDING",(0,0),(-1,-1),4.5),
    ]))
    return t

# ── Portada ───────────────────────────────────────────────────────────────────
def cover():
    items=[]
    today = datetime.date.today().strftime("%d/%m/%Y")
    content=[
        Spacer(1,2.6*cm),
        Paragraph("DISC GESEM V1",S["cover_title"]),
        Spacer(1,0.3*cm),
        Paragraph("Análisis de Especificaciones y Gap Analysis",S["cover_sub"]),
        Spacer(1,0.4*cm),
        Paragraph("Qué pide el cliente en los documentos · Qué está implementado · Qué falta",S["cover_meta"]),
        Spacer(1,1.1*cm),
        Paragraph(f"11 documentos de especificación analizados · {today}",S["cover_meta"]),
        Paragraph("Uso interno GESEM · Confidencial",S["cover_meta"]),
    ]
    ct=Table([[content]],colWidths=[CONTENT_W],rowHeights=[H*0.5])
    ct.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),INDIGO),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),1.6*cm),("RIGHTPADDING",(0,0),(-1,-1),1.6*cm),
        ("TOPPADDING",(0,0),(-1,-1),0),("BOTTOMPADDING",(0,0),(-1,-1),0)]))
    items.append(ct)
    band=Table([[""]],colWidths=[CONTENT_W],rowHeights=[0.22*cm])
    band.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),FUCHSIA)])); items.append(band)
    items.append(Spacer(1,0.9*cm))

    # Veredicto global
    items.append(Paragraph("Veredicto global por módulo",S["h2"]))
    items.append(Spacer(1,0.2*cm))
    verdict=[
        ["Módulo","Cumplimiento","Estado"],
    ]
    rows=[
        ("Motor de cálculo (scoring DISC)","95%","ok"),
        ("Almacenamiento de resultados","100%","ok"),
        ("Informe individual (8 bloques)","85%","partial"),
        ("Biblioteca de insights","85%","ok"),
        ("Mapa de equipo (10 pantallas)","70%","partial"),
        ("Motor de narrativas en BD","20%","missing"),
    ]
    data=[[Paragraph(x,S["cell_w"]) for x in verdict[0]]]
    for name,pct,kind in rows:
        data.append([C(name,bold=True), C(pct), status_chip(kind)])
    t=Table(data,colWidths=[8.5*cm,4*cm,4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),INDIGO),
        ("FONTSIZE",(0,0),(-1,-1),9),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("ALIGN",(1,0),(2,-1),"CENTER"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,SLATE_50]),
        ("GRID",(0,0),(-1,-1),0.4,SLATE_200),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    items.append(t)
    items.append(Spacer(1,0.5*cm))
    items.append(small(
        "El motor de cálculo y el guardado de datos cumplen la especificación. El informe individual y el mapa de "
        "equipo están construidos casi por completo, con detalles pendientes. El punto débil real y prioritario es "
        "que <b>las narrativas y contenidos están escritos en código (hardcoded) en lugar de vivir en base de datos "
        "editable</b>, lo que contradice un principio explícito del cliente."))
    items.append(PageBreak())
    return items

# ── Contenido ─────────────────────────────────────────────────────────────────
def build():
    s=[]
    s+=cover()

    # 1. DOCUMENTOS ANALIZADOS
    s.append(section(1,"Documentos de Especificación Analizados"))
    s.append(p("Se han leído y analizado los 11 documentos de especificación que definen el alcance funcional y "
               "técnico del producto. Estos son los requisitos del cliente frente a los que se ha auditado el código:"))
    s.append(Spacer(1,0.2*cm))
    docs=[
        ["Documento","Define"],
        ["Motor de Ponderación","Reglas de puntuación Más/Menos, acumulación D/I/S/C, porcentajes, perfil, EQ, intensidad, JSON de resultado"],
        ["Motor de Cálculo","Niveles de cálculo: brutos, normalización, perfil principal, regla EQ, intensidad, contextos, prioridad de narrativas"],
        ["Catálogo Oficial de Perfiles","Nombres oficiales: 4 estilos (Impulsar/Conectar/Sostener/Estructurar) + 12 combinaciones + EQ, editables desde admin"],
        ["Esp. Funcional Informe Individual","8 bloques del informe individual y su contenido"],
        ["Wireframe Informe Individual","11 pantallas de la experiencia de lectura del participante (5-8 min)"],
        ["Esp. Funcional Mapa de Equipo","10 pantallas del mapa de equipo + exportaciones + datos a guardar"],
        ["Mapa de Equipo Avanzado","Versión ampliada del mapa: distribución, fortalezas/riesgos, vacíos, plan de acción"],
        ["Wireframe Mapa de Equipo","10 pantallas del mapa de equipo orientado a RRHH (lectura en 3 min)"],
        ["Biblioteca de Insights Automáticos","Catálogo de insights individuales, de intensidad, contextuales y de equipo"],
        ["Motor de Narrativas y Contenidos","Arquitectura de 3 capas, contenidos en BD (nunca hardcoded), versionado"],
        ["Manual del Facilitador","Principios, fases del taller y uso no-clasificatorio de los resultados"],
    ]
    s.append(simple_table(docs[0],docs[1:],[5*cm,11.5*cm]))
    s.append(Spacer(1,0.2*cm))
    s.append(small("Principio rector común a todos los documentos: el sistema mide <b>tendencias conductuales</b>, "
                   "no clasifica ni diagnostica. El usuario no debe terminar pensando \"soy un DI\", sino "
                   "\"comprendo mejor qué recursos utilizo\"."))

    # 2. MOTOR DE CÁLCULO
    s.append(PageBreak())
    s.append(section(2,"Motor de Cálculo (Scoring DISC)", GREEN))
    s.append(p("<b>Qué pide la especificación:</b> transformar las respuestas Más/Menos en puntuaciones D/I/S/C, "
               "perfil principal, intensidad, perfil EQ y resultados por contexto, de forma determinista."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Más = +1 al estilo, Menos = −1, no seleccionadas = 0","ok",
         "Implementado en el instrumento (mostValue:1, leastValue:−1, unselectedValue:0)."),
        ("Normalización a porcentaje (suma = 100%)","ok",
         "scoring.ts desplaza valores (raw−min+1) y reparte sobre el total. Test verifica suma 100%."),
        ("Perfil principal = 2 dimensiones más altas (ej. DI)","ok",
         "Ordena dimensiones por puntuación y asigna primaria + secundaria."),
        ("Regla EQ cuando el rango es muy reducido","ok",
         "Umbral eqRangeThreshold = 4: si (máx−mín) ≤ 4 → perfil EQ, sin combinación."),
        ("Intensidad = diferencia entre 1ª y 2ª dimensión","partial",
         "Calculada, PERO los umbrales del código (Moderada 5−11 / Definida 12−21 / Muy definida 22+) NO coinciden "
         "con los de la spec (Moderada 5−9 / Definida 10−14 / Muy definida 15+). Hay que alinearlos."),
        ("Resultados por contexto","ok",
         "7 contextos en el instrumento (Decisión, Ejecución, Comunicación, Colaboración, Cambio, Conflicto, "
         "Organización), coherente con la spec del motor. El informe los resume a 5 contextos de lectura."),
        ("Determinismo: mismas respuestas → mismo resultado","ok",
         "Función de scoring pura, sin aleatoriedad. Cubierto con tests (Vitest)."),
    ],[6.2*cm,1.9*cm,8.4*cm]))
    s.append(Spacer(1,0.2*cm))
    s.append(small("<b>Conclusión:</b> el motor es sólido y fiel a la especificación. El único ajuste pendiente es "
                   "alinear los umbrales de intensidad con la tabla oficial del cliente."))

    # 3. INFORME INDIVIDUAL
    s.append(PageBreak())
    s.append(section(3,"Informe Individual — 8 Bloques", VIOLET))
    s.append(p("<b>Qué pide la especificación:</b> transformar el resultado en una experiencia de autoconocimiento "
               "de 5−8 minutos, estructurada en 8 bloques (11 pantallas en el wireframe). El participante no debe "
               "sentir que le ponen una etiqueta."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Portada: nombre, fecha, logo, título \"Tu mapa de interacción profesional\", CTA","partial",
         "Cabecera con perfil y nombre implementada. Falta el título/subtítulo oficial y el CTA \"Ver resultados\"."),
        ("Bloque 1 — Tendencia predominante + intro 100−150 palabras","ok",
         "Report.tsx muestra el nombre de la tendencia y el texto introductorio. Perfil interno (DI/ID) oculto al usuario."),
        ("Bloque 2 — Mapa de recursos: 4 dimensiones 0−100 + texto fijo","ok",
         "Barras con puntuación por dimensión (Impulsar/Conectar/Sostener/Estructurar) + texto automático."),
        ("Bloque 3 — Mapa por contextos: 5 tarjetas","ok",
         "5 contextos (Decisiones, Comunicación, Coordinación, Desacuerdos, Cambio) con tendencia predominante."),
        ("Bloque 4 — Cuando coordinas personas: 5 subapartados","ok",
         "Indicaciones, seguimiento, coordinar personas diferentes, desacuerdo, generar compromiso."),
        ("Bloque 5 — Qué funciona bien: 3 fortalezas","ok","Tres aportaciones en tarjetas, generadas desde narrativa."),
        ("Bloque 6 — Qué observar: 3 observaciones","ok","Tres observaciones; nunca debilidades ni defectos."),
        ("Bloque 7 — Insights personalizados (máx. 3)","ok","generateInsights() devuelve hasta 3, sin repetición."),
        ("Bloque 7 — Experimento de transferencia (1 semana)","ok","Una acción concreta y observable."),
        ("Bloque 8 — Pregunta poderosa","ok","Una pregunta destacada en bloque final."),
        ("Pantalla 11 — Cierre: mensaje + CTA PDF + CTA mapa de equipo","partial",
         "Solo aparece el disclaimer. Falta el mensaje de cierre (\"El autoconocimiento es el punto de partida...\") "
         "y los dos CTA."),
        ("El participante puede ver su informe en la app","missing",
         "El informe es solo para admin/facilitador (o se envía por email). Al terminar el cuestionario, el "
         "participante NO ve sus resultados; el wireframe lo plantea como experiencia del propio participante."),
        ("Descargar informe en PDF","partial",
         "Existe botón que usa la impresión del navegador (window.print + estilos @media print). No es un PDF "
         "generado a medida; sirve, pero no es exportación nativa."),
    ],[6.2*cm,1.9*cm,8.4*cm]))

    # 4. MAPA DE EQUIPO
    s.append(PageBreak())
    s.append(section(4,"Mapa de Equipo — 10 Pantallas", VIOLET))
    s.append(p("<b>Qué pide la especificación:</b> convertir los resultados individuales en una lectura colectiva "
               "accionable, que un responsable o RRHH pueda comprender en 3 minutos, con 10 pantallas y exportaciones."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Pantalla 1 — Visión general: nombre, participantes, fecha, proyecto, unidad, KPIs","partial",
         "KPIs (participantes, completados, participación, EQ medio) y perfil predominante OK. Faltan fecha y unidad organizativa."),
        ("Pantalla 2 — Mapa de recursos colectivos (radar 4 dim)","partial",
         "Muestra barras horizontales + texto. Falta el gráfico radar/polar que pide el wireframe."),
        ("Pantalla 3 — Distribución de combinaciones (DI...EQ)","ok",
         "Lista las 13 combinaciones con nº de personas y %."),
        ("Pantalla 4 — Mapa de contextos colectivo","ok",
         "Heatmap contextos × dimensiones con % medio del equipo."),
        ("Pantalla 5 — Fortalezas colectivas (máx. 5)","ok","Generadas automáticamente, en tarjetas."),
        ("Pantalla 6 — Riesgos de coordinación (máx. 5)","ok","Generados automáticamente; lenguaje no peyorativo."),
        ("Pantalla 7 — Complementariedad","ok","Qué aporta cada recurso predominante."),
        ("Pantalla 8 — Recursos menos presentes (regla <10%)","ok","Observación automática cuando un recurso baja del 10%."),
        ("Pantalla 9 — Conversaciones recomendadas (3−5)","ok","Preguntas generadas automáticamente, sin duplicados."),
        ("Pantalla 10 — Plan de acción de equipo (campos editables)","partial",
         "Se muestra el plan generado, pero es de solo lectura. Faltan campos editables (acción, responsable, fecha, indicador)."),
        ("Índice de diversidad (Baja 1−3 / Media 4−6 / Alta 7+)","missing",
         "No se calcula el número de perfiles distintos del equipo en ningún punto."),
        ("Exportación: PDF ejecutivo / PDF facilitador / Excel / CSV","partial",
         "Hay CSV y PDF por impresión del navegador. Faltan Excel, y la diferenciación PDF ejecutivo vs facilitador."),
    ],[6.2*cm,1.9*cm,8.4*cm]))

    # 5. MOTOR DE NARRATIVAS  (crítico)
    s.append(PageBreak())
    s.append(section(5,"Motor de Narrativas y Contenidos", RED))
    s.append(p("<b>Qué pide la especificación (principio fundamental literal):</b>"))
    s.append(quote("El sistema nunca debe contener textos hardcodeados. Todas las narrativas deben recuperarse "
                   "desde una biblioteca de contenidos. Un cambio de narrativa nunca debe requerir cambios en programación."))
    s.append(p("Se exige separar la lógica de cálculo, los contenidos y la presentación en 3 capas, con narrativas "
               "editables desde administración y versionadas (versión, fecha, autor, estado)."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Narrativas almacenadas en BD, nunca hardcoded","missing",
         "Las narrativas activas viven en archivos .ts (código). Las tablas Narrative/NarrativeContent existen en el "
         "esquema pero solo guardan las dimensionales del seed; los textos de perfil e insights NO están en BD."),
        ("Cada perfil con title, intro, instructions, followup, coordination, conflict, engagement, observe[3], experiment, question","partial",
         "El contenido existe, pero se compone en código a partir de los recursos primario/secundario, no como "
         "registros editables por perfil."),
        ("Editable desde administración (/admin/catalogo)","missing",
         "La pantalla de catálogo es solo lectura. No hay formulario ni guardado de narrativas."),
        ("Versionado: versión, fecha, autor, estado","partial",
         "La BD tiene revisión/estado/fecha de creación, pero falta autor y no se usa de forma activa."),
        ("Separación 3 capas (cálculo / contenidos / presentación)","partial",
         "El cálculo está bien separado de la presentación, pero la capa de contenidos no es independiente: vive en código."),
    ],[6.2*cm,1.9*cm,8.4*cm]))
    s.append(Spacer(1,0.2*cm))
    s.append(small("<b>Por qué importa:</b> hoy, cambiar el texto de un perfil o de un insight requiere tocar código y "
                   "volver a desplegar. La especificación quiere que GESEM pueda editar contenidos sin programar, para "
                   "evolucionar narrativas, añadir IA o nuevas capas (LifeComp) sin tocar el motor. Es el gap de mayor "
                   "distancia frente a lo pedido."))

    # 6. INSIGHTS
    s.append(PageBreak())
    s.append(section(6,"Biblioteca de Insights Automáticos", GREEN))
    s.append(p("<b>Qué pide la especificación:</b> generar interpretaciones automáticas (individuales, de intensidad, "
               "contextuales y de equipo), con lenguaje no determinista, máximo 3 por pantalla, priorizando relevancia."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Insights individuales por recurso alto (Impulsar/Conectar/Sostener/Estructurar)","ok",
         "Implementados en la biblioteca de insights."),
        ("Insights de intensidad (alta / flexible)","ok","Implementados."),
        ("Insights contextuales (comunicación, desacuerdo...)","ok","Comunicación y conflicto implementados."),
        ("Insights de equipo (combinaciones, diversidad, recurso <10%)","partial",
         "Existe analítica de equipo (fortalezas, riesgos, vacíos), pero no la tabla completa de insights de equipo de la spec."),
        ("Máximo 3 insights individuales, sin repetir","ok","Se respeta el límite y se evita repetición."),
        ("Tabla de insights: ID, tipo, condición, texto, prioridad, activo, versión","missing",
         "Los insights están en código como funciones/constantes, no como tabla gestionable en BD."),
        ("Lenguaje no determinista (\"puede\", \"merece la pena observar\")","ok",
         "Los textos siguen el estilo de hipótesis exigido (alineado con las reglas de redacción del proyecto)."),
    ],[6.2*cm,1.9*cm,8.4*cm]))

    # 7. ALMACENAMIENTO
    s.append(Spacer(1,0.3*cm))
    s.append(section(7,"Almacenamiento y Datos del Sistema", GREEN))
    s.append(p("<b>Qué pide la especificación:</b> guardar siempre resultados brutos (nunca sobrescribir), "
               "resultados derivados por separado y preparar estructura para reevaluaciones (histórico)."))
    s.append(Spacer(1,0.2*cm))
    s.append(gap_table([
        ("Resultados brutos D/I/S/C guardados siempre","ok",
         "Cada evaluación crea ResponseSet + Result + ResultDimensionScore con valores raw y percent."),
        ("Nunca sobrescribir resultados","ok",
         "Los registros son inmutables; cada invitación genera un conjunto nuevo."),
        ("Resultados derivados (perfil, intensidad, contextos) por separado","ok",
         "Perfil, EQ, dimensión primaria/secundaria y puntuaciones por contexto se guardan en tablas propias."),
        ("Estructura para reevaluaciones / histórico","partial",
         "El modelo soporta varios resultados por participante (histórico posible), pero no hay UI de reevaluación "
         "ni comparación entre evaluaciones."),
        ("Preparación V2 (capacidades, LifeComp, recomendaciones)","future",
         "Pendiente por diseño; la spec lo marca como preparación futura, no como entrega V1."),
    ],[6.2*cm,1.9*cm,8.4*cm]))

    # 8. LO QUE FALTA — PRIORIZADO
    s.append(PageBreak())
    s.append(section(8,"Lo Que Falta — Plan Priorizado", RED))
    s.append(p("Resumen accionable de todo lo pendiente frente a la especificación, ordenado por prioridad. "
               "P0 = crítico (contradice un principio del cliente), P1 = alto (afecta a la experiencia entregada), "
               "P2 = medio (pulido), V2 = fuera del alcance V1."))
    s.append(Spacer(1,0.25*cm))

    s.append(h3("P0 — Crítico"))
    s.append(simple_table(["Pendiente","Impacto"],[
        ["Migrar narrativas e insights de código a BD editable",
         "Es el principio fundamental del cliente: editar contenidos sin programar. Hoy todo está hardcoded."],
        ["Edición de narrativas/insights desde /admin/catalogo",
         "Hoy la pantalla es solo lectura. Sin esto, GESEM no puede mantener los textos por su cuenta."],
    ],[7*cm,9.5*cm]))
    s.append(Spacer(1,0.25*cm))

    s.append(h3("P1 — Alto"))
    s.append(simple_table(["Pendiente","Impacto"],[
        ["El participante pueda ver su propio informe en la app",
         "El wireframe es una experiencia del participante; hoy solo lo ve el admin o llega por email."],
        ["Completar pantalla de cierre del informe (mensaje + 2 CTA)",
         "Falta el cierre \"El autoconocimiento es el punto de partida...\" y los botones PDF / mapa de equipo."],
        ["Calcular índice de diversidad del equipo (Baja/Media/Alta)",
         "KPI exigido en la visión general del mapa de equipo; hoy no se calcula."],
        ["Plan de acción de equipo editable (no solo lectura)",
         "La pantalla 10 pide campos editables (acción, responsable, fecha, indicador)."],
        ["Generación real de PDF (informe y mapa)",
         "Hoy se usa la impresión del navegador. La spec pide PDF ejecutivo y PDF facilitador."],
    ],[7*cm,9.5*cm]))
    s.append(Spacer(1,0.25*cm))

    s.append(h3("P2 — Medio (pulido)"))
    s.append(simple_table(["Pendiente","Impacto"],[
        ["Alinear umbrales de intensidad con la tabla oficial","Coherencia con la spec (Moderada 5−9 / Definida 10−14 / Muy definida 15+)."],
        ["Gráfico radar en el mapa de recursos del equipo","El wireframe pide radar; hoy son barras horizontales."],
        ["Exportación a Excel + diferenciación PDF ejecutivo/facilitador","Hoy solo CSV + impresión."],
        ["Fecha y unidad organizativa en la visión general del equipo","Campos de cabecera que faltan."],
        ["Título/subtítulo y CTA oficiales en la portada del informe","Detalle de marca del wireframe."],
    ],[7*cm,9.5*cm]))
    s.append(Spacer(1,0.25*cm))

    s.append(h3("V2 — Fuera del alcance de la V1"))
    s.append(simple_table(["Pendiente","Nota"],[
        ["Reevaluaciones y comparación histórica","La BD ya lo soporta; falta UI. La spec lo marca como beneficio futuro."],
        ["Capas LifeComp, capacidades y recomendaciones","Preparación para V2 según la propia especificación."],
        ["Exportaciones JSON / HTML del informe","Mencionado como formato futuro."],
    ],[7*cm,9.5*cm]))

    # 9. CONCLUSIÓN
    s.append(Spacer(1,0.4*cm))
    s.append(section(9,"Conclusión", INDIGO))
    s.append(p("El producto cumple <b>el núcleo técnico</b> de la especificación: el motor de cálculo es fiel y "
               "determinista, el guardado de datos es correcto e inmutable, y el informe individual y el mapa de "
               "equipo están construidos en su mayor parte con el lenguaje no-clasificatorio que exige el cliente."))
    s.append(p("La <b>distancia principal</b> frente a lo pedido es arquitectónica: los contenidos (narrativas e "
               "insights) viven en el código y no en una biblioteca editable en base de datos. Resolver eso, junto con "
               "dar acceso al informe al propio participante y completar las exportaciones y el índice de diversidad, "
               "cerraría prácticamente todo el alcance funcional de la V1."))
    s.append(Spacer(1,0.2*cm))
    s.append(small("Documento generado a partir del análisis directo de los 11 PDFs de especificación y de la "
                   "auditoría del código fuente del proyecto."))
    return s

# ── Cabecera / pie ────────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    today=datetime.date.today().strftime("%d/%m/%Y")
    canvas.setStrokeColor(INDIGO); canvas.setLineWidth(2); canvas.line(2*cm,H-1.2*cm,W-2*cm,H-1.2*cm)
    canvas.setFillColor(INDIGO); canvas.setFont("Helvetica-Bold",8)
    canvas.drawString(2*cm,H-1*cm,"DISC GESEM — Análisis de Especificaciones")
    canvas.setFillColor(SLATE_500); canvas.setFont("Helvetica",8); canvas.drawRightString(W-2*cm,H-1*cm,today)
    canvas.setStrokeColor(SLATE_200); canvas.setLineWidth(0.5); canvas.line(2*cm,1.5*cm,W-2*cm,1.5*cm)
    canvas.setFillColor(SLATE_500); canvas.setFont("Helvetica",7.5)
    canvas.drawCentredString(W/2,1.1*cm,f"Página {doc.page}  ·  Uso interno GESEM  ·  Confidencial")
    canvas.restoreState()

def main():
    doc=SimpleDocTemplate(OUTPUT,pagesize=A4,leftMargin=2*cm,rightMargin=2*cm,topMargin=2*cm,bottomMargin=2*cm)
    doc.build(build(), onFirstPage=lambda c,d:None, onLaterPages=on_page)
    print("PDF generado:",os.path.abspath(OUTPUT))

if __name__=="__main__":
    main()
