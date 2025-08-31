import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, Play, Square, Calendar, Users, MapPin, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StreamingRatesProps {
  className?: string;
}

interface RateData {
  hotelId: string;
  roomTypes?: any[];
  rates?: any[];
}

interface HotelData {
  id: string;
  name: string;
  location?: string;
}

export const LiteApiStreamingRates: React.FC<StreamingRatesProps> = ({
  className = ''
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState<(RateData | HotelData)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamStats, setStreamStats] = useState({
    ratesReceived: 0,
    hotelsReceived: 0,
    totalTime: 0,
    startTime: 0
  });
  
  // Stream parameters
  const [params, setParams] = useState({
    city: 'Barcelona',
    countryCode: 'ES',
    checkin: '2025-12-15',
    checkout: '2025-12-18',
    adults: 2,
    limit: 50
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const startStreaming = async () => {
    if (isStreaming) {
      stopStreaming();
      return;
    }

    setIsStreaming(true);
    setError(null);
    setStreamData([]);
    setStreamStats({
      ratesReceived: 0,
      hotelsReceived: 0,
      totalTime: 0,
      startTime: Date.now()
    });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/liteapi/stream-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupancies: [{ adults: params.adults }],
          roomMapping: true,
          currency: 'USD',
          guestNationality: 'US',
          checkin: params.checkin,
          checkout: params.checkout,
          timeout: 15,
          countryCode: params.countryCode,
          limit: params.limit,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      const receivedData: (RateData | HotelData)[] = [];

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;

        buffer += value;
        const messages = buffer.split('\n\n');

        for (let i = 0; i < messages.length - 1; i++) {
          const message = messages[i];
          
          if (message.startsWith('data: ')) {
            const payload = message.slice(6);
            
            if (payload === '[DONE]') {
              console.log('Stream complete');
              setStreamStats(prev => ({
                ...prev,
                totalTime: Date.now() - prev.startTime
              }));
              toast({
                title: 'Stream Complete',
                description: `Received ${receivedData.length} items`
              });
              setIsStreaming(false);
              return;
            }

            try {
              const dataJson = JSON.parse(payload);
              
              if (dataJson.rates && dataJson.rates.length > 0) {
                const rateData: RateData = {
                  hotelId: dataJson.rates[0].hotelId,
                  rates: dataJson.rates,
                  roomTypes: dataJson.roomTypes
                };
                receivedData.push(rateData);
                setStreamStats(prev => ({
                  ...prev,
                  ratesReceived: prev.ratesReceived + dataJson.rates.length
                }));
              }

              if (dataJson.hotels && dataJson.hotels.length > 0) {
                dataJson.hotels.forEach((hotel: any) => {
                  const hotelData: HotelData = {
                    id: hotel.id,
                    name: hotel.name,
                    location: hotel.location
                  };
                  receivedData.push(hotelData);
                });
                setStreamStats(prev => ({
                  ...prev,
                  hotelsReceived: prev.hotelsReceived + dataJson.hotels.length
                }));
              }

              setStreamData([...receivedData]);

            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }

        buffer = messages[messages.length - 1];
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast({
          title: 'Stream Cancelled',
          description: 'Streaming was stopped by user'
        });
      } else {
        setError(`Streaming failed: ${err.message}`);
        toast({
          title: 'Stream Error',
          description: err.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Streaming Hotel Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={params.city}
              onChange={(e) => setParams(prev => ({ ...prev, city: e.target.value }))}
              disabled={isStreaming}
            />
          </div>
          <div>
            <Label htmlFor="country">Country Code</Label>
            <Input
              id="country"
              value={params.countryCode}
              onChange={(e) => setParams(prev => ({ ...prev, countryCode: e.target.value }))}
              disabled={isStreaming}
            />
          </div>
          <div>
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              type="number"
              min="1"
              max="10"
              value={params.adults}
              onChange={(e) => setParams(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
              disabled={isStreaming}
            />
          </div>
          <div>
            <Label htmlFor="checkin">Check-in</Label>
            <Input
              id="checkin"
              type="date"
              value={params.checkin}
              onChange={(e) => setParams(prev => ({ ...prev, checkin: e.target.value }))}
              disabled={isStreaming}
            />
          </div>
          <div>
            <Label htmlFor="checkout">Check-out</Label>
            <Input
              id="checkout"
              type="date"
              value={params.checkout}
              onChange={(e) => setParams(prev => ({ ...prev, checkout: e.target.value }))}
              disabled={isStreaming}
            />
          </div>
          <div>
            <Label htmlFor="limit">Limit</Label>
            <Input
              id="limit"
              type="number"
              min="10"
              max="500"
              value={params.limit}
              onChange={(e) => setParams(prev => ({ ...prev, limit: parseInt(e.target.value) || 50 }))}
              disabled={isStreaming}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={startStreaming}
            disabled={isStreaming}
            className="flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Streaming...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Stream
              </>
            )}
          </Button>

          {isStreaming && (
            <Button 
              onClick={stopStreaming}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{streamStats.ratesReceived}</div>
            <div className="text-sm text-muted-foreground">Rates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{streamStats.hotelsReceived}</div>
            <div className="text-sm text-muted-foreground">Hotels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{streamData.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {isStreaming 
                ? formatDuration(Date.now() - streamStats.startTime)
                : formatDuration(streamStats.totalTime)
              }
            </div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stream Data */}
        {streamData.length > 0 && (
          <div className="space-y-2">
            <Label>Live Stream Data (Latest {Math.min(10, streamData.length)} items)</Label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {streamData.slice(-10).reverse().map((item, index) => (
                <Card key={index} className="p-3">
                  {'rates' in item ? (
                    // Rate data
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500 text-white">Rate</Badge>
                        <span className="font-medium">{item.hotelId}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.rates?.length || 0} rates available
                      </div>
                    </div>
                  ) : (
                    // Hotel data
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500 text-white">Hotel</Badge>
                        <span className="font-medium">{(item as HotelData).name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {(item as HotelData).id} {(item as HotelData).location && `• ${(item as HotelData).location}`}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Configure search parameters above and click "Start Stream"</div>
          <div>• Real-time hotel rates and data will appear as they're received</div>
          <div>• This uses Server-Sent Events (SSE) for efficient streaming</div>
          <div>• Click "Stop" to cancel the stream at any time</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiteApiStreamingRates;
