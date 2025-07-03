import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowConsent(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowConsent(false);
  };

  const rejectAll = () => {
    const rejected = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(rejected);
    localStorage.setItem('cookie-consent', JSON.stringify(rejected));
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Cookie className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-sm">Cookie Settings</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={rejectAll}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            We use cookies to enhance your experience, analyze traffic, and personalize content. 
            Choose your preferences below.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={acceptAll}
              size="sm"
              className="flex-1"
            >
              Accept All
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="necessary" className="font-medium">Necessary</Label>
                      <p className="text-sm text-gray-600">Required for basic site functionality</p>
                    </div>
                    <Switch
                      id="necessary"
                      checked={preferences.necessary}
                      disabled
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="font-medium">Analytics</Label>
                      <p className="text-sm text-gray-600">Help us improve our website</p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing" className="font-medium">Marketing</Label>
                      <p className="text-sm text-gray-600">Personalized ads and content</p>
                    </div>
                    <Switch
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="functional" className="font-medium">Functional</Label>
                      <p className="text-sm text-gray-600">Enhanced website features</p>
                    </div>
                    <Switch
                      id="functional"
                      checked={preferences.functional}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, functional: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={rejectAll} variant="outline" className="flex-1">
                    Reject All
                  </Button>
                  <Button onClick={acceptSelected} className="flex-1">
                    Save Preferences
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};