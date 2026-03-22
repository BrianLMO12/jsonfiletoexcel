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
      }, 300);
    } else if (format === 'csv') {
      setIsLoadingCsv(true);
      setTimeout(function () {
        downloadCSV(jsonData, filename);
        setIsLoadingCsv(false);
      }, 300);
    } else if (format === 'excel') {
      setIsLoadingExcel(true);
      // Excel generation takes longer, so we don't add artificial delay
      downloadExcel(jsonData, filename);
      setIsLoadingExcel(false);
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
          <br />
          <h3 className="text-xl font-bold mb-6 text-black">Preview</h3>

          {hasNested ? (
            <div className="mb-8 flex gap-3 pb-6 border-b-2 border-gray-300">
              <button
                onClick={function () { setShowFlattened(false); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-12 text-sm font-bold transition-all duration-300 transform ${!showFlattened
                  ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300 hover:shadow-xl hover:shadow-blue-400 hover:scale-105 active:scale-95'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 4.414V16a1 1 0 102 0V4.414l6.293 6.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Original
              </button>
              <button
                onClick={function () { setShowFlattened(true); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-12 text-sm font-bold transition-all duration-300 transform ${showFlattened
                  ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-lg shadow-purple-300 hover:shadow-xl hover:shadow-purple-400 hover:scale-105 active:scale-95'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 9a2 2 0 104 0V5a2 2 0 10-4 0v4zm6-4a2 2 0 104 0V5a2 2 0 10-4 0v4zm4 10a2 2 0 100-4h-4a2 2 0 10-4 0h4zm-8 0a2 2 0 104 0h-4a2 2 0 10-4 0h4z"></path>
                </svg>
                Flattened
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

          <div className="mb-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-16 border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <svg width="12" height="12" className="text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
              </svg>
              <label className="block text-base font-bold text-gray-800">Output Filename</label>
            </div>
            <input
              type="text"
              placeholder="e.g., my-data (will add .json, .csv, or .xlsx automatically)"
              value={customFilename}
              onChange={function (e) { setCustomFilename(e.target.value); }}
              className="w-full px-5 py-3 rounded-12 border-2 border-blue-300 bg-white text-black placeholder-gray-500 font-medium focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:border-blue-400"
            />
          </div>

          <div className="flex gap-5 flex-wrap">
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
