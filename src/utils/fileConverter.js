import * as XLSX from 'xlsx';

// Check if data has nested arrays
function hasNestedArrays(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }

  for (const item of data) {
    if (typeof item === 'object' && item !== null) {
      for (const key of Object.keys(item)) {
        if (Array.isArray(item[key]) && item[key].length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// Recursively flatten nested arrays into separate rows
function flattenData(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }

  const flattened = [];

  for (const item of data) {
    if (typeof item !== 'object' || item === null) {
      flattened.push(item);
      continue;
    }

    // Find array and scalar/object properties
    const arrayKeys = Object.keys(item).filter(key => Array.isArray(item[key]));
    const scalarData = {};

    for (const key of Object.keys(item)) {
      if (!Array.isArray(item[key])) {
        scalarData[key] = item[key];
      }
    }

    if (arrayKeys.length === 0) {
      // No nested arrays, just add as is
      flattened.push(scalarData);
    } else {
      // Find the array with the most items
      let maxItems = 1;
      for (const arrayKey of arrayKeys) {
        const nestedArray = item[arrayKey];
        if (Array.isArray(nestedArray) && nestedArray.length > maxItems) {
          maxItems = nestedArray.length;
        }
      }

      // Expand each item in the nested array
      for (let i = 0; i < maxItems; i++) {
        const expandedRow = { ...scalarData };

        for (const arrayKey of arrayKeys) {
          const nestedArray = item[arrayKey];
          if (Array.isArray(nestedArray) && i < nestedArray.length) {
            const nestedItem = nestedArray[i];

            // Recursively flatten nested objects/arrays
            if (typeof nestedItem === 'object' && nestedItem !== null) {
              for (const nestedKey of Object.keys(nestedItem)) {
                const value = nestedItem[nestedKey];

                // If the nested value is an array, stringify it
                if (Array.isArray(value)) {
                  expandedRow[`${arrayKey}_${nestedKey}`] = JSON.stringify(value);
                } else if (typeof value === 'object' && value !== null) {
                  expandedRow[`${arrayKey}_${nestedKey}`] = JSON.stringify(value);
                } else {
                  expandedRow[`${arrayKey}_${nestedKey}`] = value;
                }
              }
            } else {
              expandedRow[arrayKey] = nestedItem;
            }
          }
        }

        flattened.push(expandedRow);
      }
    }
  }

  return flattened;
}

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
  // Flatten nested data before converting to CSV
  const flattenedData = flattenData(data);
  const csvContent = jsonToCSV(flattenedData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
}

function downloadExcel(data, filename) {
  if (filename === undefined) {
    filename = 'data.xlsx';
  }

  // Flatten nested data before converting to Excel
  const flattenedData = flattenData(data);

  const worksheet = XLSX.utils.json_to_sheet(flattenedData);
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

export { jsonToCSV, downloadJSON, downloadCSV, downloadExcel, parseJSON, flattenData, hasNestedArrays };