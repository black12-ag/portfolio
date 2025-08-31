
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, List, Search, Package, AlertTriangle, Calendar, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HousekeepingMenu() {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/housekeeping' },
    { label: 'Room Assignments', icon: List, path: '/housekeeping/assignments' },
    { label: 'Lost & Found', icon: Search, path: '/housekeeping/lost-found' },
    { label: 'Supply Requests', icon: Package, path: '/housekeeping/supplies' },
    { label: 'Maintenance Reports', icon: AlertTriangle, path: '/housekeeping/maintenance' },
    { label: 'Schedule', icon: Calendar, path: '/housekeeping/schedule' },
    { label: 'Team Chat', icon: Users, path: '/housekeeping/chat' },
    { label: 'Logout', icon: LogOut, path: '/logout' },
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Housekeeping Menu</h2>
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

