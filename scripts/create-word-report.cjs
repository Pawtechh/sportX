const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  AlignmentType,
  PageBreak
} = require('docx');

const mdContent = fs.readFileSync(path.join(__dirname, '..', 'docs', 'REPORTE_FINAL.md'), 'utf8');

// Colores institucionales
const COLOR_PRIMARY = '0F172A'; // Slate 900
const COLOR_ACCENT = '65A30D';  // Lime 600
const COLOR_MUTED = '475569';   // Slate 600
const COLOR_BG_LIGHT = 'F8FAFC';// Slate 50
const COLOR_BORDER = 'CBD5E1';  // Slate 300

function createTitle(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.TITLE,
    spacing: { before: 200, after: 120 },
    run: {
      font: 'Calibri',
      size: 44, // 22pt
      bold: true,
      color: COLOR_PRIMARY,
    },
  });
}

function createHeading1(text, pageBreakBefore = false) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: pageBreakBefore,
    spacing: { before: 360, after: 140 },
    run: {
      font: 'Calibri',
      size: 32, // 16pt
      bold: true,
      color: COLOR_PRIMARY,
    },
  });
}

function createHeading2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    run: {
      font: 'Calibri',
      size: 26, // 13pt
      bold: true,
      color: COLOR_MUTED,
    },
  });
}

function createHeading3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    run: {
      font: 'Calibri',
      size: 22, // 11pt
      bold: true,
      color: COLOR_PRIMARY,
    },
  });
}

function parseMarkdownParagraph(text) {
  // Parsea negritas e itálicas básicas
  const runs = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|[^*`]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const part = match[0];
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        font: 'Calibri',
        size: 21,
        color: '000000'
      }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        font: 'Calibri',
        size: 21
      }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: 'Consolas',
        size: 19,
        color: COLOR_PRIMARY
      }));
    } else {
      runs.push(new TextRun({
        text: part,
        font: 'Calibri',
        size: 21
      }));
    }
  }
  return runs.length ? runs : [new TextRun({ text, font: 'Calibri', size: 21 })];
}

function createParagraph(text) {
  return new Paragraph({
    children: parseMarkdownParagraph(text),
    spacing: { before: 60, after: 100, line: 280 },
  });
}

function createBullet(text) {
  return new Paragraph({
    children: parseMarkdownParagraph(text),
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
  });
}

function createTableFromMdRows(headerRow, dataRows) {
  const headers = headerRow.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
  
  const colCount = headers.length;
  const colWidth = Math.floor(9200 / colCount);

  const headerCells = headers.map(h => new TableCell({
    width: { size: colWidth, type: WidthType.DXA },
    shading: { fill: COLOR_PRIMARY, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 19, font: 'Calibri' })],
        alignment: AlignmentType.LEFT
      })
    ]
  }));

  const rows = [new TableRow({ children: headerCells, tableHeader: true })];

  dataRows.forEach((r, idx) => {
    const cells = r.split('|').filter(c => c.trim().length > 0).map(c => c.trim());
    const isEven = idx % 2 === 1;
    const tableCells = cells.map(cellText => new TableCell({
      width: { size: colWidth, type: WidthType.DXA },
      shading: isEven ? { fill: COLOR_BG_LIGHT, type: ShadingType.CLEAR } : undefined,
      margins: { top: 100, bottom: 100, left: 140, right: 140 },
      children: [
        new Paragraph({
          children: parseMarkdownParagraph(cellText),
          spacing: { before: 40, after: 40 }
        })
      ]
    }));
    rows.push(new TableRow({ children: tableCells }));
  });

  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    rows: rows,
    alignment: AlignmentType.CENTER
  });
}

// Procesar el markdown en bloques de Documento
const lines = mdContent.split(/\r?\n/);
const docChildren = [];

let inTable = false;
let tableHeader = '';
let tableRows = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // Detección de tablas markdown
  if (line.startsWith('|') && line.endsWith('|')) {
    if (!inTable) {
      inTable = true;
      tableHeader = line;
      tableRows = [];
    } else {
      if (line.includes('---')) {
        // Separador de cabecera
        continue;
      }
      tableRows.push(line);
    }
    continue;
  } else if (inTable) {
    inTable = false;
    docChildren.push(createTableFromMdRows(tableHeader, tableRows));
    docChildren.push(new Paragraph({ spacing: { after: 140 } }));
  }

  if (!line) continue;

  if (line.startsWith('# ')) {
    const isMainSection = line.includes('1.') || line.includes('2.') || line.includes('3.') || line.includes('Anexo');
    docChildren.push(createHeading1(line.replace(/^#\s*/, ''), isMainSection));
  } else if (line.startsWith('## ')) {
    docChildren.push(createHeading2(line.replace(/^##\s*/, '')));
  } else if (line.startsWith('### ')) {
    docChildren.push(createHeading3(line.replace(/^###\s*/, '')));
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    docChildren.push(createBullet(line.replace(/^[-*]\s*/, '')));
  } else if (/^\d+\.\s/.test(line)) {
    docChildren.push(createBullet(line.replace(/^\d+\.\s*/, '')));
  } else if (line.startsWith('---')) {
    // Línea separadora
    continue;
  } else {
    docChildren.push(createParagraph(line));
  }
}

if (inTable) {
  docChildren.push(createTableFromMdRows(tableHeader, tableRows));
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 pulgada = 1440 dxa (~2.54cm)
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: docChildren,
    },
  ],
});

const docxPath = path.join(__dirname, '..', 'docs', 'REPORTE_FINAL.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  console.log(`Documento Word DOCX generado exitosamente: ${docxPath} (${buffer.length} bytes)`);
});
