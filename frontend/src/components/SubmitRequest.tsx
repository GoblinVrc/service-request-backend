import React, { useState } from 'react';
import './SubmitRequest.css';

interface SubmitRequestProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const SubmitRequest: React.FC<SubmitRequestProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Normal',
    location: '',
    description: '',
    files: [] as File[],
  });

  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', formData);
    onSubmit();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFormData({ ...formData, files: Array.from(e.dataTransfer.files) });
    }
  };

  return (
    <div className="submit-request">
      <div className="submit-header">
        <div>
          <h1>New Service Request</h1>
          <p>Fill in the details below to create a new service request</p>
        </div>
        <button onClick={onCancel} className="btn-close">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        <div className="form-row">
          <div className="form-field">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              <option value="Equipment">Equipment Malfunction</option>
              <option value="Maintenance">Routine Maintenance</option>
              <option value="Installation">Installation</option>
              <option value="Calibration">Calibration</option>
              <option value="Software">Software Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>Priority *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Operating Room 3, Lab A"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information about the issue..."
              rows={6}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Attachments</label>
            <div
              className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="drop-icon">📎</div>
              <p>Drag & drop files here or click to browse</p>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>
            {formData.files.length > 0 && (
              <div className="file-list">
                {formData.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = formData.files.filter((_, i) => i !== index);
                        setFormData({ ...formData, files: newFiles });
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitRequest;
