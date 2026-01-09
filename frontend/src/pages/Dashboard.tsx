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
      const requestsData = await apiService.get<ServiceRequest[]>('/api/requests');
      setRequests(requestsData);
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
    const matchesStatus = !filter.status || req.status === filter.status;
    const matchesSearch =
      !filter.search ||
      req.request_code?.toLowerCase().includes(filter.search.toLowerCase()) ||
      req.contact_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      req.serial_number?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'Open': 'status-open',
      'Received': 'status-received',
      'In Progress': 'status-in-progress',
      'Repair Completed': 'status-repair-completed',
      'Shipped Back': 'status-shipped-back',
      'Resolved': 'status-resolved',
      'Closed': 'status-closed',
      'Submitted': 'status-open', // Map Submitted to Open styling
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
              {requests.filter((r) => r.status === 'Submitted').length}
            </div>
            <div className="stat-label">Submitted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {requests.filter((r) => r.status === 'In Progress').length}
            </div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {requests.filter((r) => r.status === 'Resolved').length}
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
                    <tr key={request.id}>
                      <td className="request-code">{request.request_code}</td>
                      <td>{request.contact_name}</td>
                      <td>{request.serial_number || '-'}</td>
                      <td className="issue-cell">{request.main_reason}</td>
                      <td>
                        <span className={getStatusBadgeClass(request.status)}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        {request.submitted_date && !isNaN(new Date(request.submitted_date).getTime())
                          ? new Date(request.submitted_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => handleViewRequest(request.id)}
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
