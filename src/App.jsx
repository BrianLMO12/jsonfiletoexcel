import { useState } from 'react';
import Converter from './components/Converter';
import Demo from './components/Demo';

function App() {
  const [activeTab, setActiveTab] = useState('demo');

  function handleDemoClick() {
    setActiveTab('demo');
  }

  function handleConverterClick() {
    setActiveTab('converter');
  }

  function renderMainContent() {
    if (activeTab === 'demo') {
      return <Demo />;
    } else if (activeTab === 'converter') {
      return <Converter />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <header className="header-glass sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-black">JSON Converter</h1>
          <p className="text-gray-600 mt-2">Convert your data between JSON, CSV, and Excel formats</p>
        </div>
      </header>

      <nav className="bg-gradient-to-b from-white to-transparent">
        <div className="max-w-6xl mx-auto px-4 flex gap-4 border-b border-gray-200">
          <button
            onClick={handleDemoClick}
            className={`tab-button ${activeTab === 'demo' ? 'active' : ''}`}
          >
            Demo Scenarios
          </button>
          <button
            onClick={handleConverterClick}
            className={`tab-button ${activeTab === 'converter' ? 'active' : ''}`}
          >
            JSON Converter
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {renderMainContent()}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>JSON to Excel/CSV Converter - All operations run locally in your browser</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
