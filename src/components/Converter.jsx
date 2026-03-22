import { useState } from 'react';
import { downloadJSON, downloadCSV, downloadExcel, parseJSON, flattenData, hasNestedArrays } from '../utils/fileConverter';
import { MdCloudUpload, MdDownload, MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function Converter() {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [showFlattened, setShowFlattened] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [hasNested, setHasNested] = useState(false);

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files !== null && files[0] !== undefined) {
      processFile(files[0]);
    }
  }

  function handleFileChange(e) {
    if (e.target.files !== null && e.target.files[0] !== undefined) {
      processFile(e.target.files[0]);
    }
  }

  function processFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = parseJSON(event.target.result);
        setJsonData(parsed);
        setHasNested(hasNestedArrays(parsed));
        setShowFlattened(false);
        setError('');
      } catch (err) {
        setError(err.message);
        setJsonData(null);
        setHasNested(false);
      }
    };
    reader.readAsText(file);
  }

  function getFileName(format) {
    if (customFilename.trim() === '') {
      return `converted.${format}`;
    }
    const nameWithoutExt = customFilename.replace(/\.[^.]*$/, '');
    return `${nameWithoutExt}.${format}`;
  }

  function handleDownload(format) {
    if (jsonData === null) {
      return;
    }

    const filename = getFileName(format);

    if (format === 'json') {
      setIsLoadingJson(true);
      setTimeout(function () {
        downloadJSON(jsonData, filename);
        setIsLoadingJson(false);
      }, 600);
    } else if (format === 'csv') {
      setIsLoadingCsv(true);
      setTimeout(function () {
        downloadCSV(jsonData, filename);
        setIsLoadingCsv(false);
      }, 600);
    } else if (format === 'excel') {
      setIsLoadingExcel(true);
      setTimeout(function () {
        downloadExcel(jsonData, filename);
        setIsLoadingExcel(false);
      }, 600);
    }
  }

  function getDragBoxClass() {
    if (dragActive) {
      return 'drag-area active';
    } else {
      return 'drag-area';
    }
  }

  return (
    <div className="glass-card p-8">
      <h2 className="text-3xl font-bold mb-8 text-black">JSON Converter</h2>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={getDragBoxClass()}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div className="flex flex-col items-center gap-3">
            <MdCloudUpload className="icon-lg" style={{ color: '#000' }} />
            <p className="text-lg font-semibold text-black">Drag and drop your JSON file</p>
            <p className="text-sm text-gray-600">or click to select a file</p>
          </div>
        </label>
      </div>

      {error !== '' ? (
        <div className="error-message mt-6 flex gap-3 items-start">
          <MdErrorOutline className="icon-md flex-shrink-0" style={{ marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      ) : null}

      {jsonData !== null ? (
        <div className="mt-10">
          <h3 className="text-xl font-bold mb-6 text-black">Preview</h3>

          {hasNested ? (
            <div className="mb-6 flex gap-2 pb-4 border-b border-gray-300">
              <button
                onClick={function () { setShowFlattened(false); }}
                className={`px-4 py-2 rounded-8 text-sm font-semibold transition-all duration-200 ${!showFlattened
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Original
              </button>
              <button
                onClick={function () { setShowFlattened(true); }}
                className={`px-4 py-2 rounded-8 text-sm font-semibold transition-all duration-200 ${showFlattened
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Flattened (for Excel/CSV)
              </button>
            </div>
          ) : null}

          <div className="bg-gray-50 rounded-16 p-6 overflow-x-auto mb-8 border border-gray-200">
            <pre className="text-sm text-gray-700 font-mono">
              {showFlattened && hasNested
                ? JSON.stringify(flattenData(jsonData), null, 2).slice(0, 800)
                : JSON.stringify(jsonData, null, 2).slice(0, 800)
              }
              {JSON.stringify(showFlattened && hasNested ? flattenData(jsonData) : jsonData, null, 2).length > 800 ? '...' : ''}
            </pre>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-12 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Output Filename (optional)</label>
            <input
              type="text"
              placeholder="e.g., my-data (will add .json, .csv, or .xlsx automatically)"
              value={customFilename}
              onChange={function (e) { setCustomFilename(e.target.value); }}
              className="w-full px-4 py-2 rounded-8 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={function () { handleDownload('json'); }}
              className="glass-btn"
              disabled={isLoadingJson}
            >
              {isLoadingJson ? (
                <AiOutlineLoading3Quarters className="icon-md spin-icon" />
              ) : (
                <MdDownload className="icon-md" />
              )}
              {isLoadingJson ? 'Downloading...' : 'JSON'}
            </button>
            <button
              onClick={function () { handleDownload('csv'); }}
              className="glass-btn"
              disabled={isLoadingCsv}
            >
              {isLoadingCsv ? (
                <AiOutlineLoading3Quarters className="icon-md spin-icon" />
              ) : (
                <MdDownload className="icon-md" />
              )}
              {isLoadingCsv ? 'Downloading...' : 'CSV'}
            </button>
            <button
              onClick={function () { handleDownload('excel'); }}
              className="glass-btn"
              disabled={isLoadingExcel}
            >
              {isLoadingExcel ? (
                <AiOutlineLoading3Quarters className="icon-md spin-icon" />
              ) : (
                <MdDownload className="icon-md" />
              )}
              {isLoadingExcel ? 'Downloading...' : 'Excel'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Converter;
