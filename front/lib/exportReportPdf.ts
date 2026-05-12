import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ── Types ──────────────────────────────────────────────────
interface ExportPayment { method: string; amount: string }

interface ExportOrder {
    id: number
    status: string
    opened_at: string
    closed_at: string | null
    total: string
    subtotal: string
    iva: string
    discount: string
    tables: { number: number }
    user: { name: string }
    shift: { user: { name: string } } | null
    payments: ExportPayment[]
    items: { quantity: number; product: { name: string }; total_with_iva: string }[]
}

interface ExportTotals {
    total_orders: number
    total_revenue: string
    total_iva: string
    total_subtotal: string
    total_discount: string
}

interface ExportFilters {
    status: string
    payment_method: string
    date_from: string
    date_to: string
    search: string
}

// ── Constants ──────────────────────────────────────────────
const BRAND = "#F97316"
const DARK = "#1C1917"
const MUTED = "#78716C"
const WHITE = "#FFFFFF"

const STATUS_LABELS: Record<string, string> = {
    open: "Aberto",
    closed: "Pago",
    canceled: "Cancelado",
    refunded: "Reembolsado",
    partial_refund: "Reemb. Parcial",
}

const METHOD_LABELS: Record<string, string> = {
    cash: "Dinheiro",
    card: "Cartão",
    transfer: "Transferência",
    mbway: "MBWay",
}

// Badge colours keyed by translated label
const STATUS_COLORS: Record<string, [number, number, number]> = {
    "Aberto": [249, 115, 22],
    "Pago": [5, 150, 105],
    "Cancelado": [239, 68, 68],
    "Reembolsado": [59, 130, 246],
    "Reemb. Parcial": [202, 138, 4],
}

// ── Helpers ────────────────────────────────────────────────
function fmtKz(v: string | number) {
    return `Kz ${Number(v).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}`
}

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("pt-AO", {
        day: "2-digit", month: "2-digit", year: "numeric",
    })
}

function fmtDateTime(s: string) {
    return new Date(s).toLocaleString("pt-AO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })
}

function hexToRgb(hex: string): [number, number, number] {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ]
}

// ── Draw helpers ───────────────────────────────────────────
function setColor(doc: jsPDF, hex: string, type: "fill" | "text" | "draw" = "fill") {
    const [r, g, b] = hexToRgb(hex)
    if (type === "fill") doc.setFillColor(r, g, b)
    if (type === "text") doc.setTextColor(r, g, b)
    if (type === "draw") doc.setDrawColor(r, g, b)
}

function drawRect(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    color: string,
    style: "F" | "S" = "F",
) {
    setColor(doc, color, style === "F" ? "fill" : "draw")
    doc.rect(x, y, w, h, style)
}

function txt(
    doc: jsPDF,
    content: string,
    x: number,
    y: number,
    opts: {
        color?: string
        size?: number
        bold?: boolean
        align?: "left" | "center" | "right"
    } = {},
) {
    const { color = DARK, size = 9, bold = false, align = "left" } = opts
    setColor(doc, color, "text")
    doc.setFontSize(size)
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.text(content, x, y, { align })
}

// ── Main export ────────────────────────────────────────────
export async function exportReportPdf(
    orders: ExportOrder[],
    totals: ExportTotals,
    filters: ExportFilters,
    periodLabel?: string,
) {
    // Landscape A4: 297 × 210 mm
    // Margin 14 mm → usable width (UW) = 269 mm
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
    const PW = 297
    const PH = 210
    const M = 14
    const UW = PW - M * 2  // 269 mm

    const now = new Date().toLocaleString("pt-AO", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    })

    // ════════════════════════════════════════════════════════
    // HEADER BAR
    // ════════════════════════════════════════════════════════
    drawRect(doc, 0, 0, PW, 22, BRAND)

    // Logo box — opaque white (jsPDF has no RGBA support)
    drawRect(doc, M, 4, 14, 14, WHITE)
    txt(doc, "R", M + 7, 13, { color: BRAND, size: 10, bold: true, align: "center" })

    txt(doc, "RELATÓRIO DE VENDAS", M + 18, 10, { color: WHITE, size: 13, bold: true })
    txt(
        doc,
        periodLabel ? `Período: ${periodLabel}` : "Todos os períodos",
        M + 18, 17,
        { color: "#FFDBB5", size: 8 },
    )

    txt(doc, `Gerado em ${now}`, PW - M, 10, { color: WHITE, size: 7.5, align: "right" })
    txt(
        doc,
        `${orders.length} pedido${orders.length !== 1 ? "s" : ""} exportado${orders.length !== 1 ? "s" : ""}`,
        PW - M, 17,
        { color: "#FFDBB5", size: 7.5, align: "right" },
    )

    // ════════════════════════════════════════════════════════
    // ACTIVE FILTERS
    // ════════════════════════════════════════════════════════
    let curY = 28
    const hasFilters =
        filters.status || filters.payment_method ||
        filters.date_from || filters.date_to || filters.search

    if (hasFilters) {
        txt(doc, "FILTROS ACTIVOS:", M, curY, { color: MUTED, size: 7, bold: true })
        let fx = M + 30
        const chips: string[] = []
        if (filters.status) chips.push(`Estado: ${STATUS_LABELS[filters.status] ?? filters.status}`)
        if (filters.payment_method) chips.push(`Método: ${METHOD_LABELS[filters.payment_method] ?? filters.payment_method}`)
        if (filters.date_from) chips.push(`De: ${fmtDate(filters.date_from)}`)
        if (filters.date_to) chips.push(`Até: ${fmtDate(filters.date_to)}`)
        if (filters.search) chips.push(`Pesquisa: "${filters.search}"`)

        chips.forEach(chip => {
            const chipW = doc.getTextWidth(chip) + 6
            if (fx + chipW > PW - M) { fx = M + 30; curY += 6 }
            drawRect(doc, fx - 2, curY - 4, chipW, 6, "#FFF7ED")
            setColor(doc, "#FED7AA", "draw")
            doc.setLineWidth(0.3)
            doc.rect(fx - 2, curY - 4, chipW, 6, "S")
            txt(doc, chip, fx + 1, curY, { color: BRAND, size: 6.5 })
            fx += chipW + 4
        })
        curY += 8
    }

    // ════════════════════════════════════════════════════════
    // KPI CARDS — 4 in a row, fits well in landscape
    // 4 cards × cardW + 3 gaps × 4 = UW
    // cardW = (269 - 12) / 4 = 64.25 mm each
    // ════════════════════════════════════════════════════════
    const cardH = 26
    const cardW = (UW - 12) / 4

    const cards = [
        { label: "Total de Pedidos", value: String(totals.total_orders), sub: "pedidos no período", color: BRAND, bg: "#FFF7ED", border: "#FED7AA" },
        { label: "Receita Bruta", value: fmtKz(totals.total_revenue ?? 0), sub: "total faturado", color: "#059669", bg: "#ECFDF5", border: "#BBF7D0" },
        { label: "Total IVA", value: fmtKz(totals.total_iva ?? 0), sub: "imposto cobrado", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
        { label: "Descontos", value: fmtKz(totals.total_discount ?? 0), sub: "total descontado", color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
    ]

    const cardY = curY
    cards.forEach((card, i) => {
        const cx = M + i * (cardW + 4)

        drawRect(doc, cx, cardY, cardW, cardH, card.bg)
        setColor(doc, card.border, "draw")
        doc.setLineWidth(0.4)
        doc.rect(cx, cardY, cardW, cardH, "S")

        // Left accent bar
        drawRect(doc, cx, cardY, 2.5, cardH, card.color)

        // Label
        txt(doc, card.label.toUpperCase(), cx + 6, cardY + 7, { color: MUTED, size: 6, bold: true })

        // Value — auto-shrink if too wide
        doc.setFont("helvetica", "bold")
        setColor(doc, card.color, "text")
        const valSize = doc.getTextWidth(card.value) > cardW - 10 ? 8.5 : 11
        doc.setFontSize(valSize)
        doc.text(card.value, cx + 6, cardY + 17)

        // Sub-label
        txt(doc, card.sub, cx + 6, cardY + 23, { color: "#A8A29E", size: 6 })
    })

    curY = cardY + cardH + 4

    // ════════════════════════════════════════════════════════
    // NET REVENUE STRIP
    // ════════════════════════════════════════════════════════
    drawRect(doc, M, curY, UW, 11, DARK)

    const net = Number(totals.total_revenue ?? 0) - Number(totals.total_discount ?? 0)

    txt(doc, "RECEITA LÍQUIDA", M + 4, curY + 7.5, { color: "#9CA3AF", size: 6.5, bold: true })
    txt(doc, `Subtotal s/ IVA: ${fmtKz(totals.total_subtotal ?? 0)}`, M + 50, curY + 7.5, { color: "#9CA3AF", size: 6.5 })
    txt(doc, `IVA: ${fmtKz(totals.total_iva ?? 0)}`, M + 120, curY + 7.5, { color: "#9CA3AF", size: 6.5 })
    txt(doc, `-${fmtKz(totals.total_discount ?? 0)}`, M + 175, curY + 7.5, { color: "#FCA5A5", size: 6.5 })
    txt(doc, fmtKz(net), PW - M - 4, curY + 7.5, { color: WHITE, size: 9, bold: true, align: "right" })

    curY += 15

    // ════════════════════════════════════════════════════════
    // SECTION HEADING
    // ════════════════════════════════════════════════════════
    txt(doc, "DETALHES DOS PEDIDOS", M, curY - 2, { color: MUTED, size: 7, bold: true })
    drawRect(doc, M, curY, UW, 0.4, "#E7E5E4")
    curY += 3

    // ════════════════════════════════════════════════════════
    // ORDERS TABLE
    //
    // 12 columns — widths sum to exactly 269 mm (UW):
    //  Col  0  #           →   6
    //  Col  1  Pedido      →  16
    //  Col  2  Turno       →  26
    //  Col  3  Mesa        →  12
    //  Col  4  Atendente   →  28
    //  Col  5  Método      →  20
    //  Col  6  Subtotal    →  26
    //  Col  7  IVA         →  20
    //  Col  8  Desconto    →  20
    //  Col  9  Total       →  26
    //  Col 10  Data/Hora   →  34
    //  Col 11  Estado      →  25   ← badge here (was wrongly index 10)
    //                   TOTAL = 259 → tableWidth enforces exact UW
    // ════════════════════════════════════════════════════════
    const colW = [6, 16, 26, 12, 28, 20, 26, 20, 20, 26, 34, 25]
    // sum = 259; autoTable stretches to tableWidth: UW (269)

    const tableBody = orders.map((o, idx) => {
        const payment = o.payments[0] ?? null
        const statusLabel = STATUS_LABELS[o.status] ?? o.status  // always translated
        return [
            String(idx + 1),
            `#${o.id}`,
            o.shift?.user?.name ?? "—",
            String(o.tables.number),
            o.user.name,
            payment ? (METHOD_LABELS[payment.method] ?? payment.method) : "—",
            fmtKz(o.subtotal),
            fmtKz(o.iva),
            fmtKz(o.discount),
            fmtKz(o.total),
            fmtDateTime(o.opened_at),
            statusLabel,   // index 11
        ]
    })

    autoTable(doc, {
        startY: curY,
        head: [["#", "Pedido", "Turno", "Mesa", "Atendente", "Método", "Subtotal", "IVA", "Desconto", "Total", "Data/Hora", "Estado"]],
        body: tableBody,
        margin: { left: M, right: M },
        tableWidth: UW,
        styles: {
            fontSize: 7,
            cellPadding: { top: 2.5, bottom: 2.5, left: 2.5, right: 2.5 },
            font: "helvetica",
            textColor: hexToRgb(DARK),
            lineColor: hexToRgb("#E7E5E4"),
            lineWidth: 0.3,
            overflow: "ellipsize",
        },
        headStyles: {
            fillColor: hexToRgb(DARK),
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 6.5,
            cellPadding: { top: 3, bottom: 3, left: 2.5, right: 2.5 },
        },
        alternateRowStyles: {
            fillColor: hexToRgb("#FAFAF9"),
        },
        columnStyles: {
            0: { cellWidth: colW[0], halign: "center", textColor: hexToRgb(MUTED) },
            1: { cellWidth: colW[1], halign: "center", fontStyle: "bold" },
            2: { cellWidth: colW[2] },
            3: { cellWidth: colW[3], halign: "center" },
            4: { cellWidth: colW[4] },
            5: { cellWidth: colW[5] },
            6: { cellWidth: colW[6], halign: "right" },
            7: { cellWidth: colW[7], halign: "right" },
            8: { cellWidth: colW[8], halign: "right" },
            9: { cellWidth: colW[9], halign: "right", fontStyle: "bold" },
            10: { cellWidth: colW[10], halign: "center" },
            11: { cellWidth: colW[11], halign: "center" },  // Estado — index 11
        },
        didDrawCell(hookData) {
            // Status badge — index 11 (fixed from original which used 10)
            if (hookData.section === "body" && hookData.column.index === 11) {
                const label = String(hookData.cell.text[0])
                const rgb = STATUS_COLORS[label]
                if (!rgb) return

                const { x, y, width, height } = hookData.cell

                // Tinted cell background
                const tint: [number, number, number] = [
                    Math.min(255, Math.round(rgb[0] * 0.12 + 224)),
                    Math.min(255, Math.round(rgb[1] * 0.12 + 224)),
                    Math.min(255, Math.round(rgb[2] * 0.12 + 224)),
                ]
                doc.setFillColor(...tint)
                doc.rect(x + 0.5, y + 0.5, width - 1, height - 1, "F")

                // Coloured bold text
                doc.setTextColor(...rgb)
                doc.setFont("helvetica", "bold")
                doc.setFontSize(6.5)
                doc.text(label, x + width / 2, y + height / 2 + 2, { align: "center" })
            }
        },
        didDrawPage(data) {
            const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } })
                .internal.getNumberOfPages()

            // Footer
            drawRect(doc, 0, PH - 10, PW, 10, DARK)
            txt(doc, "RELATÓRIO DE VENDAS CONFIDENCIAL", M, PH - 4, { color: "#9CA3AF", size: 6 })
            txt(
                doc,
                `Página ${data.pageNumber} de ${pageCount}  ·  Gerado em ${now}`,
                PW - M, PH - 4,
                { color: "#9CA3AF", size: 6, align: "right" },
            )

            // Compact header on continuation pages
            if (data.pageNumber > 1) {
                drawRect(doc, 0, 0, PW, 14, BRAND)
                txt(doc, "RELATÓRIO DE VENDAS", M, 9, { color: WHITE, size: 9, bold: true })
                txt(
                    doc,
                    periodLabel ? `Período: ${periodLabel}` : "Todos os períodos",
                    M, 13,
                    { color: "#FFDBB5", size: 6.5 },
                )
                txt(doc, "(continuação)", PW - M, 9, { color: "#FFDBB5", size: 6.5, align: "right" })
            }
        },
    })

    // ── Save ───────────────────────────────────────────────
    const filename = `relatorio_${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
}