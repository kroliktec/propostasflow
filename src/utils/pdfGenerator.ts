import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';
import { Proposal, Product, Emissor, PdfTemplate } from '../types';
import { formatCurrency, formatDate } from './formatters';

const wrapText = (text: string, maxCharsPerLine: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = (currentLine + ' ' + word).trim();
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  return lines;
};

const wrapTextByWidth = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
  if (!text) return [];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
};

export const generateProposalPdf = async (
  proposal: Proposal,
  productsMap: Map<string, Product>,
  emissor?: Emissor,
  template?: PdfTemplate | null
): Promise<{ blob: Blob; url: string }> => {
  let pdfDoc: PDFDocument;

  const templateRaw = template ? (template.pdfBase64 || template.base64) : null;
  if (templateRaw) {
    try {
      const templateBytes = Uint8Array.from(atob(templateRaw), (c) => c.charCodeAt(0));
      pdfDoc = await PDFDocument.load(templateBytes);
    } catch (err) {
      console.warn('Failed to load PDF template, creating fresh document:', err);
      pdfDoc = await PDFDocument.create();
    }
  } else {
    pdfDoc = await PDFDocument.create();
  }

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 595.28; // A4 standard width
  const PAGE_HEIGHT = 841.89; // A4 standard height
  const MARGIN = 36;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  // Colors
  const colorBrand = rgb(91 / 255, 2 / 255, 80 / 255); // #5b0250
  const colorBrandLight = rgb(247 / 255, 240 / 255, 246 / 255);
  const colorBrandBorder = rgb(220 / 255, 190 / 255, 215 / 255);
  const colorDark = rgb(24 / 255, 24 / 255, 27 / 255);
  const colorGray = rgb(113 / 255, 113 / 255, 122 / 255);
  const colorLightGray = rgb(244 / 255, 244 / 255, 245 / 255);
  const colorBorder = rgb(228 / 255, 228 / 255, 231 / 255);
  const colorWhite = rgb(1, 1, 1);
  const colorEmerald = rgb(16 / 255, 185 / 255, 129 / 255);

  let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - MARGIN;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY - neededHeight < MARGIN + 40) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentY = PAGE_HEIGHT - MARGIN;
      drawSubHeader();
    }
  };

  const drawSubHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: currentY - 24,
      width: CONTENT_WIDTH,
      height: 24,
      color: colorLightGray,
    });
    page.drawText(`Proposta Comercial — ${proposal.empresa} (continuação)`, {
      x: MARGIN + 10,
      y: currentY - 16,
      size: 9,
      font: fontBold,
      color: colorBrand,
    });
    currentY -= 36;
  };

  // 1. Top Header Banner
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 72,
    width: PAGE_WIDTH,
    height: 72,
    color: colorBrand,
  });

  page.drawText('PROPOSTASFLOW', {
    x: MARGIN,
    y: PAGE_HEIGHT - 38,
    size: 20,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText('SOLUÇÕES EM TELEFONIA IP, COMUNICAÇÃO & SERVIÇOS DIGITAIS', {
    x: MARGIN,
    y: PAGE_HEIGHT - 54,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.9, 0.8, 0.9),
  });

  const proposalIdText = `PROPOSTA #${proposal.id.slice(0, 8).toUpperCase()}`;
  const idWidth = fontBold.widthOfTextAtSize(proposalIdText, 10);
  page.drawText(proposalIdText, {
    x: PAGE_WIDTH - MARGIN - idWidth,
    y: PAGE_HEIGHT - 36,
    size: 10,
    font: fontBold,
    color: colorWhite,
  });

  const dateText = `Emissão: ${formatDate(proposal.createdAt)} | Validade: ${proposal.validade}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 8);
  page.drawText(dateText, {
    x: PAGE_WIDTH - MARGIN - dateWidth,
    y: PAGE_HEIGHT - 52,
    size: 8,
    font: fontRegular,
    color: rgb(0.95, 0.85, 0.95),
  });

  currentY = PAGE_HEIGHT - 88;

  // 2. Client & Issuer Info Card (2 Columns with dynamic wrap to prevent overflow)
  const colWidth = CONTENT_WIDTH / 2;
  const colTextMaxWidth = colWidth - 24;

  const empresaFullText = `Empresa: ${proposal.empresa}`;
  const empresaLines = wrapTextByWidth(empresaFullText, fontBold, 8.5, colTextMaxWidth);

  const contatoFullText = `Contato: ${proposal.contato || 'Responsável'}${proposal.emailContato ? ` • ${proposal.emailContato}` : ''}`;
  const contatoLines = wrapTextByWidth(contatoFullText, fontRegular, 7.5, colTextMaxWidth);

  const emissorRazaoText = `Razão: ${emissor?.razao || 'Krolik Tecnologia LTDA'}`;
  const emissorLines = wrapTextByWidth(emissorRazaoText, fontBold, 8.5, colTextMaxWidth);

  const statusText = `Status: ${proposal.status.toUpperCase()} • Validade: ${proposal.validade}`;
  const statusLines = wrapTextByWidth(statusText, fontRegular, 7.5, colTextMaxWidth);

  const clientHeight = 16 + (empresaLines.length * 11) + 11 + (contatoLines.length * 10) + 10;
  const emissorHeight = 16 + (emissorLines.length * 11) + 11 + (statusLines.length * 10) + 10;
  const infoCardHeight = Math.max(68, clientHeight, emissorHeight);

  page.drawRectangle({
    x: MARGIN,
    y: currentY - infoCardHeight,
    width: CONTENT_WIDTH,
    height: infoCardHeight,
    color: colorLightGray,
    borderColor: colorBorder,
    borderWidth: 1,
  });

  // Vertical divider between columns
  page.drawLine({
    start: { x: MARGIN + colWidth, y: currentY - 8 },
    end: { x: MARGIN + colWidth, y: currentY - infoCardHeight + 8 },
    color: colorBorder,
    thickness: 0.8,
  });

  // Left col: Cliente
  let leftY = currentY - 15;
  page.drawText('DADOS DO CLIENTE / CONTRATANTE', {
    x: MARGIN + 12,
    y: leftY,
    size: 7.5,
    font: fontBold,
    color: colorBrand,
  });
  leftY -= 12;

  empresaLines.forEach((line) => {
    page.drawText(line, {
      x: MARGIN + 12,
      y: leftY,
      size: 8.5,
      font: fontBold,
      color: colorDark,
    });
    leftY -= 11;
  });

  page.drawText(`CNPJ: ${proposal.cnpj || 'Não informado'}`, {
    x: MARGIN + 12,
    y: leftY,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });
  leftY -= 11;

  contatoLines.forEach((line) => {
    page.drawText(line, {
      x: MARGIN + 12,
      y: leftY,
      size: 7.5,
      font: fontRegular,
      color: colorGray,
    });
    leftY -= 10;
  });

  // Right col: Emissor
  let rightY = currentY - 15;
  page.drawText('EMISSOR DA PROPOSTA / CONTRATADA', {
    x: MARGIN + colWidth + 12,
    y: rightY,
    size: 7.5,
    font: fontBold,
    color: colorBrand,
  });
  rightY -= 12;

  emissorLines.forEach((line) => {
    page.drawText(line, {
      x: MARGIN + colWidth + 12,
      y: rightY,
      size: 8.5,
      font: fontBold,
      color: colorDark,
    });
    rightY -= 11;
  });

  page.drawText(`CNPJ: ${emissor?.cnpj || '12.345.678/0001-99'}`, {
    x: MARGIN + colWidth + 12,
    y: rightY,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });
  rightY -= 11;

  statusLines.forEach((line) => {
    page.drawText(line, {
      x: MARGIN + colWidth + 12,
      y: rightY,
      size: 7.5,
      font: fontRegular,
      color: colorGray,
    });
    rightY -= 10;
  });

  currentY -= (infoCardHeight + 16);

  // 3. Products Table Header
  page.drawText('COMPOSIÇÃO DOS SERVIÇOS E PRODUTOS', {
    x: MARGIN,
    y: currentY,
    size: 10,
    font: fontBold,
    color: colorBrand,
  });
  currentY -= 14;

  const tableHeaderHeight = 20;
  page.drawRectangle({
    x: MARGIN,
    y: currentY - tableHeaderHeight,
    width: CONTENT_WIDTH,
    height: tableHeaderHeight,
    color: colorBrand,
  });

  // Columns:
  // Item (24) | Descrição / Código (260) | Qtd (40) | Setup Un. (65) | MRR Un. (65) | Subtotal (69)
  page.drawText('#', { x: MARGIN + 6, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });
  page.drawText('PRODUTO / SERVIÇO', { x: MARGIN + 26, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });
  page.drawText('QTD', { x: MARGIN + 285, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });
  page.drawText('SETUP UN.', { x: MARGIN + 325, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });
  page.drawText('MRR UN.', { x: MARGIN + 395, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });
  page.drawText('TOTAL MÊS', { x: MARGIN + 465, y: currentY - 14, size: 8, font: fontBold, color: colorWhite });

  currentY -= tableHeaderHeight;

  // Table Rows
  proposal.items.forEach((item, index) => {
    const prod = productsMap.get(item.productId);
    const prodName = prod?.name || item.productId;
    const prodCode = prod?.codigo ? `[${prod.codigo}] ` : '';
    const isSpecialSetup = item.productId === 'setup';

    const unitSetup = item.customSetup ?? item.setup;
    const unitMrr = item.customMrr ?? item.mrr;
    const totalItemMrr = unitMrr * item.qty;

    // Wrap product name if long
    const wrappedLines = wrapText(`${prodCode}${prodName}`, 48);
    const rowHeight = Math.max(22, wrappedLines.length * 11 + 8);

    checkPageBreak(rowHeight);

    const isEven = index % 2 === 0;
    page.drawRectangle({
      x: MARGIN,
      y: currentY - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: isSpecialSetup ? colorBrandLight : (isEven ? colorWhite : colorLightGray),
      borderColor: colorBorder,
      borderWidth: 0.5,
    });

    // Row Number
    page.drawText(String(index + 1), {
      x: MARGIN + 6,
      y: currentY - 14,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });

    // Product Name lines
    let textY = currentY - 13;
    wrappedLines.forEach((line) => {
      page.drawText(line, {
        x: MARGIN + 26,
        y: textY,
        size: 8,
        font: isSpecialSetup ? fontBold : fontRegular,
        color: isSpecialSetup ? colorBrand : colorDark,
      });
      textY -= 10;
    });

    // Qtd
    page.drawText(`${item.qty}`, {
      x: MARGIN + 292,
      y: currentY - 14,
      size: 8.5,
      font: fontBold,
      color: colorDark,
    });

    // Setup Unit
    page.drawText(formatCurrency(unitSetup), {
      x: MARGIN + 325,
      y: currentY - 14,
      size: 8,
      font: fontRegular,
      color: unitSetup > 0 ? colorDark : colorGray,
    });

    // MRR Unit
    page.drawText(formatCurrency(unitMrr), {
      x: MARGIN + 395,
      y: currentY - 14,
      size: 8,
      font: fontRegular,
      color: unitMrr > 0 ? colorBrand : colorGray,
    });

    // Total MRR
    page.drawText(formatCurrency(totalItemMrr), {
      x: MARGIN + 465,
      y: currentY - 14,
      size: 8.5,
      font: fontBold,
      color: colorBrand,
    });

    currentY -= rowHeight;
  });

  currentY -= 14;

  // 4. Financial Summary Bento Cards
  checkPageBreak(85);

  const bentoCardWidth = (CONTENT_WIDTH - 12) / 2;
  const bentoCardHeight = 65;

  // Left Bento Card: Investimento Único (Setup)
  page.drawRectangle({
    x: MARGIN,
    y: currentY - bentoCardHeight,
    width: bentoCardWidth,
    height: bentoCardHeight,
    color: colorBrandLight,
    borderColor: colorBrandBorder,
    borderWidth: 1,
  });

  page.drawText('INVESTIMENTO ÚNICO (SETUP / ATIVAÇÃO)', {
    x: MARGIN + 12,
    y: currentY - 18,
    size: 8,
    font: fontBold,
    color: colorBrand,
  });

  page.drawText(formatCurrency(proposal.totalSetup), {
    x: MARGIN + 12,
    y: currentY - 40,
    size: 18,
    font: fontBold,
    color: colorDark,
  });

  page.drawText('Investimento pontual referente à implantação e treinamento', {
    x: MARGIN + 12,
    y: currentY - 54,
    size: 7.5,
    font: fontRegular,
    color: colorGray,
  });

  // Right Bento Card: Recorrência Mensal (MRR)
  page.drawRectangle({
    x: MARGIN + bentoCardWidth + 12,
    y: currentY - bentoCardHeight,
    width: bentoCardWidth,
    height: bentoCardHeight,
    color: colorBrand,
  });

  page.drawText('INVESTIMENTO MENSAL (MRR TOTAL)', {
    x: MARGIN + bentoCardWidth + 24,
    y: currentY - 18,
    size: 8,
    font: fontBold,
    color: rgb(0.9, 0.8, 0.9),
  });

  page.drawText(`${formatCurrency(proposal.totalMrr)} / mês`, {
    x: MARGIN + bentoCardWidth + 24,
    y: currentY - 40,
    size: 18,
    font: fontBold,
    color: colorWhite,
  });

  page.drawText('Faturamento mensal dos serviços e canais contratados', {
    x: MARGIN + bentoCardWidth + 24,
    y: currentY - 54,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.95, 0.9, 0.95),
  });

  currentY -= (bentoCardHeight + 14);

  // 5. Considerações Comerciais
  checkPageBreak(60);

  page.drawText('CONDIÇÕES GERAIS E CONSIDERAÇÕES:', {
    x: MARGIN,
    y: currentY,
    size: 8.5,
    font: fontBold,
    color: colorBrand,
  });
  currentY -= 12;

  const notesLines = wrapText(
    proposal.consideracoes || 'Proposta comercial válida conforme prazos e condições acordadas. Valores em Reais (BRL).',
    100
  );

  notesLines.slice(0, 6).forEach((line) => {
    checkPageBreak(12);
    page.drawText(line, {
      x: MARGIN,
      y: currentY,
      size: 8,
      font: fontRegular,
      color: colorGray,
    });
    currentY -= 11;
  });

  currentY -= 16;

  // 6. Client Acceptance & Signature (Assinatura da Contratada removida da proposta)
  checkPageBreak(75);

  const sigWidth = 280;

  // Client signature line
  page.drawLine({
    start: { x: MARGIN, y: currentY - 32 },
    end: { x: MARGIN + sigWidth, y: currentY - 32 },
    thickness: 1,
    color: colorBorder,
  });

  page.drawText('De acordo e Aceite da Proposta:', {
    x: MARGIN,
    y: currentY - 42,
    size: 7.5,
    font: fontBold,
    color: colorDark,
  });
  page.drawText(`${proposal.empresa} — ${proposal.contato || 'Representante Legal'}`, {
    x: MARGIN,
    y: currentY - 52,
    size: 7,
    font: fontRegular,
    color: colorGray,
  });
  page.drawText(`Data: _____ / _____ / ${new Date().getFullYear()}`, {
    x: MARGIN,
    y: currentY - 62,
    size: 7,
    font: fontRegular,
    color: colorGray,
  });

  currentY -= 75;

  // 7. Footer on all pages
  const totalPages = pdfDoc.getPageCount();
  pdfDoc.getPages().forEach((p, idx) => {
    p.drawLine({
      start: { x: MARGIN, y: 28 },
      end: { x: PAGE_WIDTH - MARGIN, y: 28 },
      thickness: 0.5,
      color: colorBorder,
    });

    p.drawText(`PropostasFlow — Documento emitido eletronicamente em ${new Date().toLocaleDateString('pt-BR')}`, {
      x: MARGIN,
      y: 18,
      size: 7,
      font: fontRegular,
      color: colorGray,
    });

    const pageNumText = `Página ${idx + 1} de ${totalPages}`;
    const pageNumWidth = fontRegular.widthOfTextAtSize(pageNumText, 7);
    p.drawText(pageNumText, {
      x: PAGE_WIDTH - MARGIN - pageNumWidth,
      y: 18,
      size: 7,
      font: fontRegular,
      color: colorGray,
    });
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  return { blob, url };
};
