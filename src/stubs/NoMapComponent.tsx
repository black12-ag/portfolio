import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const NoMapComponent: React.FC = () => (
  <Card>
    <CardContent className="p-6 text-center text-sm text-muted-foreground">
      Maps are disabled on mobile. Open on web to view interactive maps.
    </CardContent>
  </Card>
);

export default NoMapComponent;


