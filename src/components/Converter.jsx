import { useState } from 'react';
import { downloadJSON, downloadCSV, downloadExcel, parseJSON, flattenData } from '../utils/fileConverter';
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
        setError('');
      } catch (err) {
        setError(err.message);
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  }

  function handleDownload(format) {
    if (jsonData === null) {
      return;
    }

    if (format === 'json') {
      setIsLoadingJson(true);
      setTimeout(function () {
        const filename = 'converted.json';
        downloadJSON(jsonData, filename);
        setIsLoadingJson(false);
      }, 600);
    } else if (format === 'csv') {
      setIsLoadingCsv(true);
      setTimeout(function () {
        const filename = 'converted.csv';
        downloadCSV(jsonData, filename);
        setIsLoadingCsv(false);
      }, 600);
    } else if (format === 'excel') {
      setIsLoadingExcel(true);
      setTimeout(function () {
        const filename = 'converted.xlsx';
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

          <div className="mb-4 flex gap-2">
            <button
              onClick={function () { setShowFlattened(false); }}
              className={`px-4 py-2 rounded-8 text-sm font-semibold transition-all ${!showFlattened ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Original
            </button>
            <button
              onClick={function () { setShowFlattened(true); }}
              className={`px-4 py-2 rounded-8 text-sm font-semibold transition-all ${showFlattened ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Flattened (for Excel/CSV)
            </button>
          </div>

          <div className="bg-gray-50 rounded-16 p-6 overflow-x-auto mb-8 border border-gray-200">
            <pre className="text-sm text-gray-700 font-mono">
              {showFlattened
                ? JSON.stringify(flattenData(jsonData), null, 2).slice(0, 800)
                : JSON.stringify(jsonData, null, 2).slice(0, 800)
              }
              {JSON.stringify(showFlattened ? flattenData(jsonData) : jsonData, null, 2).length > 800}
              {JSON.stringify(jsonData, null, 2).length > 500 ? '...' : ''}
            </pre>
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
