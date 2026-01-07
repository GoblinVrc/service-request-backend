import React, { useState } from 'react';
import './TicketDetail.css';

interface TicketDetailProps {
  ticketId: string;
  onClose: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'comments'>('details');

  // Mock ticket data
  const ticket = {
    id: ticketId,
    subject: 'Equipment malfunction in OR-3',
    status: 'Open',
    priority: 'Critical',
    category: 'Equipment',
    location: 'Operating Room 3',
    date: '2026-01-07',
    assignee: 'John Smith',
    description: 'The surgical equipment in Operating Room 3 is experiencing intermittent power issues. This is affecting scheduled procedures and requires immediate attention.',
    reporter: 'Dr. Sarah Williams',
    history: [
      { date: '2026-01-07 10:30', action: 'Ticket created', user: 'Dr. Sarah Williams' },
      { date: '2026-01-07 10:45', action: 'Assigned to John Smith', user: 'System' },
      { date: '2026-01-07 11:00', action: 'Priority set to Critical', user: 'Manager' },
    ],
    attachments: [
      { name: 'equipment_photo.jpg', size: '2.4 MB', type: 'image' },
      { name: 'error_log.pdf', size: '156 KB', type: 'pdf' },
      { name: 'maintenance_history.xlsx', size: '45 KB', type: 'excel' },
    ],
  };

  return (
    <div className="ticket-detail">
      <div className="detail-main">
        <div className="detail-header">
          <div>
            <div className="ticket-id-large">{ticket.id}</div>
            <h1 className="ticket-title">{ticket.subject}</h1>
            <div className="ticket-meta">
              <span className="meta-item">
                <span className="meta-icon">📅</span>
                {ticket.date}
              </span>
              <span className="meta-item">
                <span className="meta-icon">👤</span>
                {ticket.reporter}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📍</span>
                {ticket.location}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-detail">✕</button>
        </div>

        <div className="detail-tabs">
          <button
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            Comments
          </button>
        </div>

        <div className="detail-content">
          {activeTab === 'details' && (
            <div className="tab-panel">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Status</div>
                  <span className="status-badge status-open">{ticket.status}</span>
                </div>
                <div className="info-item">
                  <div className="info-label">Priority</div>
                  <span className="priority-badge priority-critical">{ticket.priority}</span>
                </div>
                <div className="info-item">
                  <div className="info-label">Category</div>
                  <div className="info-value">{ticket.category}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Assignee</div>
                  <div className="assignee-chip">
                    <div className="assignee-avatar-small">J</div>
                    {ticket.assignee}
                  </div>
                </div>
              </div>

              <div className="description-section">
                <h3>Description</h3>
                <p>{ticket.description}</p>
              </div>

              <div className="action-buttons">
                <button className="btn-action btn-primary">Update Status</button>
                <button className="btn-action btn-secondary">Assign</button>
                <button className="btn-action btn-secondary">Add Comment</button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-panel">
              <div className="timeline">
                {ticket.history.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-action">{item.action}</div>
                      <div className="timeline-meta">
                        {item.date} • by {item.user}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="tab-panel">
              <div className="comment-form">
                <textarea placeholder="Add a comment..." rows={4} />
                <button className="btn-comment">Post Comment</button>
              </div>
              <div className="empty-state-small">
                <p>No comments yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="detail-sidebar">
        <h3>Attachments</h3>
        <div className="attachments-list">
          {ticket.attachments.map((file, index) => (
            <div key={index} className="attachment-item">
              <div className="attachment-icon">
                {file.type === 'image' && '🖼️'}
                {file.type === 'pdf' && '📄'}
                {file.type === 'excel' && '📊'}
              </div>
              <div className="attachment-info">
                <div className="attachment-name">{file.name}</div>
                <div className="attachment-size">{file.size}</div>
              </div>
              <button className="btn-download">↓</button>
            </div>
          ))}
        </div>
        <button className="btn-upload-attachment">+ Add Attachment</button>
      </div>
    </div>
  );
};

export default TicketDetail;
