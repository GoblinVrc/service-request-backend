import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { ServiceRequest } from '../types';
import LoadingModal from './LoadingModal';
import './Dashboard.css';

interface Ticket {
  id: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
  assignee: string;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  category: string;
  location: string;
}

interface DashboardProps {
  onTicketClick: (ticketId: string) => void;
  filters: any;
}

const Dashboard: React.FC<DashboardProps> = ({ onTicketClick, filters }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load service requests from API
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const requests = await apiService.get<ServiceRequest[]>('/api/requests');

        // Convert ServiceRequest to Ticket format
        const convertedTickets: Ticket[] = requests.map(req => {
          // Map urgency levels to priority
          const priorityMap: Record<string, 'Low' | 'Normal' | 'High' | 'Critical'> = {
            'Normal': 'Normal',
            'Urgent': 'High',
            'Critical': 'Critical',
          };

          return {
            id: req.request_code,
            subject: req.item_description || req.main_reason || 'Service Request',
            status: req.status === 'Submitted' ? 'Open' : req.status as any,
            date: req.submitted_date && !isNaN(new Date(req.submitted_date).getTime())
              ? new Date(req.submitted_date).toISOString().split('T')[0]
              : 'N/A',
            assignee: req.territory_code || 'Unassigned',
            priority: priorityMap[req.urgency_level] || 'Normal',
            category: req.main_reason,
            location: req.site_address || req.country_code,
          };
        });

        setTickets(convertedTickets);
      } catch (error) {
        console.error('Failed to load requests:', error);
        // Keep empty array on error
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  // Apply filters
  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status !== 'All' && ticket.status !== filters.status)
      return false;
    if (filters.priority !== 'All' && ticket.priority !== filters.priority)
      return false;
    if (filters.dateFrom && ticket.date < filters.dateFrom) return false;
    if (filters.dateTo && ticket.date > filters.dateTo) return false;
    if (
      searchTerm &&
      !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { Critical: 4, High: 3, Normal: 2, Low: 1 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-in-progress';
      case 'Resolved':
        return 'status-resolved';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
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
        return '';
    }
  };

  const handleSort = (column: 'date' | 'priority' | 'status') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <LoadingModal isVisible={isLoading} message="Loading service requests..." />
      <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Service Requests</h1>
          <p className="header-subtitle">
            {filteredTickets.length} of {tickets.length} tickets
          </p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-open">🎫</div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value">
              {tickets.filter((t) => t.status === 'Open').length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-progress">⚙️</div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">
              {tickets.filter((t) => t.status === 'In Progress').length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-resolved">✓</div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">
              {tickets.filter((t) => t.status === 'Resolved').length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-critical">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Critical</div>
            <div className="stat-value">
              {tickets.filter((t) => t.priority === 'Critical').length}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="tickets-container">
        <table className="tickets-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>ID</th>
              <th style={{ width: '30%' }}>Subject</th>
              <th
                style={{ width: '12%', cursor: 'pointer' }}
                onClick={() => handleSort('status')}
              >
                Status{' '}
                {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{ width: '12%', cursor: 'pointer' }}
                onClick={() => handleSort('priority')}
              >
                Priority{' '}
                {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                style={{ width: '12%', cursor: 'pointer' }}
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ width: '12%' }}>Assignee</th>
              <th style={{ width: '12%' }}>Location</th>
            </tr>
          </thead>
          <tbody>
            {sortedTickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onTicketClick(ticket.id)}
                className="ticket-row"
              >
                <td>
                  <span className="ticket-id">{ticket.id}</span>
                </td>
                <td>
                  <div className="ticket-subject">
                    <span className="subject-text">{ticket.subject}</span>
                    <span className="ticket-category">{ticket.category}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`priority-badge ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="ticket-date">{ticket.date}</td>
                <td>
                  <div className="assignee">
                    <div className="assignee-avatar">
                      {ticket.assignee.charAt(0)}
                    </div>
                    <span className="assignee-name">{ticket.assignee}</span>
                  </div>
                </td>
                <td className="ticket-location">{ticket.location}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedTickets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No tickets found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Dashboard;
