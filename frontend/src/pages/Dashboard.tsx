import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceRequest, User } from '../types';
import apiService from '../services/apiService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user from localStorage (demo mode)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userProfile = JSON.parse(userStr);
        setUser(userProfile);
      }

      // Load service requests from API
      const requestsData = await apiService.get<any[]>('/api/requests');

      // Transform snake_case to PascalCase to match ServiceRequest type
      const transformedRequests: ServiceRequest[] = requestsData.map((req: any) => ({
        Id: req.id,
        RequestCode: req.request_code || '',
        RequestType: req.request_type || 'General',
        CustomerNumber: req.customer_number,
        CustomerName: req.customer_name,
        ContactEmail: req.contact_email || '',
        ContactPhone: req.contact_phone || '',
        ContactName: req.contact_name || '',
        CountryCode: req.country_code || '',
        Territory: req.territory,
        SiteAddress: req.site_address,
        SerialNumber: req.serial_number,
        ItemNumber: req.item_number,
        LotNumber: req.lot_number,
        ItemDescription: req.item_description,
        ProductFamily: req.product_family,
        MainReason: req.main_reason || '',
        SubReason: req.sub_reason,
        IssueDescription: req.issue_description,
        RepairabilityStatus: req.repairability_status,
        RequestedServiceDate: req.requested_service_date,
        UrgencyLevel: req.urgency_level || 'Normal',
        LoanerRequired: req.loaner_required || false,
        LoanerDetails: req.loaner_details,
        QuoteRequired: req.quote_required || false,
        Status: req.status || 'Submitted',
        SubmittedByEmail: req.submitted_by_email || '',
        SubmittedByName: req.submitted_by_name || '',
        SubmittedDate: req.submitted_date || '',
        LastModifiedDate: req.last_modified_date || '',
        LanguageCode: req.language_code || 'en',
        CustomerNotes: req.customer_notes,
        InternalNotes: req.internal_notes
      }));

      setRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to load data:', error);
      setRequests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleNewRequest = () => {
    navigate('/request/new');
  };

  const handleViewRequest = (requestId: number) => {
    navigate(`/request/${requestId}`);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = !filter.status || req.Status === filter.status;
    const matchesSearch =
      !filter.search ||
      req.RequestCode.toLowerCase().includes(filter.search.toLowerCase()) ||
      req.ContactName?.toLowerCase().includes(filter.search.toLowerCase()) ||
      req.SerialNumber?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Submitted': 'status-submitted',
      'In Progress': 'status-in-progress',
      'Resolved': 'status-resolved',
      'Closed': 'status-closed',
      'Cancelled': 'status-cancelled',
    };
    return `status-badge ${statusMap[status] || ''}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Service Request Portal</h1>
            <p className="header-subtitle">ProCare Service Management</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-actions">
          <button className="btn-primary btn-large" onClick={handleNewRequest}>
            + New Service Request
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {requests.filter((r) => r.Status === 'Submitted').length}
            </div>
            <div className="stat-label">Submitted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {requests.filter((r) => r.Status === 'In Progress').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {requests.filter((r) => r.Status === 'Resolved').length}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Request Code, Name, or Serial Number..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          />
          <select
            className="filter-select"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Requests Table */}
        <div className="requests-section">
          <h2>Service Requests</h2>
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>No service requests found</p>
              <button className="btn-secondary" onClick={handleNewRequest}>
                Create your first request
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Request Code</th>
                    <th>Contact Name</th>
                    <th>Serial Number</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.Id}>
                      <td className="request-code">{request.RequestCode}</td>
                      <td>{request.ContactName}</td>
                      <td>{request.SerialNumber || '-'}</td>
                      <td className="issue-cell">{request.MainReason}</td>
                      <td>
                        <span className={getStatusBadgeClass(request.Status)}>
                          {request.Status}
                        </span>
                      </td>
                      <td>
                        {new Date(request.SubmittedDate).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => handleViewRequest(request.Id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
