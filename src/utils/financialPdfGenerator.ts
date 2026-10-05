import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { OrderItem } from "../types";

export interface ExpenseItem {
  id: string;
  desc: string;
  category: string;
  amount: number;
  date: string;
}

export interface FinancialReportData {
  monthName: string;
  year: number | string;
  orders: OrderItem[];
  expenses: ExpenseItem[];
  workshopName?: string;
}

export function generateMonthlyFinancialPdf(data: FinancialReportData): jsPDF {
  const {
    monthName = "Mês Vigente",
    year = new Date().getFullYear(),
    orders,
    expenses,
    workshopName = "Oficina 3D Maker",
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculations
  const grossRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? grossRevenue / totalOrdersCount : 0;

  // Platform commissions (estimated ~18% average for ML/Shopee)
  const marketplaceOrders = orders.filter(
    (o) => o.platform === "Mercado Livre" || o.platform === "Shopee"
  );
  const marketplaceRevenue = marketplaceOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const estimatedMarketplaceFees = Number((marketplaceRevenue * 0.175).toFixed(2));

  const directOrders = orders.filter(
    (o) => o.platform !== "Mercado Livre" && o.platform !== "Shopee"
  );
  const directRevenue = directOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Categorize expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  const insumosCost = expensesByCategory["Insumos"] || 0;
  const embalagensCost = expensesByCategory["Embalagens"] || 0;
  const energiaCost = expensesByCategory["Energia"] || 0;
  const manutencaoCost = expensesByCategory["Manutenção"] || 0;
  const outrosCost = expensesByCategory["Outros"] || 0;

  const netProfit = grossRevenue - estimatedMarketplaceFees - totalExpenses;
  const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Helper colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const accentBlue = [37, 99, 235]; // Blue 600
  const emeraldColor = [5, 150, 105]; // Emerald 600
  const dangerRed = [220, 38, 38]; // Red 600
  const bgLight = [248, 250, 252]; // Slate 50

  // 1. TOP BANNER HEADER
  doc.setFillColor(15, 23, 42); // Dark Slate background
  doc.rect(0, 0, pageWidth, 28, "F");

  // App / Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VERSÁTIL MAKER 3D", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text("SISTEMA DE GESTÃO, CUSTOS & PRODUÇÃO ADITIVA", 14, 18);

  // Document Badge on Right
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - 75, 7, 61, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("RELATÓRIO FINANCEIRO", pageWidth - 44.5, 13, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`${monthName.toUpperCase()} / ${year}`, pageWidth - 44.5, 18, { align: "center" });

  let currentY = 34;

  // 2. METADATA SECTION
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Oficina: ${workshopName}`, 14, currentY);
  doc.text(
    `Emissão: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    pageWidth - 14,
    currentY,
    { align: "right" }
  );

  currentY += 6;

  // 3. EXECUTIVE KPI METRIC CARDS (4 Boxes)
  const cardWidth = (pageWidth - 28 - 9) / 4; // 4 cards with 3mm gap
  const cardHeight = 22;

  // Card 1: Faturamento Bruto
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("RECEITA BRUTA", 18, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`R$ ${grossRevenue.toFixed(2)}`, 18, currentY + 14);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalOrdersCount} pedidos`, 18, currentY + 19);

  // Card 2: Taxas e Comissões
  const card2X = 14 + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TAXAS MARKETPLACE", card2X + 4, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(`-R$ ${estimatedMarketplaceFees.toFixed(2)}`, card2X + 4, currentY + 14);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Shopee + Mercado Livre", card2X + 4, currentY + 19);

  // Card 3: Custos & Despesas
  const card3X = card2X + cardWidth + 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("DESPESAS / INSUMOS", card3X + 4, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(220, 38, 38);
  doc.text(`-R$ ${totalExpenses.toFixed(2)}`, card3X + 4, currentY + 14);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`${expenses.length} lançamentos`, card3X + 4, currentY + 19);

  // Card 4: Lucro Líquido Real (Destaque Verde)
  const card4X = card3X + cardWidth + 3;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(167, 243, 208); // Emerald 200
  doc.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.text("LUCRO LÍQUIDO REAL", card4X + 4, currentY + 6);
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`R$ ${netProfit.toFixed(2)}`, card4X + 4, currentY + 14);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Margem: ${netMarginPercent.toFixed(1)}%`, card4X + 4, currentY + 19);

  currentY += cardHeight + 7;

  // 4. DEMONSTRATIVO DE RESULTADO DO EXERCÍCIO (DRE SINTÉTICO)
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("1. Demonstrativo de Resultado Sintético (DRE 3D)", 14, currentY);

  currentY += 2;

  const dreRows = [
    ["(+) RECEITA BRUTA DE VENDAS", `${totalOrdersCount} pedidos`, `R$ ${grossRevenue.toFixed(2)}`, "100.0%"],
    ["  • Vendas Mercado Livre", `${orders.filter((o) => o.platform === "Mercado Livre").length} pedidos`, `R$ ${orders.filter((o) => o.platform === "Mercado Livre").reduce((s, o) => s + o.totalPrice, 0).toFixed(2)}`, `${grossRevenue > 0 ? ((orders.filter((o) => o.platform === "Mercado Livre").reduce((s, o) => s + o.totalPrice, 0) / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Vendas Shopee", `${orders.filter((o) => o.platform === "Shopee").length} pedidos`, `R$ ${orders.filter((o) => o.platform === "Shopee").reduce((s, o) => s + o.totalPrice, 0).toFixed(2)}`, `${grossRevenue > 0 ? ((orders.filter((o) => o.platform === "Shopee").reduce((s, o) => s + o.totalPrice, 0) / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Vendas Diretas / WhatsApp / Balcão", `${directOrders.length} pedidos`, `R$ ${directRevenue.toFixed(2)}`, `${grossRevenue > 0 ? ((directRevenue / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["(-) DEDUÇÕES & TAXAS DE MARKETPLACES", "Comissões estimadas", `-R$ ${estimatedMarketplaceFees.toFixed(2)}`, `${grossRevenue > 0 ? ((estimatedMarketplaceFees / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["(=) RECEITA OPERACIONAL LÍQUIDA", "Receita pós-taxas", `R$ ${(grossRevenue - estimatedMarketplaceFees).toFixed(2)}`, `${grossRevenue > 0 ? (((grossRevenue - estimatedMarketplaceFees) / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["(-) CUSTOS OPERACIONAIS & DESPESAS DA OFICINA", `${expenses.length} lançamentos`, `-R$ ${totalExpenses.toFixed(2)}`, `${grossRevenue > 0 ? ((totalExpenses / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Insumos (Filamentos / Resinas)", `${expenses.filter((e) => e.category === "Insumos").length} itens`, `-R$ ${insumosCost.toFixed(2)}`, `${grossRevenue > 0 ? ((insumosCost / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Embalagens & Despacho", `${expenses.filter((e) => e.category === "Embalagens").length} itens`, `-R$ ${embalagensCost.toFixed(2)}`, `${grossRevenue > 0 ? ((embalagensCost / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Energia Elétrica da Oficina", `${expenses.filter((e) => e.category === "Energia").length} itens`, `-R$ ${energiaCost.toFixed(2)}`, `${grossRevenue > 0 ? ((energiaCost / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Manutenção, Nozzles & Peças", `${expenses.filter((e) => e.category === "Manutenção").length} itens`, `-R$ ${manutencaoCost.toFixed(2)}`, `${grossRevenue > 0 ? ((manutencaoCost / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["  • Outras Despesas", `${expenses.filter((e) => e.category === "Outros").length} itens`, `-R$ ${outrosCost.toFixed(2)}`, `${grossRevenue > 0 ? ((outrosCost / grossRevenue) * 100).toFixed(1) : "0"}%`],
    ["(=) RESULTADO LÍQUIDO DO PERÍODO (LUCRO REAL)", "Saldo Líquido", `R$ ${netProfit.toFixed(2)}`, `${netMarginPercent.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Descrição Financeira", "Referência", "Valor (R$)", "% Receita"]],
    body: dreRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: "normal", fontSize: 7.5 },
      1: { cellWidth: 40, fontStyle: "normal", fontSize: 7.5, textColor: [100, 116, 139] },
      2: { cellWidth: 32, halign: "right", fontStyle: "bold", fontSize: 7.5 },
      3: { cellWidth: 25, halign: "right", fontStyle: "bold", fontSize: 7.5, textColor: [71, 85, 105] },
    },
    didParseCell: (cellData) => {
      const rowIndex = cellData.row.index;
      // Highlight Key Lines
      if (rowIndex === 0 || rowIndex === 5) {
        cellData.cell.styles.fontStyle = "bold";
        cellData.cell.styles.fillColor = [241, 245, 249];
      }
      if (rowIndex === 4 || rowIndex === 6) {
        cellData.cell.styles.textColor = [185, 28, 28];
      }
      if (rowIndex === 12) {
        // Net Profit Final Row
        cellData.cell.styles.fontStyle = "bold";
        cellData.cell.styles.fillColor = [209, 250, 229]; // Emerald 100
        cellData.cell.styles.textColor = [4, 120, 87]; // Emerald 700
      }
    },
    styles: {
      cellPadding: 1.6,
      overflow: "linebreak",
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // 5. BREAKDOWN TABLES: DESPESAS DETALHADAS & VENDAS
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. Extrato das Despesas Operacionais Registradas", 14, currentY);

  currentY += 2;

  const expenseRows = expenses.map((e) => [
    e.date || "-",
    e.desc,
    e.category,
    `-R$ ${e.amount.toFixed(2)}`,
  ]);

  if (expenseRows.length === 0) {
    expenseRows.push(["-", "Nenhuma despesa registrada no período", "-", "R$ 0,00"]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [["Data", "Descrição da Despesa", "Categoria", "Valor (R$)"]],
    body: expenseRows,
    theme: "plain",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 25, fontSize: 7, textColor: [100, 116, 139] },
      1: { cellWidth: 85, fontSize: 7, fontStyle: "bold" },
      2: { cellWidth: 42, fontSize: 7, textColor: [71, 85, 105] },
      3: { cellWidth: 30, halign: "right", fontSize: 7.5, fontStyle: "bold", textColor: [220, 38, 38] },
    },
    styles: {
      cellPadding: 1.6,
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page or fit recent orders
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("3. Amostra dos Principais Pedidos & Entradas do Mês", 14, currentY);

  currentY += 2;

  const orderRows = orders.slice(0, 12).map((o) => {
    const code = o.orderCode || o.code || `PED-${o.id.slice(0, 6)}`;
    const cust = o.customerName || o.clientName || "Cliente Direto";
    return [
      o.date || "Hoje",
      code,
      cust,
      o.productName,
      o.platform,
      `${o.quantity} un.`,
      `+R$ ${o.totalPrice.toFixed(2)}`,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Data", "Código", "Cliente", "Produto", "Canal", "Qtd", "Total (R$)"]],
    body: orderRows,
    theme: "striped",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 20, fontSize: 7 },
      1: { cellWidth: 22, fontSize: 7, fontStyle: "bold" },
      2: { cellWidth: 30, fontSize: 7 },
      3: { cellWidth: 50, fontSize: 7 },
      4: { cellWidth: 25, fontSize: 7 },
      5: { cellWidth: 15, halign: "center", fontSize: 7 },
      6: { cellWidth: 20, halign: "right", fontStyle: "bold", fontSize: 7.5, textColor: [5, 150, 105] },
    },
    styles: {
      cellPadding: 1.5,
    },
    margin: { left: 14, right: 14 },
  });

  // 6. PAGE NUMBERING & FOOTER ON ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.text(
      "Versátil Maker 3D • Sistema Profissional para Impressão 3D • Documento para Gestão Contábil & Financeira",
      14,
      pageHeight - 7
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: "right" });
  }

  return doc;
}
