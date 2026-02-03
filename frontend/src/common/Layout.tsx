import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import { NotificationContainer } from '../common/Notifications';
import { useAppSelector } from '../hooks';

const Layout: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <Header />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <NotificationContainer />
    </div>
  );
};

export default Layout;
