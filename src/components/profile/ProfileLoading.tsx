import React, { useCallback, Suspense, lazy, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileLoadingProps {
  type?: 'card' | 'list' | 'form' | 'page';
  count?: number;
}

export default function ProfileLoading({ type = 'card', count = 1 }: ProfileLoadingProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="rounded-xl">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        );
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        );
      
      case 'form':
        return (
          <Card className="rounded-xl">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        );
      
      case 'page':
        return (
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileLoading type="card" />
                <ProfileLoading type="form" />
              </div>
              <div className="space-y-6">
                <ProfileLoading type="card" />
                <ProfileLoading type="list" count={3} />
              </div>
            </div>
          </div>
        );
      
      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return (
    <div className="animate-pulse">
      {Array.from({ length: type === 'page' ? 1 : count }).map((_, i) => (
        <div key={i} className={i > 0 ? 'mt-6' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
