import React from 'react';

import { useTranslation } from 'react-i18next';import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminSettings } from '@/contexts/AdminSettingsContext';

export default function TermsOfService() {
  const { t } = useTranslation();
  const { settings } = useAdminSettings();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="rounded-xl">
          <CardContent className="prose dark:prose-invert max-w-none p-6" dangerouslySetInnerHTML={{ __html: settings.policies.terms || '' }} />
        </Card>
      </div>
    </div>
  );
}


