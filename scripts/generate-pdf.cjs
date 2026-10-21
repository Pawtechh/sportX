const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlBody = fs.readFileSync(path.join(__dirname, '..', 'docs', 'reporte.html'), 'utf8');

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Final de Proyecto — SportX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.55;
      color: #1f2937;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    .report-header {
      border-bottom: 3px solid #111827;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }

    .report-header h1 {
      font-size: 24pt;
      font-weight: 900;
      letter-spacing: -0.04em;
      text-transform: uppercase;
      font-style: italic;
      color: #111827;
      margin: 0 0 8px 0;
      border: none;
      padding: 0;
    }

    .report-header h1 span {
      color: #84cc16;
      background: #111827;
      padding: 2px 8px;
      border-radius: 4px;
      font-style: normal;
    }

    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #111827;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-size: 9.5pt;
      line-height: 1.6;
    }

    .meta-card p {
      margin: 0;
    }

    .meta-card strong {
      color: #0f172a;
    }

    h1 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
      page-break-after: avoid;
    }

    h1.section-break {
      page-break-before: always;
      margin-top: 0;
      padding-top: 10px;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    strong {
      color: #0f172a;
      font-weight: 600;
    }

    ul, ol {
      margin: 6px 0 12px 0;
      padding-left: 22px;
    }

    li {
      margin-bottom: 5px;
    }

    li strong {
      color: #111827;
    }

    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 1.5px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 20px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.05em;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 24px 0;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <div class="report-header">
    <h1>SPORT<span>X</span> — Reporte Final de Proyecto</h1>
  </div>
` + htmlBody
  .replace(/<h1>Reporte Final de Proyecto[^\<]*<\/h1>/i, '')
  .replace(/<p><strong>Producto:<\/strong>([\s\S]*?)<\/p>/i, '<div class="meta-card"><p><strong>Producto:</strong>$1</p></div>')
  .replace(/<hr>\s*<h1>/g, '<h1 class="section-break">')
+ `
</body>
</html>`;

const outputPath = path.join(__dirname, '..', 'docs', 'reporte_print.html');
fs.writeFileSync(outputPath, fullHtml, 'utf8');
console.log('HTML para imprimir guardado en:', outputPath);

const pdfPath = path.join(__dirname, '..', 'docs', 'REPORTE_FINAL.pdf');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;
console.log('Generando PDF usando:', browserExe);

const cmd = '"' + browserExe + '" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="' + pdfPath + '" --no-pdf-header-footer "' + outputPath + '"';
execSync(cmd);

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log('PDF generado exitosamente: ' + pdfPath + ' (' + stats.size + ' bytes)');
} else {
  console.error('No se pudo encontrar el archivo PDF generado.');
  process.exit(1);
}
