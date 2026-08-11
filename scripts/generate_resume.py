#!/usr/bin/env python3
"""Generate Charlie Abejo's human-first, ATS-readable resume PDF."""

from __future__ import annotations

from pathlib import Path
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


PAGE_WIDTH, PAGE_HEIGHT = LETTER
MARGIN_X = 0.58 * inch
MARGIN_TOP = 0.48 * inch
MARGIN_BOTTOM = 0.45 * inch

INK = colors.HexColor("#20252B")
MUTED = colors.HexColor("#647081")
TEAL = colors.HexColor("#0F6B60")
TEAL_LIGHT = colors.HexColor("#E9F3F1")
RULE = colors.HexColor("#D8DEDD")


class ResumeDocTemplate(BaseDocTemplate):
    def afterInit(self):
        self.title = "Charlie James Z. Abejo - Full-Stack Web & Mobile Developer Resume"
        self.author = "Charlie James Z. Abejo"
        self.subject = "Full-stack web and mobile developer resume"


styles = getSampleStyleSheet()

NAME = ParagraphStyle(
    "Name",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=23,
    leading=26,
    textColor=INK,
    spaceAfter=4,
)

ROLE = ParagraphStyle(
    "Role",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=10.5,
    leading=13,
    textColor=TEAL,
    spaceAfter=5,
)

CONTACT = ParagraphStyle(
    "Contact",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.2,
    leading=10.5,
    textColor=MUTED,
)

SECTION = ParagraphStyle(
    "Section",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=10.2,
    leading=12,
    tracking=1.3,
    textColor=TEAL,
    spaceBefore=8,
    spaceAfter=5,
)

BODY = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.35,
    leading=11.2,
    textColor=INK,
    spaceAfter=4,
)

SMALL = ParagraphStyle(
    "Small",
    parent=BODY,
    fontSize=7.5,
    leading=9.4,
    textColor=MUTED,
    spaceAfter=0,
)

LABEL = ParagraphStyle(
    "Label",
    parent=BODY,
    fontName="Helvetica-Bold",
    textColor=TEAL,
    spaceAfter=0,
)

ENTRY_TITLE = ParagraphStyle(
    "EntryTitle",
    parent=BODY,
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=12,
    spaceAfter=0,
)

ENTRY_DATE = ParagraphStyle(
    "EntryDate",
    parent=BODY,
    fontName="Helvetica-Bold",
    fontSize=8.2,
    leading=10,
    textColor=MUTED,
    alignment=TA_RIGHT,
    spaceAfter=0,
)

BULLET = ParagraphStyle(
    "Bullet",
    parent=BODY,
    leftIndent=10,
    firstLineIndent=-7,
    bulletIndent=0,
    spaceAfter=1.5,
)

PROJECT_TITLE = ParagraphStyle(
    "ProjectTitle",
    parent=BODY,
    fontName="Helvetica-Bold",
    fontSize=9.6,
    leading=11.5,
    textColor=INK,
    spaceAfter=1,
)

FOOTER = ParagraphStyle(
    "Footer",
    parent=SMALL,
    alignment=TA_CENTER,
    fontSize=7,
    textColor=MUTED,
)


def link(url: str, label: str) -> str:
    return f'<link href="{url}" color="#0F6B60"><u>{label}</u></link>'


def section(title: str):
    return [
        Paragraph(title.upper(), SECTION),
        Table([[""]], colWidths=[PAGE_WIDTH - 2 * MARGIN_X], rowHeights=[0.7], style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), RULE),
            ("LINEBELOW", (0, 0), (-1, -1), 0, RULE),
        ])),
        Spacer(1, 4),
    ]


def bullet(text: str) -> Paragraph:
    return Paragraph(f"- {text}", BULLET)


def skills_row(label_text: str, value_text: str) -> Table:
    table = Table(
        [[Paragraph(label_text, LABEL), Paragraph(value_text, BODY)]],
        colWidths=[1.38 * inch, PAGE_WIDTH - 2 * MARGIN_X - 1.38 * inch],
        hAlign="LEFT",
    )
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 10),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.35, RULE),
    ]))
    return table


def dated_heading(title: str, date: str) -> Table:
    date_width = max(0.9 * inch, stringWidth(date, "Helvetica-Bold", 8.2) + 8)
    table = Table(
        [[Paragraph(title, ENTRY_TITLE), Paragraph(date, ENTRY_DATE)]],
        colWidths=[PAGE_WIDTH - 2 * MARGIN_X - date_width, date_width],
        hAlign="LEFT",
    )
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return table


def experience(title: str, date: str, bullets: list[str], stack: str) -> KeepTogether:
    content = [dated_heading(title, date)]
    content.extend(bullet(item) for item in bullets)
    content.append(Paragraph(f"<b>Stack:</b> {stack}", SMALL))
    content.append(Spacer(1, 7))
    return KeepTogether(content)


def project(title: str, date: str, body: str, stack: str, project_url: str | None = None) -> KeepTogether:
    title_markup = title
    if project_url:
        title_markup = f'{title} - {link(project_url, "Google Play")}'
    content = [
        dated_heading(title_markup, date),
        Paragraph(body, BODY),
        Paragraph(f"<b>Stack:</b> {stack}", SMALL),
        Spacer(1, 7),
    ]
    return KeepTogether(content)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN_X, 0.31 * inch, PAGE_WIDTH - MARGIN_X, 0.31 * inch)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(PAGE_WIDTH / 2, 0.18 * inch, f"Charlie James Z. Abejo | Page {doc.page}")
    canvas.restoreState()


def build_story():
    story = [
        Paragraph("CHARLIE JAMES Z. ABEJO", NAME),
        Paragraph("Full-Stack Web & Mobile Developer | TypeScript | React Native | Go | Python", ROLE),
        Paragraph(
            "Misamis Oriental, Philippines (Remote) &nbsp;&nbsp; | &nbsp;&nbsp; +63 985 612 2843 &nbsp;&nbsp; | &nbsp;&nbsp; "
            + link("mailto:capstonee2@gmail.com", "capstonee2@gmail.com")
            + "<br/>"
            + link("https://github.com/CharlieJamesGwapo", "github.com/CharlieJamesGwapo")
            + " &nbsp;&nbsp; | &nbsp;&nbsp; "
            + link("https://portfoliobboy.vercel.app", "portfoliobboy.vercel.app"),
            CONTACT,
        ),
        Spacer(1, 4),
    ]

    story.extend(section("Professional Summary"))
    story.append(Paragraph(
        "Full-stack web and mobile developer with <b>2 years of professional experience</b> building production applications, APIs, integrations, and real-time systems. Experienced delivering products end to end, from requirements and data modeling to user interfaces, backend services, deployment, documentation, and handover. Comfortable working directly with non-technical stakeholders and owning dependable systems across TypeScript, React, React Native, Go, Python, .NET, PostgreSQL, and cloud infrastructure.",
        BODY,
    ))

    story.extend(section("Core Skills"))
    story.extend([
        skills_row("Frontend & Mobile", "React, Next.js, TypeScript, React Native (Expo), Android (Java/Kotlin), Vue.js, Angular, Tailwind CSS, Zustand"),
        skills_row("Backend & APIs", "Go (Gin), Python (FastAPI, Django, Flask, Celery), Node.js/Express, C#/.NET, PHP/Laravel, REST, GraphQL, WebSockets, webhooks"),
        skills_row("Data & Infrastructure", "PostgreSQL, Supabase, Neon, MySQL, Firebase, Redis, AWS Lambda, Docker, Linux VPS, Vercel, GitLab/Buddy/Jenkins CI/CD"),
        skills_row("Systems & Tools", "CRM integrations, bidirectional sync, JWT, RBAC, audit trails, OTP/2FA, payments, reconciliation, Git, GitHub, Claude Code, GitHub Copilot"),
    ])

    story.extend(section("Professional Experience"))
    story.extend([
        experience(
            "Full-Stack Developer (Contract) - Multi-Club Fitness Group, Australia",
            "2026",
            [
                "Built a production CRM and management platform unifying member records, subscriptions, payments, visit history, outreach, and revenue/retention dashboards.",
                "Designed a bidirectional Python sync worker with Celery, Redis, durable Postgres jobs, idempotency, bounded retries, and reconciliation against source financial reports.",
                "Integrated Twilio Voice browser calling and translated plain-language business requirements into technical specifications and production architecture.",
            ],
            "TypeScript, Next.js 16, React 19, Python, Celery, Redis, Supabase Postgres, Docker, Twilio",
        ),
        experience(
            "Full-Stack Developer - Rooche Digital Company",
            "Jan 2026 - Mar 2026",
            [
                "Delivered client dashboards and web applications with React, Next.js, Angular, Node.js, and FastAPI backends.",
                "Built validated REST and GraphQL APIs, Firebase/Supabase authentication, row-level security, and real-time WebSocket/webhook updates.",
                "Maintained GitLab, Buddy, and Bitbucket CI/CD with preview deployments and pytest quality gates.",
            ],
            "Python, FastAPI, Node.js, React, Next.js, Angular, PostgreSQL, Firebase, Supabase, Docker",
        ),
        experience(
            "Full-Stack Developer - Robustech IT / SocietyOne, Australia",
            "Jan 2024 - Dec 2025",
            [
                "Re-platformed Go and Node.js microservices to .NET for a regulated fintech platform, standardizing logging, error handling, and deployments.",
                "Built Python and .NET AWS Lambda workflows for partner banking and lending integrations.",
                "Owned JSON-RPC, WebSocket, webhook, reconciliation, reporting, and partner-feed automation with staged CI/CD and rollback support.",
            ],
            "C#/.NET, Python, Go, Node.js, AWS Lambda, PostgreSQL, REST, GraphQL, Buddy CI/CD",
        ),
        PageBreak(),
    ])

    story.extend(section("Selected Projects"))
    story.extend([
        project(
            "One Ride Balingasag (OMJI)",
            "Started Apr 2026",
            "Built a complete Balingasag ride-hailing and delivery platform covering Pasugo, Pasabay, Pasundo, and local store delivery. The platform supports fare estimates, maps, live rider tracking, scheduled bookings, OTP/JWT authentication, payments, ratings, SOS, and rider/store/admin operations.",
            "React Native, Expo, TypeScript, Go, Gin, PostgreSQL, GORM, WebSockets, React",
            "https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en",
        ),
        project(
            "OMJI Internet Access & Billing System",
            "Apr-Jun 2026",
            "Developed an operations platform for internet cafes, hotspots, and small ISPs with prepaid time billing, voucher generation, multi-station management, revenue reporting, per-account permissions, and MikroTik RouterOS integration across web, mobile, and endpoint-agent clients.",
            "TypeScript, Go, React, Docker, MikroTik RouterOS, Web and mobile clients",
        ),
        project(
            "MOIST Alumni Tracking System",
            "Jan-Aug 2025",
            "Created a secure alumni registration, profile management, records, and administrative reporting platform with role-based access, audit trails, relational data modeling, analytics, and OTP/2FA over SMS and email.",
            "PHP, Laravel, MySQL, JavaScript, RBAC, OTP/2FA",
        ),
        Paragraph(
            "<b>Additional projects:</b> Filtra Coffee POS, E-Cycle Hub waste-pickup scheduling, Jolly Ride, and native Android massage booking applications.",
            BODY,
        ),
    ])

    story.extend(section("Education"))
    story.append(dated_heading(
        "BS in Information Technology - Misamis Oriental Institute of Science and Technology",
        "2022 - 2025",
    ))
    story.append(Paragraph("Dean's Lister, 2nd and 3rd Year (Ranked 2) | TOPCIT participant (2024-2025)", BODY))

    story.extend(section("Selected Certifications"))
    certs = [
        "Databases with SQL - Harvard CS50",
        "Java SE 8 Programmer I | Go Programming",
        "AI Fluency: Framework & Foundations - Anthropic, 2026",
        "Microsoft: Manage AD DS Domain Controllers & FSMO Roles",
        "Windows Server and Active Directory administration training",
    ]
    cert_table = Table(
        [[Paragraph(f"- {item}", BODY)] for item in certs],
        colWidths=[PAGE_WIDTH - 2 * MARGIN_X],
        hAlign="LEFT",
    )
    cert_table.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(cert_table)

    story.extend(section("Availability"))
    availability = Table(
        [[Paragraph(
            "<b>Available for remote full-stack, backend, and mobile opportunities.</b> Flexible overlap for US and Australian business hours. Independent, detail-focused, and comfortable owning delivery from architecture through deployment, documentation, and maintenance.",
            BODY,
        )]],
        colWidths=[PAGE_WIDTH - 2 * MARGIN_X],
        hAlign="LEFT",
    )
    availability.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.6, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(availability)

    return story


def build_resume(output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame = Frame(
        MARGIN_X,
        MARGIN_BOTTOM,
        PAGE_WIDTH - 2 * MARGIN_X,
        PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM,
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    template = PageTemplate(id="resume", frames=[frame], onPage=footer)
    doc = ResumeDocTemplate(
        str(output_path),
        pagesize=LETTER,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        title="Charlie James Z. Abejo - Full-Stack Web & Mobile Developer Resume",
        author="Charlie James Z. Abejo",
        subject="Full-stack web and mobile developer resume",
    )
    doc.addPageTemplates([template])
    doc.build(build_story())


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("output/pdf/ABEJO_CHARLIE_JAMES_RESUME.pdf")
    build_resume(output)
    print(output.resolve())


if __name__ == "__main__":
    main()
