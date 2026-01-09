import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { ServiceRequest } from '../types';
import LoadingModal from './LoadingModal';
import StatusUpdateModal from './StatusUpdateModal';
import './TicketDetail.css';

interface TicketDetailProps {
  ticketId: string;
  onClose: () => void;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'comments'>('details');
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const loadRequestDetails = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const requests = await apiService.get<ServiceRequest[]>('/api/requests');
      const foundRequest = requests.find(r => r.request_code === ticketId);
      setRequest(foundRequest || null);
    } catch (error) {
      console.error('Failed to load request details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadRequestDetails();
  }, [loadRequestDetails]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!request) return;

    try {
      setIsLoading(true);
      await apiService.patch(`/api/requests/${request.id}/status`, { status: newStatus });
      // Reload to show updated status
      await loadRequestDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check user role from localStorage
  const getUserRole = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role || 'Customer';
      } catch {
        return 'Customer';
      }
    }
    return 'Customer';
  };

  const userRole = getUserRole();
  const canUpdateStatus = userRole === 'SalesTech' || userRole === 'Admin';

  // Helper functions for dynamic CSS classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'Received':
        return 'status-received';
      case 'In Progress':
        return 'status-in-progress';
      case 'Repair Completed':
        return 'status-repair-completed';
      case 'Shipped Back':
        return 'status-shipped-back';
      case 'Resolved':
        return 'status-resolved';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'priority-critical';
      case 'High':
        return 'priority-high';
      case 'Normal':
        return 'priority-normal';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  };

  if (isLoading) {
    return <LoadingModal isVisible={true} message="Loading request details..." />;
  }

  if (!request) {
    return (
      <div className="ticket-detail">
        <div className="detail-main">
          <div className="detail-header">
            <h1>Request not found</h1>
            <button onClick={onClose} className="btn-close-detail">✕</button>
          </div>
        </div>
      </div>
    );
  }

  // Map data for display
  const ticket = {
    id: request.request_code,
    subject: request.item_description || request.main_reason || 'Service Request',
    status: request.status === 'Submitted' ? 'Open' : request.status,
    priority: request.urgency_level === 'Urgent' ? 'High' : request.urgency_level,
    category: request.main_reason,
    subcategory: request.sub_reason,
    date: request.submitted_date ? new Date(request.submitted_date).toISOString().split('T')[0] : 'N/A',
    assignee: request.territory_code || 'Unassigned',
    contactName: request.contact_name,
    contactPhone: request.contact_phone,
    additionalComments: request.issue_description || 'No additional comments provided',
    loanerRequired: request.loaner_required,
    quoteRequired: request.quote_required,
    history: [
      { date: request.submitted_date || '', action: 'Request submitted', user: request.submitted_by_name },
    ],
    attachments: [] as Array<{ name: string; size: string; type: string }>,
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
                {ticket.contactName}
              </span>
              <span className="meta-item">
                <span className="meta-icon">📞</span>
                {ticket.contactPhone}
              </span>
              <span className="meta-item">
                <div className="assignee-chip-header">
                  <div className="assignee-avatar-small">{ticket.assignee.charAt(0)}</div>
                  {ticket.assignee}
                </div>
              </span>
            </div>
          </div>
          <div className="header-right-section">
            <div className="header-requirements">
              <div className="header-requirement-item">
                <div className="requirement-label">Quote Required</div>
                {ticket.quoteRequired ? (
                  <span className="requirement-badge requirement-yes">💰 Yes</span>
                ) : (
                  <span className="requirement-badge requirement-no">No</span>
                )}
              </div>
              <div className="header-requirement-item">
                <div className="requirement-label">Loaner Required</div>
                {ticket.loanerRequired ? (
                  <span className="requirement-badge requirement-yes">📦 Yes</span>
                ) : (
                  <span className="requirement-badge requirement-no">No</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="btn-close-detail">✕</button>
          </div>
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
              {/* Category - Full Width */}
              <div className="category-section">
                <div className="info-label">Category</div>
                <div className="info-value-large">{ticket.category}</div>
                {ticket.subcategory && (
                  <div className="subcategory-text">{ticket.subcategory}</div>
                )}
              </div>

              {/* Status & Priority - 50/50 */}
              <div className="status-priority-row">
                <div className="info-item-half">
                  <div className="info-label">Status</div>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="info-item-half">
                  <div className="info-label">Priority</div>
                  <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div className="description-section">
                <h3>Additional Comments</h3>
                <p>{ticket.additionalComments}</p>
              </div>

              <div className="action-buttons">
                {canUpdateStatus && (
                  <>
                    <button
                      className="btn-action btn-primary"
                      onClick={() => setShowStatusModal(true)}
                    >
                      Update Status
                    </button>
                    <button className="btn-action btn-secondary">Assign</button>
                  </>
                )}
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

      {/* Status Update Modal */}
      <StatusUpdateModal
        isVisible={showStatusModal}
        currentStatus={ticket.status}
        onClose={() => setShowStatusModal(false)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default TicketDetail;
