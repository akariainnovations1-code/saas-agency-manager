import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, FileText, Trash2, Folder, 
  Download, Eye, X, UploadCloud, AlertCircle 
} from 'lucide-react';

const Documents = () => {
  const { user } = useAuth();
  const { documents, addDocument, removeDocument, projects } = useData();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Dialog Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [fileSize, setFileSize] = useState('420 KB');

  const resetForm = () => {
    setName('');
    setCategory('General');
    setFileSize('420 KB');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name) return;

    // Simulate clean sizes based on mock input
    const randomSize = `${Math.floor(Math.random() * 8) + 1}.${Math.floor(Math.random() * 9)} MB`;
    
    try {
      await addDocument({
        name,
        category,
        fileSize: randomSize,
        fileUrl: `#mock-download-${name.replace(/\s+/g, '-').toLowerCase()}`
      });
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      alert(`💥 Security Restriction: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this document metadata catalog entry?')) {
      await removeDocument(id);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      
      {/* Search and upload triggers bar */}
      <div className="filters-bar">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select 
            className="form-select" 
            style={{ width: '160px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="General">General Files</option>
            <option value="Client">Client Contracts</option>
            <option value="Project">Project Assets</option>
          </select>

          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Grid of Files */}
      <div className="documents-grid">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-icon-box">
                <FileText size={24} />
              </div>
              <div className="document-name-tag" title={doc.name}>
                {doc.name.length > 20 ? `${doc.name.substring(0, 17)}...` : doc.name}
              </div>
              <div className="document-size-tag">
                <span className="badge" style={{ fontSize: '8px', padding: '1px 5px', display: 'block', marginBottom: '4px', backgroundColor: 'var(--border)' }}>
                  {doc.category}
                </span>
                <span>{doc.fileSize}</span>
              </div>
              
              {/* Interaction triggers */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flexGrow: 1, padding: '4px 6px', fontSize: '11px' }}
                  onClick={() => setSelectedPreviewDoc(doc)}
                >
                  <Eye size={11} />
                  <span>Preview</span>
                </button>
                <a 
                  href={doc.fileUrl} 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '28px', height: '28px', display: 'inline-flex', textDecoration: 'none' }}
                  title="Download File"
                  onClick={() => alert(`Simulating file download request: ${doc.name}`)}
                >
                  <Download size={11} />
                </a>
              </div>

              {/* Delete trigger */}
              {user?.role !== 'Employee' && (
                <button 
                  className="document-delete-trigger" 
                  title="Remove Document"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 size={12} />
                </button>
              )}

            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No document assets cataloged.
          </div>
        )}
      </div>

      {/* 1. MOCK FILE UPLOAD OVERLAY */}
      {showAddModal && (
        <div className="dialog-backdrop">
          <div className="dialog-modal">
            
            <div className="dialog-header">
              <h3>Upload Document Metadata</h3>
              <button className="dialog-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="form-group" style={{ textAlign: 'center', padding: '16px', border: '2px dashed var(--border)', borderRadius: '10px', backgroundColor: 'var(--surface-hover)', marginBottom: '16px' }}>
                <UploadCloud size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <span style={{ fontSize: '12.5px', display: 'block', color: 'var(--text-muted)' }}>
                  Drag local asset sheets here, or construct a metadata wrapper entry:
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input type="text" className="form-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Stark_Contract_Master_v2.pdf" />
              </div>

              <div className="form-group">
                <label className="form-label">Classification Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="General">General Operations</option>
                  <option value="Client">Client Contracts File</option>
                  <option value="Project">Project Assets Catalog</option>
                </select>
              </div>

              <div className="dialog-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Catalog Document</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 2. LIVE DOCUMENT PREVIEW DIALOG OVERLAY */}
      {selectedPreviewDoc && (
        <div className="dialog-backdrop">
          <div className="dialog-modal" style={{ maxWidth: '580px', width: '90%' }}>
            
            <div className="dialog-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px' }}>File Preview Simulator</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Category: <b>{selectedPreviewDoc.category}</b> • Size: <b>{selectedPreviewDoc.fileSize}</b>
                </p>
              </div>
              <button className="dialog-close" onClick={() => setSelectedPreviewDoc(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Simulated file layout */}
            <div style={{ margin: '24px 0', padding: '32px 16px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', borderRadius: '10px', textAlign: 'center' }}>
              <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '700', wordBreak: 'break-all' }}>{selectedPreviewDoc.name}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Securely encrypted metadata catalog. Content indexing successful.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--status-active)', fontWeight: '600', fontSize: '12px', marginTop: '16px' }}>
                <AlertCircle size={14} />
                <span>Sandbox Integrity Check Passed</span>
              </div>
            </div>

            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPreviewDoc(null)}>Close Preview</button>
              <a 
                href={selectedPreviewDoc.fileUrl} 
                className="btn btn-primary" 
                style={{ textDecoration: 'none' }}
                onClick={() => {
                  setSelectedPreviewDoc(null);
                  alert(`Simulating document download: ${selectedPreviewDoc.name}`);
                }}
              >
                <Download size={14} />
                <span>Download Asset</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Documents;
