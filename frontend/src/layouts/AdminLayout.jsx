import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminHeader from '../components/layout/AdminHeader';
import AdminSidebar from '../components/layout/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logoutAdmin } = useAuth();

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', sidebarOpen);
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 z-30 md:hidden"
          >
            <AdminSidebar mobile={true} onClose={handleCloseSidebar} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for desktop */}
      <div className="hidden md:block md:w-64">
        <AdminSidebar mobile={false} />
      </div>

      <div className="flex flex-col flex-1">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          user={admin}
          logoutAdmin={logoutAdmin} // Use logoutAdmin directly
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-grow bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="bg-gray-800 text-white py-4 text-center">
          <p>© 2025 EventEase All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;