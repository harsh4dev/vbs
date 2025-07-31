import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProtectedHeader = () => {
  const { logoutUser } = useAuth();
  return (
    <header className="bg-teal-600 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <nav>
          <Link to="/profile" className="px-4 hover:underline">Profile</Link>
          <Link to="/login" onClick={logoutUser} className="px-4 hover:underline">
            Logout
          </Link>
        </nav>
      </div>
    </header>
  );
};

const ProtectedLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <ProtectedHeader />
      <main className="flex-grow">
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
  );
};

export default ProtectedLayout;