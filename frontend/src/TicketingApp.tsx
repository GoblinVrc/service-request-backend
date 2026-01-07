import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SubmitRequest from './components/SubmitRequest';
import TicketDetail from './components/TicketDetail';
import './TicketingApp.css';

type ViewType = 'dashboard' | 'my-requests' | 'analytics' | 'submit' | 'detail';

const TicketingApp: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
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
    setCurrentView('submit');
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
      </main>
    </div>
  );
};

export default TicketingApp;
