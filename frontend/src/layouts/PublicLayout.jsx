import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';

const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader isScrolled={isScrolled} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>© 2025 EventEase All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;