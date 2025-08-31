import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const links = [
  { to: '/support/help-center', label: 'Help Center' },
  { to: '/support/safety', label: 'Safety Information' },
  { to: '/support/cancellation', label: 'Cancellation Options' },
  { to: '/support/accessibility', label: 'Disability Support' },
  { to: '/support/report-issue', label: 'Report Issue' },
  { to: '/support/contact', label: 'Contact Us' },
];

export default function SupportNav() {
  const { pathname } = useLocation();
  return (
    <nav className="space-y-2">
      <h2 className="text-xl font-semibold">Support</h2>
      <ul className="space-y-1">
        {links.map(l => (
          <li key={l.to}>
            <Link to={l.to} className={cn('block px-2 py-1 rounded hover:bg-accent', pathname === l.to && 'bg-accent')}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}


