import { useState, useRef, useEffect } from 'react';
import {
  HiDownload, HiChevronDown, HiDocumentText,
  HiTable, HiDocumentReport, HiUpload, HiX,
  HiCheckCircle, HiCheck
} from 'react-icons/hi';
import { FaFileExcel, FaFileCsv, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { exportToExcel, exportToCSV, exportToPDF, exportToWord } from '../../utils/exportUtils';

const ExportDropdown = ({
  title = 'Data Export',
  headers = [],
  data = [],
  filename = 'export_data',
  onImport = null,
  showImport = true,
}) => {
  const [open, setOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState({ type: '', text: '' });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format) => {
    setOpen(false);
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const safeFilename = `${filename}_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'excel':
        exportToExcel(title, headers, data, safeFilename);
        break;
      case 'csv':
        exportToCSV(headers, data, safeFilename);
        break;
      case 'pdf':
        exportToPDF(title, headers, data);
        break;
      case 'word':
        exportToWord(title, headers, data, safeFilename);
        break;
      default:
        exportToCSV(headers, data, safeFilename);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setImportText(text);
      setImportMsg({ type: 'info', text: `File "${file.name}" loaded (${text.split('\n').length} lines). Click Process Import below.` });
    };
    reader.readAsText(file);
  };

  const processImport = () => {
    if (!importText.trim()) {
      setImportMsg({ type: 'error', text: 'Please paste CSV/JSON data or choose a file first.' });
      return;
    }

    try {
      let parsed = [];
      if (importText.trim().startsWith('[') || importText.trim().startsWith('{')) {
        const json = JSON.parse(importText);
        parsed = Array.isArray(json) ? json : [json];
      } else {
        // Parse CSV
        const lines = importText.trim().split(/\r?\n/);
        if (lines.length < 2) {
          setImportMsg({ type: 'error', text: 'CSV must contain at least a header and 1 data row.' });
          return;
        }
        const colHeaders = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
        parsed = lines.slice(1).map(line => {
          const cells = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
          const obj = {};
          colHeaders.forEach((h, idx) => {
            obj[h] = cells[idx] || '';
          });
          return obj;
        });
      }

      if (onImport) {
        onImport(parsed);
      }
      setImportMsg({ type: 'success', text: `Successfully imported ${parsed.length} records!` });
      setTimeout(() => {
        setShowImportModal(false);
        setImportText('');
        setImportMsg({ type: '', text: '' });
      }, 1200);
    } catch (err) {
      setImportMsg({ type: 'error', text: 'Invalid data format. Please check CSV/JSON structure.' });
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {/* Export Dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setOpen(!open)}
          className="btn btn-primary"
          style={{
            borderRadius: 12,
            fontWeight: 800,
            padding: '10px 18px',
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px var(--primary-glow)',
          }}
        >
          <HiDownload /> Export Data <HiChevronDown style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
        </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 240,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 16,
              padding: '8px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Select File Format
            </div>

            {/* Option 1: PDF */}
            <button
              onClick={() => handleExport('pdf')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239, 68, 68, 0.14)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaFilePdf />
              </div>
              <div>
                <strong style={{ display: 'block' }}>PDF Document</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.pdf / Printable report</span>
              </div>
            </button>

            {/* Option 2: Word */}
            <button
              onClick={() => handleExport('word')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99, 102, 241, 0.14)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaFileWord />
              </div>
              <div>
                <strong style={{ display: 'block' }}>Word Document</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.doc format</span>
              </div>
            </button>

            {/* Option 3: CSV */}
            <button
              onClick={() => handleExport('csv')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(56, 189, 248, 0.14)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaFileCsv />
              </div>
              <div>
                <strong style={{ display: 'block' }}>CSV Spreadsheet</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>.csv delimited file</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Import Details Button */}
      {showImport && (
        <button
          onClick={() => setShowImportModal(true)}
          className="btn btn-secondary"
          style={{
            borderRadius: 12,
            fontWeight: 700,
            padding: '10px 16px',
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <HiUpload /> Import Details
        </button>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowImportModal(false)}>
          <div className="theme-selector-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header-row">
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Import Details ({title})</h3>
              <button className="modal-close-icon-btn" onClick={() => setShowImportModal(false)}><HiX /></button>
            </div>

            {importMsg.text && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: importMsg.type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)', color: importMsg.type === 'error' ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '0.84rem' }}>
                {importMsg.text}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Upload CSV / Excel / JSON File
              </label>
              <input
                type="file"
                accept=".csv, .txt, .json, .xlsx, .xls"
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 12,
                  background: 'var(--bg-app)',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  marginBottom: 14,
                  cursor: 'pointer',
                }}
              />

              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                Or Paste Raw CSV / JSON Data Directly:
              </label>
              <textarea
                rows={5}
                placeholder="Paste CSV rows (e.g. name,rollNumber,department,marks) or JSON array..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="form-control"
                style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={processImport}>
                  <HiCheckCircle /> Process & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
