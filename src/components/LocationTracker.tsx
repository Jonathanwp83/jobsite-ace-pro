import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationTrackerProps {
  onLocationUpdate?: (location: LocationData) => void;
  required?: boolean;
  showMap?: boolean;
}

export const LocationTracker = ({ 
  onLocationUpdate, 
  required = false,
  showMap = false 
}: LocationTrackerProps) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Location Not Available",
        description: errorMsg,
      });
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        
        setLocation(locationData);
        setLoading(false);
        onLocationUpdate?.(locationData);
        
        toast({
          title: "Location Updated",
          description: "Your current location has been recorded",
        });
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        
        setError(errorMsg);
        setLoading(false);
        
        toast({
          variant: "destructive",
          title: "Location Error",
          description: errorMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  };

  const startWatching = () => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        
        setLocation(locationData);
        onLocationUpdate?.(locationData);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      }
    );

    setWatchId(id);
  };

  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy <= 10) return <Badge variant="default">High Accuracy</Badge>;
    if (accuracy <= 50) return <Badge variant="secondary">Good Accuracy</Badge>;
    return <Badge variant="outline">Low Accuracy</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Tracking
          {required && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={getCurrentLocation} 
            disabled={loading}
            variant="default"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {loading ? 'Getting Location...' : 'Get Current Location'}
          </Button>
          
          {watchId ? (
            <Button onClick={stopWatching} variant="outline">
              Stop Tracking
            </Button>
          ) : (
            <Button onClick={startWatching} variant="outline">
              Start Live Tracking
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {location && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Coordinates:</span>
                <div className="text-muted-foreground">
                  {formatCoordinates(location.latitude, location.longitude)}
                </div>
              </div>
              <div>
                <span className="font-medium">Accuracy:</span>
                <div className="mt-1">
                  {getAccuracyBadge(location.accuracy)}
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(location.timestamp).toLocaleString()}
            </div>

            {showMap && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                    window.open(url, '_blank');
                  }}
                >
                  View on Map
                </Button>
              </div>
            )}
          </div>
        )}

        {watchId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></div>
            Live tracking active
          </div>
        )}
      </CardContent>
    </Card>
  );
};