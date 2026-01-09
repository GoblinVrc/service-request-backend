import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SubmitRequest from './components/SubmitRequest';
import TicketDetail from './components/TicketDetail';
import RequestTypeModal from './components/RequestTypeModal';
import ComingSoon from './pages/ComingSoon';
import './TicketingApp.css';

type ViewType = 'dashboard' | 'my-requests' | 'analytics' | 'submit' | 'detail' | 'coming-soon';

const TicketingApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    return !!user;
  });
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(false);
  const [comingSoonType, setComingSoonType] = useState<'maintenance' | 'installation' | null>(null);
  const [filters, setFilters] = useState({
    status: 'All',
    dateFrom: '',
    dateTo: '',
    priority: 'All',
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    setSelectedTicketId(null);
  };

  const handleNewRequest = () => {
    setShowRequestTypeModal(true);
  };

  const handleRequestTypeSelect = (type: 'repair' | 'maintenance' | 'installation') => {
    setShowRequestTypeModal(false);
    if (type === 'repair') {
      setCurrentView('submit');
    } else {
      setComingSoonType(type);
      setCurrentView('coming-soon');
    }
  };

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView('detail');
  };

  const handleSubmitRequest = () => {
    setCurrentView('dashboard');
  };

  const handleCancelSubmit = () => {
    setCurrentView('dashboard');
  };

  const handleCloseDetail = () => {
    setCurrentView('dashboard');
    setSelectedTicketId(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="ticketing-app">
      <Sidebar
        currentView={currentView === 'detail' ? 'dashboard' : currentView}
        onNavigate={handleNavigate}
        onNewRequest={handleNewRequest}
        filters={filters}
        onFilterChange={setFilters}
      />

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard onTicketClick={handleTicketClick} filters={filters} />
        )}

        {currentView === 'my-requests' && (
          <Dashboard onTicketClick={handleTicketClick} filters={filters} />
        )}

        {currentView === 'analytics' && (
          <div className="coming-soon">
            <div className="coming-soon-content">
              <div className="coming-soon-icon">📊</div>
              <h2>Analytics Dashboard</h2>
              <p>Comprehensive analytics and reporting features coming soon!</p>
            </div>
          </div>
        )}

        {currentView === 'submit' && (
          <SubmitRequest onSubmit={handleSubmitRequest} onCancel={handleCancelSubmit} />
        )}

        {currentView === 'detail' && selectedTicketId && (
          <TicketDetail ticketId={selectedTicketId} onClose={handleCloseDetail} />
        )}

        {currentView === 'coming-soon' && comingSoonType && (
          <ComingSoon />
        )}
      </main>

      <RequestTypeModal
        isVisible={showRequestTypeModal}
        onSelectType={handleRequestTypeSelect}
      />
    </div>
  );
};

export default TicketingApp;
