"""
Genera un informe técnico completo del proyecto DISC GESEM en PDF.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Flowable
import os, datetime

# ── Colores de marca ──────────────────────────────────────────────────────────
INDIGO      = colors.HexColor("#6366f1")
VIOLET      = colors.HexColor("#8b5cf6")
FUCHSIA     = colors.HexColor("#d946ef")
SLATE_900   = colors.HexColor("#0f172a")
SLATE_700   = colors.HexColor("#334155")
SLATE_500   = colors.HexColor("#64748b")
SLATE_200   = colors.HexColor("#e2e8f0")
SLATE_50    = colors.HexColor("#f8fafc")
WHITE       = colors.white
GREEN       = colors.HexColor("#10b981")
AMBER       = colors.HexColor("#f59e0b")
RED         = colors.HexColor("#ef4444")
INDIGO_LIGHT = colors.HexColor("#eef2ff")
VIOLET_LIGHT = colors.HexColor("#f5f3ff")

W, H = A4

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "disc-gesem-informe-tecnico.pdf")

# ── Estilos ───────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def style(name, parent="Normal", **kw):
    s = ParagraphStyle(name, parent=base[parent], **kw)
    return s

S = {
    "cover_title": style("cover_title", "Normal",
        fontSize=30, textColor=WHITE, fontName="Helvetica-Bold",
        alignment=TA_CENTER, leading=36, spaceAfter=6),
    "cover_sub": style("cover_sub", "Normal",
        fontSize=13, textColor=colors.HexColor("#c7d2fe"),
        alignment=TA_CENTER, leading=18, spaceAfter=4),
    "cover_meta": style("cover_meta", "Normal",
        fontSize=10, textColor=colors.HexColor("#a5b4fc"),
        alignment=TA_CENTER, leading=14),
    "h1": style("h1", "Normal",
        fontSize=18, fontName="Helvetica-Bold", textColor=SLATE_900,
        spaceAfter=8, spaceBefore=20, leading=22),
    "h2": style("h2", "Normal",
        fontSize=13, fontName="Helvetica-Bold", textColor=INDIGO,
        spaceAfter=5, spaceBefore=14, leading=16),
    "h3": style("h3", "Normal",
        fontSize=11, fontName="Helvetica-Bold", textColor=SLATE_700,
        spaceAfter=4, spaceBefore=10, leading=14),
    "body": style("body", "Normal",
        fontSize=9.5, textColor=SLATE_700, leading=14, spaceAfter=4),
    "body_sm": style("body_sm", "Normal",
        fontSize=8.5, textColor=SLATE_500, leading=12, spaceAfter=2),
    "code": style("code", "Normal",
        fontSize=8, fontName="Courier", textColor=SLATE_700,
        backColor=SLATE_50, leading=11,
        leftIndent=8, rightIndent=8, spaceAfter=4, spaceBefore=2,
        borderPadding=4),
    "bullet": style("bullet", "Normal",
        fontSize=9.5, textColor=SLATE_700, leading=13,
        leftIndent=14, spaceAfter=2, bulletIndent=4),
    "tag_green": style("tag_green", "Normal",
        fontSize=8, fontName="Helvetica-Bold", textColor=GREEN,
        spaceAfter=0),
    "tag_amber": style("tag_amber", "Normal",
        fontSize=8, fontName="Helvetica-Bold", textColor=AMBER,
        spaceAfter=0),
    "caption": style("caption", "Normal",
        fontSize=8, textColor=SLATE_500, alignment=TA_CENTER,
        spaceAfter=6),
    "footer": style("footer", "Normal",
        fontSize=7.5, textColor=SLATE_500, alignment=TA_CENTER),
}

# ── Flowables custom ──────────────────────────────────────────────────────────
class ColoredLine(Flowable):
    def __init__(self, width=None, height=2, color=INDIGO):
        Flowable.__init__(self)
        self._w = width
        self._h = height
        self._color = color

    def draw(self):
        self.canv.setFillColor(self._color)
        self.canv.rect(0, 0, self._w or (W - 4*cm), self._h, fill=1, stroke=0)

    def wrap(self, aw, ah):
        return (self._w or aw, self._h + 4)


class SectionHeader(Flowable):
    """Bloque con número de sección, línea de color y título."""
    def __init__(self, num, title, color=INDIGO):
        Flowable.__init__(self)
        self._num = num
        self._title = title
        self._color = color

    def draw(self):
        c = self.canv
        # número en círculo
        c.setFillColor(self._color)
        c.circle(10, 8, 10, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(10, 5, str(self._num))
        # título
        c.setFillColor(SLATE_900)
        c.setFont("Helvetica-Bold", 15)
        c.drawString(26, 3, self._title)
        # línea inferior
        c.setStrokeColor(self._color)
        c.setLineWidth(1.5)
        c.line(0, -5, W - 4*cm, -5)

    def wrap(self, aw, ah):
        return (aw, 30)


def cover_page():
    """Portada con degradado simulado."""
    items = []

    # bloque de color superior (simulado con tabla)
    cover_bg = Table([[""]],
        colWidths=[W - 4*cm], rowHeights=[H * 0.55])
    cover_bg.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), INDIGO),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))

    # contenido portada
    today = datetime.date.today().strftime("%-d de %B de %Y") if os.name != "nt" else datetime.date.today().strftime("%d/%m/%Y")

    cover_content = [
        Spacer(1, 3*cm),
        Paragraph("DISC GESEM", S["cover_title"]),
        Paragraph("Informe Técnico de Proyecto", S["cover_sub"]),
        Spacer(1, 0.4*cm),
        Paragraph("Plataforma de Evaluación Conductual y Desarrollo de Equipos", S["cover_sub"]),
        Spacer(1, 1.2*cm),
        Paragraph(f"Versión 0.1.0 · {today}", S["cover_meta"]),
        Paragraph("Equipo GESEM · Uso Interno", S["cover_meta"]),
    ]

    cover_table = Table([[cover_content]],
        colWidths=[W - 4*cm], rowHeights=[H * 0.55])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), INDIGO),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 2*cm),
        ("RIGHTPADDING", (0,0), (-1,-1), 2*cm),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    items.append(cover_table)

    # banda violeta
    band = Table([[""]],
        colWidths=[W - 4*cm], rowHeights=[0.25*cm])
    band.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), FUCHSIA),
    ]))
    items.append(band)

    items.append(Spacer(1, 1.2*cm))

    # resumen en caja
    summary_data = [
        ["Stack Principal", "Next.js 16 · React 19 · Prisma 7 · Tailwind 4"],
        ["Base de Datos", "PostgreSQL (Supabase) con PgBouncer pooler"],
        ["Autenticación", "JWT HS256 (jose) · RBAC multi-tenant"],
        ["Despliegue", "appsrv01 (192.168.3.208) · disc.fgarola.es"],
        ["Estado", "Producción activa · v0.1.0 del instrumento DISC"],
    ]
    summary_tbl = Table(summary_data, colWidths=[4.5*cm, 12*cm])
    summary_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), INDIGO_LIGHT),
        ("BACKGROUND", (1,0), (1,-1), WHITE),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [INDIGO_LIGHT, VIOLET_LIGHT]),
        ("TEXTCOLOR", (0,0), (0,-1), INDIGO),
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("GRID", (0,0), (-1,-1), 0.5, SLATE_200),
        ("ROUNDEDCORNERS", [4]),
    ]))
    items.append(summary_tbl)
    items.append(PageBreak())
    return items


def section(num, title):
    return KeepTogether([
        Spacer(1, 0.3*cm),
        SectionHeader(num, title),
        Spacer(1, 0.4*cm),
    ])


def h2(text):
    return Paragraph(text, S["h2"])


def h3(text):
    return Paragraph(text, S["h3"])


def p(text):
    return Paragraph(text, S["body"])


def small(text):
    return Paragraph(text, S["body_sm"])


def bullet(text):
    return Paragraph(f"• {text}", S["bullet"])


def code(text):
    return Paragraph(text.replace("\n", "<br/>").replace(" ", "&nbsp;"), S["code"])


def divider():
    return HRFlowable(width="100%", thickness=0.5, color=SLATE_200, spaceAfter=8, spaceBefore=4)


def tag(text, ok=True):
    s = S["tag_green"] if ok else S["tag_amber"]
    symbol = "✓" if ok else "⚠"
    return Paragraph(f"{symbol} {text}", s)


def make_table(headers, rows, col_widths=None):
    data = [headers] + rows
    if col_widths is None:
        col_widths = [(W - 4*cm) / len(headers)] * len(headers)
    tbl = Table(data, colWidths=col_widths, repeatRows=1)
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), INDIGO),
        ("TEXTCOLOR", (0,0), (-1,0), WHITE),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 7),
        ("RIGHTPADDING", (0,0), (-1,-1), 7),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, SLATE_50]),
        ("GRID", (0,0), (-1,-1), 0.4, SLATE_200),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return tbl


# ── Contenido ─────────────────────────────────────────────────────────────────
def build():
    story = []

    # Portada
    story += cover_page()

    # ── 1. RESUMEN DEL PROYECTO ───────────────────────────────────────────────
    story.append(section(1, "Resumen del Proyecto"))
    story.append(p(
        "DISC GESEM es una plataforma web de <b>autoconocimiento conductual y desarrollo de equipos</b> "
        "basada en el modelo DISC. Proporciona cuestionarios interactivos, informes individuales con insights "
        "narrativos, mapas de equipo y un sistema completo de gestión de evaluaciones multi-tenant con "
        "roles de administrador, facilitador y participante."
    ))
    story.append(Spacer(1, 0.4*cm))

    stack_data = [
        ["Componente", "Tecnología", "Versión"],
        ["Framework", "Next.js (App Router, RSC, Server Actions)", "16.2.7"],
        ["UI Library", "React + TypeScript", "19.2.4 / TS 5"],
        ["ORM / BD", "Prisma + PostgreSQL (Supabase)", "7.8.0"],
        ["Estilos", "Tailwind CSS + PostCSS", "4.x"],
        ["Autenticación", "JWT HS256 con jose + bcryptjs", "6.2.3 / 3.0.3"],
        ["Email", "Nodemailer (SMTP directo)", "8.0.10"],
        ["Validación", "Zod", "4.4.3"],
        ["Testing", "Vitest + Playwright", "4.1.8"],
        ["Despliegue", "systemd + nginx + Certbot (appsrv01)", "—"],
    ]
    story.append(make_table(stack_data[0], stack_data[1:], [4*cm, 10*cm, 2.5*cm]))
    story.append(Spacer(1, 0.3*cm))

    # ── 2. ARQUITECTURA ───────────────────────────────────────────────────────
    story.append(section(2, "Arquitectura"))

    story.append(h2("Estructura de directorios"))
    story.append(code(
        "src/<br/>"
        "&nbsp;&nbsp;app/           # Rutas App Router (pages, layouts, loading)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;actions/     # Server Actions (~9 archivos, ~1500 líneas)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;admin/       # Panel SUPERADMIN<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;cliente/     # Panel ORG_ADMIN<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;facilitador/ # Panel FACILITATOR<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;evaluacion/  # Cuestionario público y por token<br/>"
        "&nbsp;&nbsp;components/    # Componentes React (~24 archivos)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;admin/       # UI panel SUPERADMIN<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;dashboard/   # Componentes paneles cliente/facilitador<br/>"
        "&nbsp;&nbsp;lib/           # Lógica reutilizable<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;auth/        # Sesión JWT, RBAC, DAL<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;engine/      # Motor de scoring ipsativo<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;instruments/ # Definición DISC GESEM v1<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;narratives/  # Narrativas, catálogo, insights<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;email/       # Mailer SMTP + plantillas<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;data/        # Queries agregadas (dashboard DAL)<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;db.ts        # Prisma Client singleton<br/>"
        "&nbsp;&nbsp;proxy.ts       # Edge middleware (Auth + RBAC)<br/>"
        "prisma/<br/>"
        "&nbsp;&nbsp;schema.prisma  # 20 modelos multi-tenant<br/>"
        "&nbsp;&nbsp;seed.ts        # Seed del instrumento DISC<br/>"
        "&nbsp;&nbsp;migrations/    # 4 migraciones aplicadas"
    ))

    story.append(h2("Patrones arquitectónicos"))
    for b in [
        "<b>App Router (Next.js 16)</b> — archivos page.tsx / layout.tsx en directorios anidados con Server Components por defecto.",
        "<b>React Server Components (RSC)</b> — pages y layouts hacen fetch de datos directamente en servidor sin useEffect.",
        "<b>Server Actions</b> — toda mutación vive en src/app/actions/*.ts (\"use server\"), validados con Zod, autorizados con DAL.",
        "<b>Edge Proxy (proxy.ts)</b> — sustituye al middleware convencional; verifica JWT y aplica RBAC en el borde antes de cada request.",
        "<b>DAL (dal.ts)</b> — segunda capa de autorización: requireAuth(), requireRole() en RSC y Actions para defensa en profundidad.",
    ]:
        story.append(bullet(b))
    story.append(Spacer(1, 0.3*cm))

    story.append(h2("Flujo de autenticación"))
    auth_steps = [
        ["Paso", "Descripción"],
        ["1. Login", "Usuario envía email+contraseña → Server Action login()"],
        ["2. Validación", "bcrypt.compare() contra passwordHash en BD"],
        ["3. JWT", "Firma HS256 con jose, payload: userId, email, globalRole, memberships"],
        ["4. Cookie", "HttpOnly cookie 'gesem_session', secure si APP_URL usa HTTPS, 7 días"],
        ["5. Proxy (edge)", "Cada request: lee cookie, decryptSession(), verifica firma"],
        ["6. RBAC", "isProtectedPath() → canAccessPath() → redirige /login o /denegado"],
        ["7. DAL (server)", "requireAuth() / requireRole() en RSC — segunda verificación cercana al dato"],
    ]
    story.append(make_table(auth_steps[0], auth_steps[1:], [3.5*cm, 13*cm]))
    story.append(Spacer(1, 0.3*cm))

    # ── 3. MODELO DE DATOS ────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section(3, "Modelo de Datos (Prisma)"))

    story.append(h2("Grupos de modelos"))
    model_groups = [
        ["Grupo", "Modelos", "Propósito"],
        ["Tenancy + Auth", "Organization, User, Membership,\nAccount, Session, VerificationToken",
         "Multi-tenant con roles globales y por organización"],
        ["Estructura de Negocio", "Project, Team, Participant",
         "Jerarquía org → project → team → participant"],
        ["Motor de Evaluaciones", "Instrument, InstrumentVersion,\nDimension, Context, Item, ItemOption",
         "Instrumento configurable en BD (no hardcodeado)"],
        ["Evaluación y Resultados", "Assessment, Invitation, ResponseSet,\nItemResponse, Result, ResultDimensionScore",
         "Ciclo completo: invitar → responder → calcular → guardar"],
        ["Narrativas y Planes", "Narrative, NarrativeContent, ActionPlan",
         "Contenido editorial versionado y traducible"],
        ["Analítica y Auditoría", "AnalyticsEvent, AuditLog",
         "Observabilidad y trazabilidad de acciones"],
    ]
    story.append(make_table(model_groups[0], model_groups[1:], [3.5*cm, 6.5*cm, 6.5*cm]))
    story.append(Spacer(1, 0.3*cm))

    story.append(h2("Relaciones clave y cascadas"))
    for b in [
        "<b>Organization → Participant → Invitation → Result</b>: borrado en cascada completo",
        "<b>Participant.organizationId</b>: campo requerido (String, no nullable)",
        "<b>InstrumentVersion</b>: estados DRAFT → PUBLISHED → ARCHIVED; solo PUBLISHED se usa en producción",
        "<b>Invitation.draft (Json?)</b>: persiste progreso parcial para reanudar cuestionario",
        "<b>ResultDimensionScore.contextId (null)</b>: puntuación global; con valor = puntuación por contexto",
        "<b>4 migraciones aplicadas</b>: init → traceability_fields → user_password_hash → invitation_draft",
    ]:
        story.append(bullet(b))

    story.append(h2("Enums definidos"))
    enum_data = [
        ["Enum", "Valores"],
        ["GlobalRole", "SUPERADMIN, USER"],
        ["MembershipRole", "ADMIN, FACILITATOR"],
        ["ParticipantStatus", "INVITED, IN_PROGRESS, COMPLETED"],
        ["VersionStatus", "DRAFT, PUBLISHED, ARCHIVED"],
        ["AssessmentStatus", "DRAFT, ACTIVE, CLOSED"],
        ["InvitationStatus", "PENDING, SENT, OPENED, COMPLETED, EXPIRED"],
        ["NarrativeScope", "DIMENSION, PROFILE, CONTEXT, EQ"],
        ["NarrativeStatus", "DRAFT, PUBLISHED, ARCHIVED"],
    ]
    story.append(make_table(enum_data[0], enum_data[1:], [5*cm, 11.5*cm]))

    # ── 4. MÓDULOS FUNCIONALES ────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section(4, "Módulos Funcionales"))

    modules = [
        ("Motor DISC (engine/scoring)",
         "src/lib/engine/",
         [
             "Motor de scoring <b>ipsativo agnóstico</b> (no hardcodea DISC): cálculo por dimensión suma cero.",
             "Puntuación global: suma normalizada 0-100 por dimensión.",
             "Puntuación por contexto: reparto en subconjunto de ítems (7 contextos × 4 dimensiones).",
             "Clasificación de intensidad: FLEXIBLE / MODERADA / DEFINIDA / MUY_DEFINIDA según delta.",
             "Cálculo EQ (equilibrio): índice de dispersión entre dimensiones.",
             "Cobertura con Vitest (scoring.test.ts).",
         ]),
        ("Instrumento DISC GESEM v1",
         "src/lib/instruments/",
         [
             "4 dimensiones: D (Dominancia), I (Influencia), S (Estabilidad), C (Cumplimiento).",
             "7 contextos: Toma de decisiones, Acción, Comunicación, Colaboración, Cambio, Conflicto, Organización.",
             "35 ítems (5 por contexto), cada uno con 4 opciones asociadas a dimensiones.",
             "Configuración de scoring en JSON: mostValue=1, leastValue=-1, umbrales de intensidad.",
             "Seed en BD via prisma/seed.ts — idempotente.",
         ]),
        ("Cuestionario (Questionnaire.tsx)",
         "src/components/Questionnaire.tsx + src/components/IntakeForm.tsx",
         [
             "5 pasos: intro → autoposicionamiento → quiz → reflexión → resultado.",
             "Draft guardado en localStorage y BD (Invitation.draft) para reanudar en cualquier dispositivo.",
             "Atajos de teclado (1-4) para responder ítems.",
             "Flujo público: IntakeForm pide nombre+email → crea Participant+Invitation → redirige al token.",
             "Flujo por invitación: token resuelve Participant y persiste resultado en BD.",
         ]),
        ("Panel Admin (SUPERADMIN)",
         "src/app/admin/ + src/components/admin/",
         [
             "Dashboard con 4 KPIs, cumplimentación, distribución de perfiles.",
             "Gestión de organizaciones: crear, renombrar, eliminar (cascada completa).",
             "Gestión de proyectos y equipos por organización.",
             "Invitar participantes (individual + CSV bulk) con reenvío de email.",
             "Gestión de usuarios globales: crear, roles, memberships.",
             "Panel de sistema: estado SMTP, conteo de BD, diagnóstico.",
         ]),
        ("Paneles Cliente/Facilitador",
         "src/app/cliente/ + src/app/facilitador/",
         [
             "Panel Cliente (ORG_ADMIN): proyectos, equipos, invitar participantes, ver resultados.",
             "Mapa de equipo (/cliente/equipos/[teamId]): heatmap DISC, complementariedad.",
             "Detalle participante (/cliente/participantes/[id]): informe completo, envío de PDF.",
             "Panel Facilitador: facilitar evaluaciones activas, seguimiento de progreso.",
         ]),
        ("Sistema de Narrativas",
         "src/lib/narratives/",
         [
             "Narrativas por dimensión: fortalezas, watchouts, desarrollo.",
             "12 combinaciones de perfil (+ EQ) con nombres DISC oficiales.",
             "Catálogo de estilos: D=Impulsar, I=Conectar, S=Sostener, C=Estructurar.",
             "Insights automáticos por perfil, intensidad, comunicación y conflicto.",
             "Análisis de equipo: complementariedad, vacíos, tensiones.",
         ]),
        ("Sistema de Email",
         "src/lib/email/",
         [
             "Transporte: Nodemailer SMTP (gesem.cat, puerto 465 SSL).",
             "Template de invitación: HTML responsive con enlace directo al cuestionario.",
             "Template de informe: HTML con perfil DISC, puntuaciones, narrativa.",
             "Verificación de config via /api/smtp-check antes de enviar.",
             "Envío de informes: acción manual del admin (no automática al completar).",
         ]),
    ]

    for (title, path, bullets) in modules:
        story.append(KeepTogether([
            h2(title),
            small(f"Archivos: {path}"),
            Spacer(1, 0.15*cm),
        ] + [bullet(b) for b in bullets] + [Spacer(1, 0.1*cm)]))

    # ── 5. RUTAS ─────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section(5, "Rutas de la Aplicación"))

    routes = [
        ["Ruta", "Protección", "Propósito"],
        ["/", "Pública", "Landing page con animaciones y mockups"],
        ["/login", "Pública", "Login con email + contraseña"],
        ["/evaluacion", "Pública", "Formulario intake (nombre+email) → inicia cuestionario libre"],
        ["/evaluacion/[token]", "Token (invitación)", "Cuestionario por invitación personal con persistencia"],
        ["/denegado", "Pública", "Página de acceso denegado"],
        ["/cliente", "ORG_ADMIN, SUPERADMIN", "Panel cliente — proyectos y equipos"],
        ["/cliente/equipos/[teamId]", "ORG_ADMIN", "Mapa de equipo y análisis DISC grupal"],
        ["/cliente/participantes/[id]", "ORG_ADMIN", "Informe individual + envío de PDF"],
        ["/facilitador", "FACILITATOR+", "Panel facilitador — seguimiento de evaluaciones"],
        ["/admin", "SUPERADMIN", "Dashboard global con KPIs de plataforma"],
        ["/admin/organizaciones", "SUPERADMIN", "Listado de organizaciones con métricas"],
        ["/admin/organizaciones/[id]", "SUPERADMIN", "Gestión completa de una organización"],
        ["/admin/usuarios", "SUPERADMIN", "Gestión de usuarios globales y memberships"],
        ["/admin/participantes", "SUPERADMIN", "Todos los participantes filtrable por org"],
        ["/admin/catalogo", "SUPERADMIN", "Gestión de narrativas del instrumento"],
        ["/admin/sistema", "SUPERADMIN", "Diagnóstico SMTP y estado de BD"],
        ["/api/smtp-check", "SUPERADMIN", "Verifica configuración SMTP en tiempo real"],
        ["/api/presence", "Autenticado", "Heartbeat que actualiza User.lastSeenAt"],
    ]
    story.append(make_table(routes[0], routes[1:], [5.5*cm, 4*cm, 7*cm]))

    # ── 6. SERVER ACTIONS ─────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*cm))
    story.append(section(6, "Server Actions"))

    story.append(p(
        "Toda la lógica de mutación vive en <b>src/app/actions/</b> (9 archivos, ~1500 líneas). "
        "Patrón uniforme: validación Zod → autorización DAL → transacción Prisma → revalidatePath()."
    ))
    story.append(Spacer(1, 0.2*cm))

    actions = [
        ["Archivo", "Funciones exportadas", "Propósito"],
        ["auth.ts", "login(), logout()", "JWT, cookie de sesión, bcrypt"],
        ["org.ts", "createOrganization(), createProject(), createTeam()", "Gestión de estructura multi-tenant"],
        ["participants.ts", "inviteParticipant(), resendInvitation(), bulkInviteParticipants()", "Invitaciones + email SMTP"],
        ["users.ts", "createUser(), updateUser(), deleteUser(), addMembership(), removeMembership()", "Usuarios globales y roles"],
        ["admin.ts", "updateOrganization(), deleteOrganization(), deleteProject(), deleteTeam(), deleteParticipant()", "Operaciones SUPERADMIN con cascada"],
        ["evaluate.ts", "evaluate(input)", "Motor scoring + persistencia completa en BD"],
        ["reports.ts", "sendParticipantReport()", "Genera y envía PDF por email (acción manual)"],
        ["drafts.ts", "saveDraft(), clearDraft()", "Persiste borrador del cuestionario en BD"],
        ["libre.ts", "startLibreEvaluation()", "Crea evaluación anónima pública (org 'libre')"],
    ]
    story.append(make_table(actions[0], actions[1:], [3*cm, 6.5*cm, 7*cm]))

    # ── 7. CALIDAD ────────────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section(7, "Calidad del Código y Observaciones"))

    story.append(h2("Fortalezas"))
    for t in [
        "TypeScript strict mode activo en todo el proyecto",
        "Motor de scoring con tests unitarios (Vitest) — agnóstico e intercambiable",
        "RBAC en dos capas: proxy edge + DAL server (defensa en profundidad)",
        "Validación de inputs con Zod en todas las Server Actions",
        "Transacciones Prisma para operaciones multi-tabla críticas",
        "Cascadas de borrado configuradas en schema (integridad referencial)",
        "Cookie secure derivada de APP_URL (funciona en HTTP interno y HTTPS externo)",
        "Draft del cuestionario sincronizado entre BD y localStorage",
        "Seed idempotente del instrumento (se puede re-ejecutar sin duplicados)",
    ]:
        story.append(tag(t, ok=True))

    story.append(Spacer(1, 0.4*cm))
    story.append(h2("Áreas de mejora"))
    warnings = [
        ("SMPT_PASS en .env versionado", "La contraseña SMTP está en el repositorio. Debe rotarse y moverse a .env.local (ya en .gitignore)."),
        ("Instrumento no dinámico", "getActiveInstrument() devuelve la definición en memoria. En roadmap: carga desde BD."),
        ("Email best-effort silencioso", "Si falla el SMTP, el error se loguea pero no se relanza. Considerar cola de reintentos."),
        ("JWT sin refresh rolling", "Sesión de 7 días fija. Usuario se desconecta aunque esté activo. Añadir refresh automático."),
        ("Sin cron de limpieza", "Las invitaciones caducadas (Invitation.expiresAt) se validan en runtime pero no se limpian en BD."),
        ("PDF export en desarrollo", "reports.ts existe pero la serialización a PDF está pendiente de completar."),
        ("Analytics/Auditoría sin uso", "Tablas AnalyticsEvent y AuditLog creadas pero sin writes implementados aún."),
    ]
    for (title, desc) in warnings:
        story.append(KeepTogether([
            tag(f"<b>{title}</b>", ok=False),
            Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{desc}", S["body_sm"]),
            Spacer(1, 0.1*cm),
        ]))

    # ── 8. DESPLIEGUE ────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.3*cm))
    story.append(section(8, "Configuración de Despliegue"))

    story.append(h2("Servidor de producción"))
    deploy_data = [
        ["Parámetro", "Valor"],
        ["Host", "appsrv01 · 192.168.3.208"],
        ["Usuario", "fgarola"],
        ["Directorio", "/opt/disc-gesem"],
        ["Puerto app", "3005"],
        ["Dominio público", "disc.fgarola.es (HTTPS, Certbot Let's Encrypt)"],
        ["Proceso", "systemd: disc-gesem.service"],
        ["Proxy HTTP", "nginx → proxy_pass http://127.0.0.1:3005"],
        ["BD", "Supabase PostgreSQL (pooler :6543 app / :5432 migraciones)"],
        ["Node.js", "v24.14.1"],
    ]
    story.append(make_table(deploy_data[0], deploy_data[1:], [4.5*cm, 12*cm]))
    story.append(Spacer(1, 0.3*cm))

    story.append(h2("Proceso de redeploy"))
    story.append(code(
        "ssh fgarola@192.168.3.208<br/>"
        "cd /opt/disc-gesem<br/>"
        "git pull origin main<br/>"
        "npm ci --no-audit<br/>"
        "npm run build&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# prisma generate + next build<br/>"
        "sudo systemctl restart disc-gesem"
    ))

    story.append(h2("Variables de entorno requeridas"))
    env_data = [
        ["Variable", "Ejemplo / Notas"],
        ["DATABASE_URL", "postgresql://...@pooler.supabase.com:6543/postgres?sslmode=no-verify"],
        ["DIRECT_URL", "postgresql://...@pooler.supabase.com:5432/postgres?sslmode=no-verify (migraciones)"],
        ["AUTH_SECRET", "cadena aleatoria larga — CAMBIAR EN PRODUCCIÓN"],
        ["APP_URL", "https://disc.fgarola.es (determina cookie secure)"],
        ["SMTP_HOST", "mail.gesem.cat"],
        ["SMTP_PORT", "465 (SSL directo)"],
        ["SMTP_USER", "comunicacions@gesem.cat"],
        ["SMTP_PASS", "*** secreto — no versionar en .env ***"],
        ["EMAIL_FROM", "DISC GESEM <comunicacions@gesem.cat>"],
        ["NEXT_PUBLIC_SUPABASE_URL", "https://<project>.supabase.co"],
        ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_... (clave pública, segura en frontend)"],
    ]
    story.append(make_table(env_data[0], env_data[1:], [5.5*cm, 11*cm]))

    # ── 9. DEPENDENCIAS ───────────────────────────────────────────────────────
    story.append(PageBreak())
    story.append(section(9, "Dependencias Clave"))

    deps = [
        ["Paquete", "Versión", "Uso"],
        ["next", "16.2.7", "Framework — App Router, RSC, Server Actions, proxy"],
        ["react / react-dom", "19.2.4", "UI — hooks useActionState, useOptimistic"],
        ["typescript", "^5", "Tipado estático strict mode"],
        ["prisma / @prisma/client", "^7.8.0", "ORM + generación de tipos"],
        ["@prisma/adapter-pg", "^7.8.0", "Adapter pg para PgBouncer compatible"],
        ["pg", "^8.21.0", "Driver PostgreSQL nativo"],
        ["@supabase/supabase-js", "^2.108.1", "Realtime (presencia online)"],
        ["jose", "^6.2.3", "JWT HS256 — edge-safe (sin Node crypto)"],
        ["bcryptjs", "^3.0.3", "Hash de contraseñas en login"],
        ["zod", "^4.4.3", "Validación de Server Action inputs"],
        ["nodemailer", "^8.0.10", "SMTP — invitaciones + informes"],
        ["tailwindcss", "^4", "CSS utility-first con variables CSS nativas"],
        ["vitest", "^4.1.8", "Tests unitarios del motor de scoring"],
        ["eslint", "^9", "Linting (plugin react-hooks, next)"],
    ]
    story.append(make_table(deps[0], deps[1:], [5*cm, 2.5*cm, 9*cm]))

    # ── 10. ESTADO Y PRÓXIMOS PASOS ────────────────────────────────────────────
    story.append(Spacer(1, 0.4*cm))
    story.append(section(10, "Estado Actual y Próximos Pasos"))

    story.append(h2("Estado en producción"))
    status = [
        ["Componente", "Estado", "Notas"],
        ["BD — tablas", "✓ Operativo", "4 migraciones aplicadas, seed ejecutado"],
        ["Instrumento DISC v1", "✓ Publicado", "4 dim · 7 ctx · 35 ítems en BD"],
        ["Cuestionario libre (intake)", "✓ Operativo", "/evaluacion — nombre+email → token"],
        ["Cuestionario por invitación", "✓ Operativo", "/evaluacion/[token] con persistencia"],
        ["Panel Admin", "✓ Operativo", "Todas las rutas /admin/* activas"],
        ["Panel Cliente", "✓ Operativo", "Proyectos, equipos, participantes"],
        ["Sistema de email", "✓ Operativo", "SMTP gesem.cat — invitaciones + informes"],
        ["HTTPS", "✓ Activo", "Let's Encrypt — disc.fgarola.es"],
        ["PDF export", "⚠ Parcial", "Server action existe, generación pendiente"],
        ["Analytics / Auditoría", "⚠ Pendiente", "Tablas creadas, writes por implementar"],
        ["Cron de limpieza", "⚠ Pendiente", "Invitaciones caducadas acumulándose"],
    ]
    story.append(make_table(status[0], status[1:], [5*cm, 3*cm, 8.5*cm]))

    story.append(Spacer(1, 0.4*cm))
    story.append(h2("Próximos pasos recomendados"))
    nexts = [
        "<b>Seguridad (urgente)</b>: rotar SMTP_PASS y moverla a .env.local",
        "<b>PDF export</b>: completar generación del informe en PDF descargable",
        "<b>Instrumentos dinámicos</b>: cargar definición desde BD en lugar de memoria",
        "<b>JWT refresh rolling</b>: renovar cookie en cada request activo",
        "<b>Cron de limpieza</b>: marcar EXPIRED las invitaciones vencidas periódicamente",
        "<b>Analytics</b>: implementar writes en AnalyticsEvent para métricas de uso",
        "<b>Tests E2E</b>: cubrir flujo completo de evaluación con Playwright",
        "<b>Validación psicométrica</b>: pilotaje con usuarios reales y análisis factorial",
    ]
    for n in nexts:
        story.append(bullet(n))

    return story


# ── Encabezado / pie de página ────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    today = datetime.date.today().strftime("%d/%m/%Y")
    # línea superior
    canvas.setStrokeColor(INDIGO)
    canvas.setLineWidth(2)
    canvas.line(2*cm, H - 1.2*cm, W - 2*cm, H - 1.2*cm)
    # título en cabecera
    canvas.setFillColor(INDIGO)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(2*cm, H - 1*cm, "DISC GESEM — Informe Técnico")
    canvas.setFillColor(SLATE_500)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W - 2*cm, H - 1*cm, today)
    # pie
    canvas.setStrokeColor(SLATE_200)
    canvas.setLineWidth(0.5)
    canvas.line(2*cm, 1.5*cm, W - 2*cm, 1.5*cm)
    canvas.setFillColor(SLATE_500)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawCentredString(W/2, 1.1*cm, f"Página {doc.page}  ·  Uso interno GESEM  ·  Confidencial")
    canvas.restoreState()


def on_first_page(canvas, doc):
    canvas.saveState()
    canvas.restoreState()


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    story = build()

    doc.build(
        story,
        onFirstPage=on_first_page,
        onLaterPages=on_page,
    )
    print(f"PDF generado: {OUTPUT}")


if __name__ == "__main__":
    main()
