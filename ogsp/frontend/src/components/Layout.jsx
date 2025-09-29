import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ 
  children, 
  user, 
  title, 
  subtitle, 
  showSidebar = true, 
  showHeader = true, 
  showFooter = true 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex min-vh-100 position-relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
      )}
      
      <div className="flex-grow-1 d-flex flex-column">
        {showHeader && (
          <Header 
            user={user} 
            title={title}
            subtitle={subtitle}
            onToggleSidebar={toggleSidebar}
            showSidebar={showSidebar}
          />
        )}

        <main className="flex-grow-1" style={{ background: "#f8f9fa" }}>
          {children}
        </main>

        {showFooter && <Footer user={user} />}
      </div>
    </div>
  );
};

export default Layout;