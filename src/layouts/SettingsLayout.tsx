import React from 'react';
import ProfileMenu from '@/components/profile/ProfileMenu';

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function SettingsLayout({ children, title }: Props) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">
      {title && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="rounded-xl border p-3 sticky top-24">
            <ProfileMenu />
          </div>
        </aside>
        <section className="lg:col-span-3 min-h-[50vh]">
          {children}
        </section>
      </div>
    </div>
  );
}


