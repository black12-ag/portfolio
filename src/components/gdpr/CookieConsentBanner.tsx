import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Cookie, 
  Settings, 
  Shield, 
  X, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  gdprCompliance, 
  isConsentRequired, 
  saveUserConsent,
  type GDPRConsent 
} from '@/lib/gdprCompliance';
import { grantAnalyticsConsent } from '@/lib/googleAnalytics';

interface CookieConsentBannerProps {
  onConsentGiven?: (consent: GDPRConsent) => void;
}

export default function CookieConsentBanner({ onConsentGiven }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if consent is required
    if (isConsentRequired()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };

    saveUserConsent(fullConsent);
    
    // Grant Google Analytics consent
    grantAnalyticsConsent({
      analytics: fullConsent.analytics,
      marketing: fullConsent.marketing,
      preferences: fullConsent.preferences
    });
    
    setShowBanner(false);
    
    if (onConsentGiven) {
      onConsentGiven({
        ...fullConsent,
        timestamp: new Date(),
        version: '1.0'
      });
    }
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };

    saveUserConsent(minimalConsent);
    
    // Grant Google Analytics consent (denied for all)
    grantAnalyticsConsent({
      analytics: minimalConsent.analytics,
      marketing: minimalConsent.marketing,
      preferences: minimalConsent.preferences
    });
    
    setShowBanner(false);
    
    if (onConsentGiven) {
      onConsentGiven({
        ...minimalConsent,
        timestamp: new Date(),
        version: '1.0'
      });
    }
  };

  const handleSavePreferences = () => {
    saveUserConsent(consent);
    
    // Grant Google Analytics consent based on user preferences
    grantAnalyticsConsent({
      analytics: consent.analytics,
      marketing: consent.marketing,
      preferences: consent.preferences
    });
    
    setShowBanner(false);
    setShowDetails(false);
    
    if (onConsentGiven) {
      onConsentGiven({
        ...consent,
        timestamp: new Date(),
        version: '1.0'
      });
    }
  };

  const cookieCategories = gdprCompliance.getCookieCategories();

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
        <div className="container max-w-6xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold">We value your privacy</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                  You can manage your preferences or learn more about our data practices.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Cookie className="h-5 w-5" />
                      Cookie Preferences
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Choose which cookies you want to accept. You can change these settings at any time.
                      </p>
                      
                      {Object.entries(cookieCategories).map(([key, category]) => (
                        <Card key={key}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{category.name}</h4>
                                  {category.required && (
                                    <Badge variant="secondary" className="text-xs">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {category.cookies.slice(0, 3).map(cookie => (
                                    <Badge key={cookie} variant="outline" className="text-xs">
                                      {cookie}
                                    </Badge>
                                  ))}
                                  {category.cookies.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{category.cookies.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={consent[key as keyof typeof consent]}
                                  onCheckedChange={(checked) => 
                                    setConsent(prev => ({ ...prev, [key]: checked }))
                                  }
                                  disabled={category.required}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Your Rights</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>Under GDPR, you have the right to:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Access your personal data</li>
                          <li>Rectify inaccurate data</li>
                          <li>Erase your data ("right to be forgotten")</li>
                          <li>Restrict processing of your data</li>
                          <li>Data portability</li>
                          <li>Object to processing</li>
                        </ul>
                        <p>
                          You can exercise these rights by contacting us at{' '}
                          <a href="mailto:privacy@metah.travel" className="text-primary hover:underline">
                            privacy@metah.travel
                          </a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSavePreferences} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Preferences
                      </Button>
                      <Button variant="outline" onClick={() => setShowDetails(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-sm pointer-events-none" 
           style={{ height: 'calc(100vh - 200px)' }} />
    </>
  );
}

// Simplified version for pages that just need basic consent
export function SimpleCookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isConsentRequired()) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    saveUserConsent({
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: true
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Cookie Notice</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              We use cookies to improve your experience. By continuing to use our site, you accept our cookie policy.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAccept} className="flex-1">
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShow(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Privacy Settings Component
export function PrivacySettings({ userId }: { userId: string }) {
  const [settings, setSettings] = useState(gdprCompliance.getPrivacySettings(userId));
  const [consent, setConsentState] = useState(gdprCompliance.getConsent());

  const handleSettingsUpdate = (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    gdprCompliance.updatePrivacySettings(userId, { [key]: value });
  };

  const handleConsentUpdate = () => {
    if (consent) {
      saveUserConsent({
        necessary: consent.necessary,
        analytics: consent.analytics,
        marketing: consent.marketing,
        preferences: consent.preferences
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Preferences
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Minimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Only collect data necessary for service provision
                  </p>
                </div>
                <Switch
                  checked={settings.dataMinimization}
                  onCheckedChange={(checked) => handleSettingsUpdate('dataMinimization', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails and offers
                  </p>
                </div>
                <Switch
                  checked={settings.allowMarketing}
                  onCheckedChange={(checked) => handleSettingsUpdate('allowMarketing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sharing data with trusted partners
                  </p>
                </div>
                <Switch
                  checked={settings.allowDataSharing}
                  onCheckedChange={(checked) => handleSettingsUpdate('allowDataSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Profiling</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow automated decision-making and profiling
                  </p>
                </div>
                <Switch
                  checked={settings.allowProfiling}
                  onCheckedChange={(checked) => handleSettingsUpdate('allowProfiling', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {consent && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookie Consent
              </h3>
              
              <div className="text-sm text-muted-foreground mb-4">
                Last updated: {new Date(consent.timestamp).toLocaleDateString()}
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Analytics Cookies</Label>
                  <Badge variant={consent.analytics ? "default" : "secondary"}>
                    {consent.analytics ? "Allowed" : "Blocked"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Marketing Cookies</Label>
                  <Badge variant={consent.marketing ? "default" : "secondary"}>
                    {consent.marketing ? "Allowed" : "Blocked"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Preference Cookies</Label>
                  <Badge variant={consent.preferences ? "default" : "secondary"}>
                    {consent.preferences ? "Allowed" : "Blocked"}
                  </Badge>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleConsentUpdate}>
                Update Cookie Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
