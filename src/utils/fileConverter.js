import * as XLSX from 'xlsx';

function jsonToCSV(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }

  if (data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaderRow = headers.join(',');

  const csvDataRows = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const csvRow = [];
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      const value = row[header];
      let processedValue;
      if (value === null || value === undefined) {
        processedValue = '';
      } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        processedValue = '"' + value.replace(/"/g, '""') + '"';
      } else {
        processedValue = value;
      }
      csvRow.push(processedValue);
    }
    csvDataRows.push(csvRow.join(','));
  }

  const csvContent = csvHeaderRow + '\n' + csvDataRows.join('\n');
  return csvContent;
}

function downloadJSON(data, filename) {
  if (filename === undefined) {
    filename = 'data.json';
  }
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadFile(blob, filename);
}

function downloadCSV(data, filename) {
  if (filename === undefined) {
    filename = 'data.csv';
  }
  const csvContent = jsonToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

function downloadExcel(data, filename) {
  if (filename === undefined) {
    filename = 'data.xlsx';
  }

  if (!Array.isArray(data)) {
    data = [data];
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

export { jsonToCSV, downloadJSON, downloadCSV, downloadExcel, parseJSON };
