import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  Utensils, 
  Users, 
  Settings,
  X
} from 'lucide-react';

const AdminSidebar = ({ mobile = false, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/aonecafe/admin/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', path: '/aonecafe/admin/bookings', icon: Calendar },
    { name: 'Venues', path: '/aonecafe/admin/venues', icon: MapPin },
    { name: 'Event Types', path: '/aonecafe/admin/events', icon: Tag },
    { name: 'Shifts', path: '/aonecafe/admin/shifts', icon: Clock },
    { name: 'Packages', path: '/aonecafe/admin/packages', icon: Tag },
    { name: 'Menus', path: '/aonecafe/admin/menus', icon: Utensils },
    { name: 'Users', path: '/aonecafe/admin/users', icon: Users },
    { name: 'Profile', path: '/aonecafe/admin/profile', icon: Settings },
  ];
  
  return (
    <div className="h-full bg-gray-900 text-white flex flex-col shadow-lg">
      {mobile && (
        <div className="px-4 py-5 flex items-center justify-between border-b border-gray-800">
          <span className="text-xl font-bold">Admin Panel</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className={`flex items-center justify-center p-6 ${mobile ? '' : 'border-b border-gray-800'}`}>
        <div className="flex items-center space-x-2 h-8">
          {/* <Calendar className="h-8 w-8 text-primary-400" /> */}
          {/* <span className="text-xl font-heading font-bold">EventEase</span> */}
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
              `}
              onClick={mobile ? onClose : undefined}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
       
      </div>
    </div>
  );
};

export default AdminSidebar;