import React, { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onNewRequest: () => void;
  filters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    priority: string;
  };
  onFilterChange: (filters: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewRequest,
  filters,
  onFilterChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['All', 'Low', 'Normal', 'High', 'Critical'];

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>

      {/* Branding Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          {!isCollapsed && (
            <div className="logo-content">
              <div className="logo-title">STRYKER</div>
              <div className="logo-description">Service Portal</div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action */}
      <div className="sidebar-section">
        <button
          className="btn-new-request"
          onClick={onNewRequest}
          title="Create New Request"
        >
          <span className="btn-icon">+</span>
          {!isCollapsed && <span className="btn-text">New Request</span>}
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        {!isCollapsed && <div className="section-title">Navigation</div>}
        <button
          className={`sidebar-nav-item ${
            currentView === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => onNavigate('dashboard')}
          title="Dashboard"
        >
          <span className="nav-icon">🏠</span>
          {!isCollapsed && <span className="nav-text">Dashboard</span>}
          {!isCollapsed && currentView === 'dashboard' && (
            <span className="active-indicator" />
          )}
        </button>

        <button
          className={`sidebar-nav-item ${
            currentView === 'my-requests' ? 'active' : ''
          }`}
          onClick={() => onNavigate('my-requests')}
          title="My Requests"
        >
          <span className="nav-icon">📋</span>
          {!isCollapsed && <span className="nav-text">My Requests</span>}
          {!isCollapsed && currentView === 'my-requests' && (
            <span className="active-indicator" />
          )}
        </button>

        <button
          className={`sidebar-nav-item ${
            currentView === 'analytics' ? 'active' : ''
          }`}
          onClick={() => onNavigate('analytics')}
          title="Analytics"
        >
          <span className="nav-icon">📊</span>
          {!isCollapsed && <span className="nav-text">Analytics</span>}
          {!isCollapsed && currentView === 'analytics' && (
            <span className="active-indicator" />
          )}
        </button>
      </div>

      {/* Filters */}
      {!isCollapsed && (
        <div className="sidebar-section filters-section">
          <div className="section-title">Filters</div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <select
              className="filter-select"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Date From</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Date To</label>
            <input
              type="date"
              className="filter-input"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          <button
            className="btn-clear-filters"
            onClick={() =>
              onFilterChange({
                status: 'All',
                dateFrom: '',
                dateTo: '',
                priority: 'All',
              })
            }
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* User Section */}
      <div className="sidebar-footer">
        {!isCollapsed && <div className="section-divider" />}
        <button
          className="sidebar-user"
          title="Logout"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <div className="user-avatar">D</div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">Demo User</div>
              <div className="user-role">Administrator (Click to logout)</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
