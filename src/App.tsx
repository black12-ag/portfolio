import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AdminSettingsProvider } from "@/contexts/AdminSettingsContext";
import { ErrorBoundary } from "react-error-boundary";
import "./i18n";

// Lazy load pages
const Portfolio = React.lazy(() => import('./pages/Portfolio'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4 max-w-md text-center">
      <div className="text-red-500 text-6xl">⚠️</div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  </div>
);

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="portfolio-ui-theme">
      <AuthProvider>
        <AdminSettingsProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Portfolio />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/projects" element={<Portfolio />} />
                    <Route path="/about" element={<Portfolio />} />
                    <Route path="/services" element={<Portfolio />} />
                    <Route path="/contact" element={<Portfolio />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
              </TooltipProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AdminSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
