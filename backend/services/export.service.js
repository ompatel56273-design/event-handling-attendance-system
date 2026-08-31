const XLSX = require('xlsx');

exports.generateWorkbook = (sheetsData, format = 'xlsx') => {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheetsData) {
    const { sheetName, data } = sheet;
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-compute column widths based on max content length
    if (data.length > 0) {
      const colWidths = Object.keys(data[0]).map((key) => {
        const maxLen = Math.max(
          key.length,
          ...data.map((row) => (row[key] ? String(row[key]).length : 0))
        );
        return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
      });
      worksheet['!cols'] = colWidths;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');
  }

  if (format === 'csv') {
    // Return CSV text of the first sheet
    const firstSheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
  }

  // Return binary buffer for XLSX
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
