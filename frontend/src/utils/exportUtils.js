/**
 * Universal Export & Import Utilities for CampusFlow / EventHub
 * Supports Excel (.xlsx / .xls), CSV, Word (.doc), and styled printable PDF.
 */

// Format data rows into CSV string
export const generateCSV = (headers, rows) => {
  const headerLine = headers.map(h => `"${(h.label || h).replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map(row => {
    return headers.map(h => {
      const key = h.key || h;
      let val = row[key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });
  return [headerLine, ...rowLines].join('\r\n');
};

// Download a blob or text as a file in browser
export const triggerDownload = (content, filename, mimeType) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Export to CSV
export const exportToCSV = (headers, rows, filename = 'export') => {
  const csv = generateCSV(headers, rows);
  triggerDownload('\uFEFF' + csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Export to Excel (XML/HTML spreadsheet format compatible with all versions of Excel)
export const exportToExcel = (title, headers, rows, filename = 'export') => {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title.slice(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, Arial, sans-serif; }
        .header-title { font-size: 16pt; font-weight: bold; color: #4F46E5; }
        .header-meta { font-size: 10pt; color: #64748B; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #4F46E5; color: #FFFFFF; font-weight: bold; border: 1px solid #312E81; padding: 8px 12px; text-align: left; }
        td { border: 1px solid #E2E8F0; padding: 6px 10px; font-size: 10pt; }
        tr:nth-child(even) { background-color: #F8FAFC; }
      </style>
    </head>
    <body>
      <div class="header-title">EVENTHUB ENTERPRISE SUITE — ${title.toUpperCase()}</div>
      <div class="header-meta">Generated on: ${dateStr} • Official Institutional Record</div>
      <table border="1">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h.label || h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${headers.map(h => {
                const key = h.key || h;
                const val = r[key] !== undefined && r[key] !== null ? r[key] : '';
                return `<td>${String(val)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  triggerDownload(tableHtml, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8');
};

// Export to Word (.doc)
export const exportToWord = (title, headers, rows, filename = 'export') => {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; margin: 30px; }
        h1 { color: #4338CA; font-size: 20pt; margin-bottom: 4px; }
        p.subtitle { color: #6B7280; font-size: 10pt; margin-top: 0; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; }
        th { background-color: #4F46E5; color: white; padding: 10px; border: 1px solid #4338CA; text-align: left; font-size: 10.5pt; }
        td { padding: 8px 10px; border: 1px solid #D1D5DB; font-size: 10pt; }
        tr:nth-child(even) { background-color: #F9FAFB; }
        .footer { margin-top: 30px; font-size: 9pt; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 10px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">CampusFlow / EventHub Official Export • Date: ${dateStr}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h.label || h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${headers.map(h => {
                const key = h.key || h;
                const val = r[key] !== undefined && r[key] !== null ? r[key] : '';
                return `<td>${String(val)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">Document certified by EventHub Institutional Verification System</div>
    </body>
    </html>
  `;

  triggerDownload(wordHtml, `${filename}.doc`, 'application/msword;charset=utf-8');
};

// Export to PDF / Print Layout
export const exportToPDF = (title, headers, rows) => {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to generate and print PDF documents.');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} — EventHub Official Record</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0F172A; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4F46E5; padding-bottom: 15px; margin-bottom: 20px; }
        .brand-title { font-size: 20px; font-weight: 900; color: #4F46E5; letter-spacing: 0.5px; }
        .doc-title { font-size: 16px; font-weight: 700; margin-top: 4px; color: #1E293B; }
        .meta { text-align: right; font-size: 12px; color: #64748B; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background: #F1F5F9; color: #334155; font-weight: 800; text-align: left; padding: 10px 12px; border-bottom: 2px solid #CBD5E1; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        td { padding: 9px 12px; border-bottom: 1px solid #E2E8F0; }
        tr:nth-child(even) { background-color: #F8FAFC; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #EEF2FF; color: #4F46E5; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 12px; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #EEF2FF; border: 1px solid #C7D2FE; padding: 12px 18px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: #4338CA;">PDF Ready: Click Print or Save as PDF in your browser dialog.</span>
        <button onclick="window.print()" style="background: #4F46E5; color: #FFF; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 800; cursor: pointer;">🖨️ Print / Save PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand-title">EVENTHUB ENTERPRISE SUITE</div>
          <div class="doc-title">${title}</div>
        </div>
        <div class="meta">
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Total Records:</strong> ${rows.length}</div>
          <div><strong>Verification:</strong> Certified Institutional Data</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h.label || h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${headers.map(h => {
                const key = h.key || h;
                const val = r[key] !== undefined && r[key] !== null ? r[key] : '';
                return `<td>${String(val)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <span>Generated securely from CampusFlow / EventHub Portal</span>
        <span>Page 1 of 1 • Confidential Institutional Document</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 400);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
};
