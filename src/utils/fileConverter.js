
// Checks if the data has any nested arrays of objects at the top level
export function hasNestedArrays(data) {
  // Data must be a non-empty array
  if (!Array.isArray(data) || data.length === 0) return false;
  // Look at the first item
  const firstItem = data[0];
  if (typeof firstItem !== 'object' || firstItem === null) return false;
  // If any property is a non-empty array of objects, return true
  for (const value of Object.values(firstItem)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      return true;
    }
  }
  return false;
}


// Helper: Collects all unique column names (excluding arrays) from data and nested objects
function getAllHeaders(data) {
  const headers = new Set();

  // Add all non-array keys from an object
  function addHeadersFromObject(obj) {
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        if (!Array.isArray(obj[key])) {
          headers.add(key);
        }
      }
    }
  }

  // Go through each item and its nested arrays
  const arr = Array.isArray(data) ? data : [data];
  for (const item of arr) {
    addHeadersFromObject(item);
    for (const value of Object.values(item)) {
      if (Array.isArray(value)) {
        for (const nested of value) {
          addHeadersFromObject(nested);
        }
      }
    }
  }
  return Array.from(headers);
}


// Flattens data with nested arrays into rows for CSV/Excel
export function flattenData(data, hasNested) {
  // If no nested arrays, just return the data as an array
  if (!hasNested) {
    return Array.isArray(data) ? data : [data];
  }

  const rows = [];
  const arr = Array.isArray(data) ? data : [data];
  // Get all column headers (excluding arrays)
  const allHeaders = getAllHeaders(arr);

  // Find which keys are arrays of objects
  const arrayFields = new Set();
  for (const item of arr) {
    for (const [key, value] of Object.entries(item)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        arrayFields.add(key);
      }
    }
  }
  // Only keep headers that are not array fields
  const headers = allHeaders.filter(h => !arrayFields.has(h));

  // For each item in the data
  for (const item of arr) {
    // Find all array fields in this item
    const nestedArrays = {};
    for (const [key, value] of Object.entries(item)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        nestedArrays[key] = value;
      }
    }

    // If there are nested arrays, add parent row and then child rows
    if (Object.keys(nestedArrays).length > 0) {
      // Parent row: just the parent values, blank marker
      const parentRow = {};
      for (const header of headers) {
        const val = item[header];
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
          parentRow[header] = JSON.stringify(val);
        } else {
          parentRow[header] = val ?? '';
        }
      }
      parentRow._nestedMarker = '';
      rows.push(parentRow);

      // For each nested array, add a row for each nested item
      for (const [arrayKey, arrayItems] of Object.entries(nestedArrays)) {
        for (const nestedItem of arrayItems) {
          const nestedRow = {};
          for (const header of headers) {
            if (header in nestedItem) {
              const val = nestedItem[header];
              if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
                nestedRow[header] = JSON.stringify(val);
              } else {
                nestedRow[header] = val ?? '';
              }
            } else {
              nestedRow[header] = '';
            }
          }
          // Mark which array this row came from
          nestedRow._nestedMarker = arrayKey;
          rows.push(nestedRow);
        }
      }
    } else {
      // No nested arrays, just add the parent row
      const parentRow = {};
      for (const header of headers) {
        const val = item[header];
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
          parentRow[header] = JSON.stringify(val);
        } else {
          parentRow[header] = val ?? '';
        }
      }
      parentRow._nestedMarker = '';
      rows.push(parentRow);
    }
  }
  return rows;
}


// Returns the headers for the flattened data (adds blank marker column if nested)
export function getFlattenedHeaders(data, hasNested) {
  const arr = Array.isArray(data) ? data : [data];
  if (!hasNested) {
    return Object.keys(arr[0] || {});
  }
  const allHeaders = getAllHeaders(arr);
  // Remove array fields
  const arrayFields = new Set();
  for (const item of arr) {
    for (const [key, value] of Object.entries(item)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        arrayFields.add(key);
      }
    }
  }
  const headers = allHeaders.filter(h => !arrayFields.has(h));
  headers.push('_nestedMarker');
  return headers;
}


// Converts rows and headers to CSV string, escaping commas, quotes, and newlines
export function jsonToCSV(headers, rows) {
  function escape(value) {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }
  // First row: headers (blank for marker column)
  const headerRow = headers.map(h => h === '_nestedMarker' ? '' : h).join(',');
  // Data rows
  const dataRows = rows.map(row => headers.map(h => escape(row[h])).join(','));
  return [headerRow, ...dataRows].join('\n');
}


// Downloads a file from a Blob object
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// Downloads the data as a JSON file
export function downloadJSON(data, filename) {
  try {
    const jsonStr = JSON.stringify(data, null, 2); // Pretty print
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const name = filename.endsWith('.json') ? filename : filename + '.json';
    downloadFile(blob, name);
    return true;
  } catch (err) {
    console.error('Error downloading JSON:', err);
    throw err;
  }
}


// Downloads the data as a CSV file
export function downloadCSV(headers, rows, filename) {
  try {
    const csv = jsonToCSV(headers, rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const name = filename.endsWith('.csv') ? filename : filename + '.csv';
    downloadFile(blob, name);
    return true;
  } catch (err) {
    console.error('Error downloading CSV:', err);
    throw err;
  }
}


// Downloads the data as an Excel file (.xlsx)
export function downloadExcel(headers, rows, filename) {
  try {
    const XLSX = window.XLSX;
    if (!XLSX) throw new Error('XLSX library not loaded');
    // Prepare data for Excel: first row is headers, then data
    const excelHeaders = headers.map(h => h === '_nestedMarker' ? '' : h);
    const dataArray = rows.map(row => headers.map(h => row[h] ?? ''));
    const wsData = [excelHeaders, ...dataArray];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map(() => ({ wch: 15 })); // Set column width
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const name = filename.endsWith('.xlsx') ? filename : filename + '.xlsx';
    XLSX.writeFile(wb, name);
    return true;
  } catch (err) {
    console.error('Error downloading Excel:', err);
    throw err;
  }
}


// Tries to parse a string as JSON, throws a clear error if invalid
export function parseJSON(fileContent) {
  try {
    return JSON.parse(fileContent);
  } catch (err) {
    throw new Error('Invalid JSON: ' + err.message);
  }
}
