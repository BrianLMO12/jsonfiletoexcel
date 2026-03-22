
import React, { useState } from 'react';
// Import icons from react-icons
import { MdCloudUpload, MdDownload, MdErrorOutline, MdCheckCircle, MdEdit } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
// Import utility functions
import {
  hasNestedArrays,
  flattenData,
  getFlattenedHeaders,
  downloadJSON,
  downloadCSV,
  downloadExcel,
  parseJSON,
} from '../utils/fileConverter';


// Main Converter component
export default function Converter() {
  // State variables
  const [jsonData, setJsonData] = useState(null); // The loaded JSON data
  const [filename, setFilename] = useState('data'); // The filename for downloads
  const [isDragging, setIsDragging] = useState(false); // Drag state for upload
  const [error, setError] = useState(null); // Error message
  const [message, setMessage] = useState(null); // Success/info message
  const [viewMode, setViewMode] = useState('original'); // Preview mode
  const [downloadingFormat, setDownloadingFormat] = useState(null); // Downloading state


  // Reads a file and parses it as JSON
  function handleFileRead(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setError(null);
        // Parse the file content as JSON
        const parsed = parseJSON(e.target.result);
        setJsonData(parsed);
        // Set filename (remove extension)
        setFilename(file.name.replace(/\.[^/.]+$/, ''));
        setMessage('JSON loaded successfully');
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setError(err.message);
        setJsonData(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setJsonData(null);
    };
    reader.readAsText(file);
  }


  // Handles file drop (drag-and-drop)
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Only accept .json files
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        handleFileRead(file);
      } else {
        setError('Please upload a valid JSON file');
      }
    }
  }


  // Handles drag over event
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }
  // Handles drag leave event
  function handleDragLeave() {
    setIsDragging(false);
  }
  // Handles file input (click-to-upload)
  function handleFileInput(e) {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  }


  // Handles download for each format
  async function handleDownload(format) {
    if (!jsonData) return;
    try {
      setDownloadingFormat(format);
      setError(null);
      const hasNested = hasNestedArrays(jsonData);
      // Add a short delay for loading effect
      const delay = format === 'excel' ? 500 : 300;
      await new Promise(res => setTimeout(res, delay));
      if (format === 'json') {
        downloadJSON(jsonData, filename);
      } else if (format === 'csv') {
        const rows = flattenData(jsonData, hasNested);
        const headers = getFlattenedHeaders(jsonData, hasNested);
        downloadCSV(headers, rows, filename);
      } else if (format === 'excel') {
        const rows = flattenData(jsonData, hasNested);
        const headers = getFlattenedHeaders(jsonData, hasNested);
        downloadExcel(headers, rows, filename);
      }
      setMessage(format.toUpperCase() + ' downloaded successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError('Failed to download ' + format + ': ' + err.message);
    } finally {
      setDownloadingFormat(null);
    }
  }


  // Helper: Checks if data has nested arrays
  const hasNested = jsonData && hasNestedArrays(jsonData);
  // Helper: Flattens data for preview/download
  const flattenedRows = jsonData && flattenData(jsonData, hasNested);
  // Helper: Gets headers for flattened data
  const flattenedHeaders = jsonData && getFlattenedHeaders(jsonData, hasNested);

  // Returns preview text for the preview box
  function getPreviewData() {
    if (viewMode === 'original') {
      // Show original JSON (limit to 800 chars)
      const str = JSON.stringify(jsonData, null, 2);
      return str.length > 800 ? str.substring(0, 800) + '...' : str;
    } else {
      // Show flattened data (first 5 rows)
      const headerStr = flattenedHeaders.join(' | ');
      const rowsStr = flattenedRows
        .slice(0, 5)
        .map(row => flattenedHeaders.map(h => String(row[h] ?? '')).join(' | '))
        .join('\n');
      return headerStr + '\n' + rowsStr + (flattenedRows.length > 5 ? '\n... and more rows' : '');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            JSON to Excel Converter
          </h1>
          <p className="text-gray-400">Upload JSON, download in multiple formats with hierarchical data support</p>
        </div>

        {/* Glass-morphism Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl space-y-6">

          {/* Upload Section */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${isDragging
              ? 'border-white bg-white/20'
              : 'border-white/40 hover:border-white/60 bg-white/5'
              }`}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <MdCloudUpload className="w-16 h-16 mx-auto mb-4 text-white/70 hover:text-white transition" />
              <p className="text-white font-semibold mb-2">
                {isDragging ? 'Drop your JSON file here' : 'Drag & drop your JSON file here'}
              </p>
              <p className="text-white/60 text-sm">or click to browse</p>
            </label>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <MdErrorOutline className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <MdCheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-200 text-sm">{message}</p>
            </div>
          )}

          {/* Data Loaded State */}
          {jsonData && (
            <>
              {/* Filename Input */}
              <div className="relative">
                <label className="block text-white/80 text-sm font-medium mb-2">Custom Filename</label>
                <div className="relative">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/60 focus:bg-white/20 transition pr-10"
                    placeholder="Enter filename"
                  />
                  <MdEdit className="absolute right-3 top-2.5 w-4 h-4 text-white/50" />
                </div>
                <p className="text-white/50 text-xs mt-1">Extension will be added automatically</p>
              </div>

              {/* View Toggle (only if nested data) */}
              {hasNested && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('original')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${viewMode === 'original'
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                  >
                    Original JSON
                  </button>
                  <button
                    onClick={() => setViewMode('flattened')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${viewMode === 'flattened'
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                  >
                    Flattened View
                  </button>
                </div>
              )}

              {/* Preview */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  {viewMode === 'original' ? 'Original JSON Preview' : 'Flattened Data Preview'}
                  {hasNested && viewMode === 'flattened' && (
                    <span className="ml-2 text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded">
                      Nested data detected
                    </span>
                  )}
                </label>
                <div className="bg-black/50 border border-white/20 rounded-lg p-4 h-40 overflow-y-auto">
                  <pre className="text-white/70 text-xs font-mono whitespace-pre-wrap break-words">
                    {getPreviewData()}
                  </pre>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {['json', 'csv', 'excel'].map((format) => (
                  <button
                    key={format}
                    onClick={() => handleDownload(format)}
                    disabled={downloadingFormat !== null}
                    className={`relative px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${downloadingFormat === format
                      ? 'bg-white/30 text-white cursor-wait'
                      : downloadingFormat !== null
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-white to-gray-300 text-black hover:from-white hover:to-white shadow-lg hover:shadow-xl'
                      }`}
                  >
                    {downloadingFormat === format ? (
                      <>
                        <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <MdDownload className="w-4 h-4" />
                        <span>{format.toUpperCase()}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="text-xs text-white/50 text-center">
                {hasNested && (
                  <p>✓ Nested arrays detected and will be flattened for CSV and Excel exports</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/40 text-sm">
          <p>Supports hierarchical JSON with nested arrays</p>
        </div>
      </div>
    </div>
  );
}
