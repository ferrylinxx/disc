# -*- coding: utf-8 -*-
"""
DISC GESEM V1 — Plan de Cambios para el Cierre de la V1.
Documento para enviar: resume los cambios que entendemos necesarios a partir
del análisis de la documentación de especificación más reciente.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Flowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os, datetime

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
BLUE_BG   = colors.HexColor("#e0e7ff")
INDIGO_LIGHT = colors.HexColor("#eef2ff")

W, H = A4
CONTENT_W = W - 4*cm
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "DISC-GESEM-Plan-de-Cambios.pdf")

base = getSampleStyleSheet()
def mk(name, parent="Normal", **kw):
    return ParagraphStyle(name, parent=base[parent], **kw)

S = {
    "ctitle": mk("ctitle", fontSize=27, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=32),
    "csub":   mk("csub", fontSize=13, textColor=colors.HexColor("#c7d2fe"), alignment=TA_CENTER, leading=18),
    "cmeta":  mk("cmeta", fontSize=10, textColor=colors.HexColor("#a5b4fc"), alignment=TA_CENTER, leading=15),
    "h2":   mk("h2", fontSize=13, fontName="Helvetica-Bold", textColor=INDIGO, spaceAfter=5, spaceBefore=12, leading=16),
    "h3":   mk("h3", fontSize=10.5, fontName="Helvetica-Bold", textColor=SLATE_900, spaceAfter=3, spaceBefore=8, leading=13),
    "body": mk("body", fontSize=10, textColor=SLATE_700, leading=15, spaceAfter=5),
    "body_sm": mk("bsm", fontSize=8.5, textColor=SLATE_500, leading=12, spaceAfter=2),
    "lead": mk("lead", fontSize=10.5, textColor=SLATE_700, leading=16, spaceAfter=6),
    "cell": mk("cell", fontSize=9, textColor=SLATE_700, leading=12),
    "cell_b": mk("cellb", fontSize=9, textColor=SLATE_900, leading=12, fontName="Helvetica-Bold"),
    "cell_w": mk("cellw", fontSize=8.5, textColor=WHITE, leading=11, fontName="Helvetica-Bold"),
    "num": mk("num", fontSize=10, textColor=SLATE_700, leading=14, leftIndent=4, spaceAfter=3),
}

class SectionHeader(Flowable):
    def __init__(self, label, title, color=INDIGO):
        Flowable.__init__(self); self.label=label; self.title=title; self.color=color
    def wrap(self, aw, ah): return (aw, 32)
    def draw(self):
        c=self.canv
        # etiqueta pill
        c.setFillColor(self.color)
        c.roundRect(0, 0, 1.5*cm, 18, 4, fill=1, stroke=0)
        c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(0.75*cm, 5, self.label)
        c.setFillColor(SLATE_900); c.setFont("Helvetica-Bold", 14)
        c.drawString(1.5*cm+10, 4, self.title)
        c.setStrokeColor(self.color); c.setLineWidth(1.5); c.line(0, -6, CONTENT_W, -6)

def section(label, title, color=INDIGO):
    return KeepTogether([Spacer(1,0.25*cm), SectionHeader(label,title,color), Spacer(1,0.4*cm)])

def P(t): return Paragraph(t, S["body"])
def lead(t): return Paragraph(t, S["lead"])
def small(t): return Paragraph(t, S["body_sm"])
def h2(t): return Paragraph(t, S["h2"])
def h3(t): return Paragraph(t, S["h3"])

def change_table(rows, color_head=INDIGO):
    """rows: list of (n, titulo, que_cambia)"""
    data=[[Paragraph("#",S["cell_w"]), Paragraph("Cambio",S["cell_w"]),
           Paragraph("Qué supone",S["cell_w"])]]
    for n,titulo,detalle in rows:
        data.append([Paragraph(str(n),S["cell_b"]),
                     Paragraph("<b>"+titulo+"</b>",S["cell"]),
                     Paragraph(detalle,S["cell"])])
    t=Table(data,colWidths=[0.9*cm,6.3*cm,9.3*cm],repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),color_head),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ALIGN",(0,0),(0,-1),"CENTER"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,SLATE_50]),
        ("GRID",(0,0),(-1,-1),0.4,SLATE_200),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    return t

def two_col(headers, rows, widths, head=INDIGO):
    data=[[Paragraph(h,S["cell_w"]) for h in headers]]
    for r in rows:
        data.append([Paragraph(str(r[0]),S["cell_b"]), Paragraph(str(r[1]),S["cell"])])
    t=Table(data,colWidths=widths,repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),head),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE,SLATE_50]),
        ("GRID",(0,0),(-1,-1),0.4,SLATE_200),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    return t

def callout(text, bg=BLUE_BG, fg=INDIGO):
    t=Table([[Paragraph(text, mk("co", fontSize=9.5, textColor=SLATE_700, leading=14))]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg),
        ("LEFTPADDING",(0,0),(-1,-1),12),("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),
        ("LINEBEFORE",(0,0),(0,-1),3,fg),
    ]))
    return t

# ── Portada ───────────────────────────────────────────────────────────────────
def cover():
    items=[]
    today=datetime.date.today().strftime("%d/%m/%Y")
    content=[
        Spacer(1,2.4*cm),
        Paragraph("DISC GESEM V1",S["ctitle"]),
        Spacer(1,0.3*cm),
        Paragraph("Plan de Cambios para el Cierre de la V1",S["csub"]),
        Spacer(1,0.4*cm),
        Paragraph("Cambios que entendemos necesarios a partir de la documentación de especificación",S["cmeta"]),
        Spacer(1,1.1*cm),
        Paragraph(f"Documento de trabajo · {today}",S["cmeta"]),
    ]
    ct=Table([[content]],colWidths=[CONTENT_W],rowHeights=[H*0.42])
    ct.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),INDIGO),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),1.6*cm),("RIGHTPADDING",(0,0),(-1,-1),1.6*cm)]))
    items.append(ct)
    band=Table([[""]],colWidths=[CONTENT_W],rowHeights=[0.22*cm])
    band.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),FUCHSIA)])); items.append(band)
    items.append(Spacer(1,0.8*cm))
    return items

def build():
    s=[]
    s+=cover()

    # Contexto
    s.append(h2("Contexto"))
    s.append(lead(
        "Tras revisar en detalle la documentación de especificación más reciente de DISC GESEM "
        "(brief de flujo de usuario, prioridades de cierre, marco conceptual, estrategia de narrativas, "
        "perfil patrón, guía editorial y diccionario de recursos), hemos contrastado lo que pide la "
        "metodología con lo que hoy tiene la plataforma."))
    s.append(lead(
        "Este documento resume <b>los cambios que entendemos necesarios para cerrar la V1</b>, ordenados por "
        "prioridad. La base técnica (motor de cálculo, guardado de datos y lenguaje no clasificatorio) ya está "
        "alineada; los cambios se concentran en la <b>estructura del informe</b>, en mover las <b>narrativas a una "
        "base de datos editable</b> y en completar el <b>mapa de equipo y las exportaciones</b>."))
    s.append(Spacer(1,0.15*cm))
    s.append(callout(
        "<b>Idea clave:</b> el informe debe ayudar a la persona a comprender los <b>recursos</b> que utiliza con más "
        "frecuencia y cómo influyen en su forma de coordinarse y colaborar. No debe clasificar, ni diagnosticar, ni "
        "incluir retos o tareas. El protagonista es el recurso (ej. “Impulsar + Conectar”), no la etiqueta de perfil."))

    # Resumen ejecutivo
    s.append(Spacer(1,0.3*cm))
    s.append(h2("Resumen de los cambios por prioridad"))
    s.append(two_col(["Prioridad","Resumen"],[
        ["P0 · Imprescindible","Reestructurar el informe a la versión GESEM definitiva, quitar retos/experimentos, "
         "dar acceso al participante, alinear umbrales, narrativas en BD, índice de diversidad y exportación PDF."],
        ["P1 · Muy deseable","Edición de narrativas desde administración, cabecera completa del mapa de equipo, "
         "PDF ejecutivo vs facilitador, exportación Excel y visualización tipo radar."],
        ["P2 · Posterior","Mejora visual editorial del informe y del mapa de equipo."],
        ["V2 · Fuera de alcance","LifeComp/DigComp, recomendaciones avanzadas, IA generativa e histórico comparativo."],
    ],[3.3*cm,13.2*cm]))

    # ── P0 ───────────────────────────────────────────────────────────────────
    s.append(PageBreak())
    s.append(section("P0","Cambios imprescindibles para cerrar la V1", RED))
    s.append(P("Sin estos cambios, la V1 no se considera cerrada según la documentación de la metodología."))
    s.append(Spacer(1,0.2*cm))
    s.append(change_table([
        (1,"Reestructurar el informe individual",
         "Adoptar la estructura GESEM definitiva de 12 bloques: Antes de empezar · Tendencia predominante · "
         "Recursos predominantes · Aportación habitual · Lo que otras personas suelen valorar · Aspectos que merece "
         "la pena observar · Coordinación y colaboración · Comunicación · Contextos de mejor desempeño · Ampliación "
         "de repertorio · Preguntas de reflexión (3) · Cierre."),
        (2,"Eliminar retos, experimentos y tareas",
         "El informe actual incluye un “experimento de la semana”, una “pregunta poderosa” y un plan de acción "
         "individual. La metodología los excluye expresamente: el informe debe ser interpretativo y reflexivo, "
         "sin tareas posteriores."),
        (3,"Dar protagonismo al recurso, no al perfil",
         "Mostrar “Recursos predominantes: Impulsar + Conectar” como elemento principal. El código de perfil (DI, "
         "ID, …) queda como referencia interna de interpretación, en segundo plano."),
        (4,"El participante debe ver su informe en la app",
         "Hoy el informe solo lo ve el administrador o llega por email. Al finalizar el cuestionario, la persona "
         "debe poder acceder a su propio informe dentro de la aplicación."),
        (5,"Alinear los umbrales de intensidad",
         "Ajustar a la tabla acordada: Moderada 5–9 · Definida 10–14 · Muy definida 15+. Hoy el cálculo usa unos "
         "umbrales distintos."),
        (6,"Narrativas en base de datos editable",
         "Los textos de los perfiles e insights están escritos en el código. Deben moverse a base de datos para que "
         "un cambio de narrativa no requiera intervención técnica ni un nuevo despliegue."),
        (7,"Índice de diversidad del equipo",
         "Calcular el número de perfiles distintos del equipo: Baja (1–3) · Media (4–6) · Alta (7+). Es un KPI de la "
         "visión general del mapa de equipo y hoy no se calcula."),
        (8,"Exportación PDF",
         "Exportación a PDF del informe individual y del mapa de equipo. Para la V1 basta una exportación funcional, "
         "aunque no sea todavía una maquetación editorial avanzada."),
    ]))

    # ── P1 ───────────────────────────────────────────────────────────────────
    s.append(PageBreak())
    s.append(section("P1","Cambios muy deseables para la V1", AMBER))
    s.append(P("Refuerzan la experiencia y la autonomía de GESEM, sin ser bloqueantes para el cierre."))
    s.append(Spacer(1,0.2*cm))
    s.append(change_table([
        (1,"Administración editable de narrativas",
         "Que GESEM pueda editar desde el panel: texto por perfil, preguntas de reflexión, estado activo/inactivo, "
         "versión, fecha y autor."),
        (2,"Cabecera completa del mapa de equipo",
         "Incluir nombre del equipo, organización, fecha, número de participantes y unidad organizativa/proyecto."),
        (3,"Diferenciar PDF ejecutivo y PDF facilitador",
         "Para el mapa de equipo: una versión breve para cliente/RRHH y una versión ampliada para preparación de taller."),
        (4,"Exportación Excel del mapa de equipo",
         "Además del PDF: datos agregados, distribución de perfiles, recursos predominantes e índice de diversidad."),
        (5,"Visualización tipo radar de recursos colectivos",
         "Una representación visual rápida de los recursos predominantes del equipo (radar o equivalente claro)."),
    ], color_head=AMBER))

    # ── Ya alineado ───────────────────────────────────────────────────────────
    s.append(Spacer(1,0.4*cm))
    s.append(section("OK","Lo que ya está alineado (no requiere cambios)", GREEN))
    s.append(two_col(["Área","Estado"],[
        ["Motor de cálculo DISC","Puntuación Más/Menos, perfil, EQ y contextos correctos y deterministas."],
        ["Guardado de resultados","Se guardan los resultados brutos sin sobrescribir; cada evaluación es una entrada nueva."],
        ["Lenguaje de la herramienta","Redacción de tendencias e hipótesis, no clasificatoria ni diagnóstica."],
        ["Mapa de equipo (base)","La mayoría de pantallas están construidas (distribución, fortalezas, riesgos, vacíos, conversaciones)."],
        ["Insights automáticos","Generación de hasta 3 insights individuales, sin repetición."],
    ],[4.3*cm,12.2*cm], head=GREEN))

    # ── Dependencia editorial ────────────────────────────────────────────────
    s.append(Spacer(1,0.4*cm))
    s.append(section("→","Contenido editorial: qué tenemos y qué necesitamos", INDIGO))
    s.append(P("La parte técnica (estructura de base de datos y editor de narrativas) la asumimos nosotros. El "
               "<b>contenido</b> de los perfiles es una labor editorial de GESEM, y ya está muy avanzada:"))
    s.append(two_col(["Material","Situación"],[
        ["Perfil patrón y plantilla maestra","Disponible: define la estructura de los 13 perfiles."],
        ["Diccionario de recursos","Disponible: vocabulario común cerrado para todas las narrativas."],
        ["Guía editorial","Disponible: criterios de redacción y lenguaje a usar/evitar."],
        ["Perfil DI (redactado)","Disponible y completo: sirve como referencia para cargar en BD."],
        ["Perfiles restantes (12)","Pendientes de redacción/validación por GESEM (ID, DC, CD, IS, SI, SC, CS, DS, SD, IC, CI, EQ)."],
    ],[4.8*cm,11.7*cm]))
    s.append(Spacer(1,0.15*cm))
    s.append(callout(
        "<b>Lo que necesitamos de GESEM:</b> la redacción validada de los 12 perfiles restantes siguiendo la plantilla "
        "maestra y la guía editorial. Podemos avanzar en paralelo: nosotros preparamos la base de datos y el editor, "
        "e iremos cargando los perfiles a medida que se validen. El perfil DI puede entrar ya como primer caso."))

    # ── Orden de trabajo propuesto ───────────────────────────────────────────
    s.append(PageBreak())
    s.append(section("1·2·3","Orden de trabajo propuesto", INDIGO))
    s.append(P("Proponemos abordar los cambios en este orden, combinando impacto y esfuerzo:"))
    s.append(Spacer(1,0.2*cm))
    s.append(two_col(["Fase","Contenido"],[
        ["Fase 1 — Ajustes rápidos","Alinear umbrales de intensidad y dar protagonismo a los recursos frente al "
         "perfil. Cambios acotados y de efecto inmediato."],
        ["Fase 2 — Informe GESEM","Reestructurar el informe a los 12 bloques, eliminar retos/experimentos/tareas y "
         "habilitar el acceso del participante a su informe en la app."],
        ["Fase 3 — Narrativas en BD","Crear la estructura de base de datos editable y el editor de administración; "
         "cargar el perfil DI y preparar la carga de los 12 restantes."],
        ["Fase 4 — Equipo y export","Índice de diversidad, cabecera completa del mapa, exportación PDF del informe y "
         "del mapa, y a continuación Excel y diferenciación ejecutivo/facilitador."],
        ["Fase 5 — Pulido","Mejora visual editorial del informe y del mapa de equipo (P2)."],
    ],[3.6*cm,12.9*cm]))

    s.append(Spacer(1,0.4*cm))
    s.append(h2("Criterio de cierre de la V1"))
    s.append(P("Según la documentación, la V1 quedará cerrada cuando: el cuestionario funcione; el cálculo sea "
               "correcto y con los umbrales acordados; los resultados se guarden; las narrativas estén estructuradas "
               "y sean editables; el participante pueda ver su informe; el mapa de equipo se genere automáticamente; "
               "exista exportación PDF; el lenguaje sea coherente con la filosofía GESEM; y no haya retos, "
               "experimentos ni tareas en el informe individual."))
    s.append(Spacer(1,0.2*cm))
    s.append(small("Documento elaborado a partir del análisis de la documentación de especificación de DISC GESEM V1 "
                   "y de la revisión de la plataforma actual. Pensado como base de conversación para acordar el "
                   "alcance final del cierre de la V1."))
    return s

def on_page(canvas, doc):
    canvas.saveState()
    today=datetime.date.today().strftime("%d/%m/%Y")
    canvas.setStrokeColor(INDIGO); canvas.setLineWidth(2); canvas.line(2*cm,H-1.2*cm,W-2*cm,H-1.2*cm)
    canvas.setFillColor(INDIGO); canvas.setFont("Helvetica-Bold",8)
    canvas.drawString(2*cm,H-1*cm,"DISC GESEM V1 — Plan de Cambios")
    canvas.setFillColor(SLATE_500); canvas.setFont("Helvetica",8); canvas.drawRightString(W-2*cm,H-1*cm,today)
    canvas.setStrokeColor(SLATE_200); canvas.setLineWidth(0.5); canvas.line(2*cm,1.5*cm,W-2*cm,1.5*cm)
    canvas.setFillColor(SLATE_500); canvas.setFont("Helvetica",7.5)
    canvas.drawCentredString(W/2,1.1*cm,f"Página {doc.page}  ·  Documento de trabajo")
    canvas.restoreState()

def main():
    doc=SimpleDocTemplate(OUTPUT,pagesize=A4,leftMargin=2*cm,rightMargin=2*cm,topMargin=2*cm,bottomMargin=2*cm)
    doc.build(build(), onFirstPage=lambda c,d:None, onLaterPages=on_page)
    print("PDF generado:", os.path.abspath(OUTPUT))

if __name__=="__main__":
    main()
