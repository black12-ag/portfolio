import React, { useState, useEffect, useMemo } from 'react';
import { performanceMonitor, usePerformanceMonitor } from '../lib/performanceMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  BarChart3,
  Gauge
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  url: string;
  userAgent: string;
  connectionType?: string;
  metadata?: Record<string, unknown>;
}

export function PerformanceMonitorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [webVitalsScore, setWebVitalsScore] = useState<{ score: number; metrics: Record<string, { value: number; score: number }> } | null>(null);
  const [memoryInfo, setMemoryInfo] = useState<{ used: number; total: number; percentage: number } | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<{ effectiveType: string; downlink: number; rtt: number } | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  
  const monitor = usePerformanceMonitor();

  useEffect(() => {
    const updateData = () => {
      setMetrics(monitor.getMetrics());
      setWebVitalsScore(monitor.getWebVitalsScore());
      setMemoryInfo(monitor.getMemoryUsage());
      setConnectionInfo(monitor.getConnectionInfo());
      
      monitor.getBatteryInfo?.().then(setBatteryInfo).catch(() => {});
    };

    updateData();
    const interval = setInterval(updateData, 2000);
    return () => clearInterval(interval);
  }, [monitor]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 50) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      return `${Math.round(value)}ms`;
    }
    if (unit === 'KB') {
      return `${Math.round(value / 1024)}KB`;
    }
    if (unit === 'MB') {
      return `${Math.round(value / 1024 / 1024)}MB`;
    }
    return `${Math.round(value * 100) / 100}`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="shadow-lg bg-white"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4" />
          <span className="font-medium">Performance Monitor</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => performanceMonitor.clear()}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsVisible(false)}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vitals">Vitals</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3">
            {webVitalsScore && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Gauge className="w-4 h-4" />
                    <span>Overall Performance Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={`flex items-center space-x-2 p-2 rounded border ${getScoreColor(webVitalsScore.score)}`}>
                    {getScoreIcon(webVitalsScore.score)}
                    <span className="font-bold text-lg">{webVitalsScore.score}</span>
                    <span className="text-sm">/ 100</span>
                  </div>
                  <Progress value={webVitalsScore.score} className="mt-2 h-2" />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Metrics:</span>
                  <Badge variant="secondary">{metrics.length}</Badge>
                </div>
                {connectionInfo && (
                  <div className="flex justify-between text-sm">
                    <span>Connection:</span>
                    <Badge variant="outline">{connectionInfo.effectiveType.toUpperCase()}</Badge>
                  </div>
                )}
                {memoryInfo && (
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage:</span>
                    <Badge variant={memoryInfo.percentage > 80 ? "destructive" : "secondary"}>
                      {memoryInfo.percentage}%
                    </Badge>
                  </div>
                )}
                {batteryInfo && (
                  <div className="flex justify-between text-sm">
                    <span>Battery:</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant={batteryInfo.level < 20 ? "destructive" : "secondary"}>
                        {batteryInfo.level}%
                      </Badge>
                      {batteryInfo.charging && <Zap className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-3">
            {webVitalsScore && (
              <div className="space-y-2">
                {Object.entries(webVitalsScore.metrics).map(([name, data]) => (
                  <Card key={name}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{name}</div>
                          <div className="text-xs text-gray-500">
                            {formatValue(data.value, name === 'CLS' ? '' : 'ms')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={data.score} className="w-16 h-2" />
                          <Badge 
                            variant={data.score >= 90 ? "default" : data.score >= 50 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {data.score}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-3">
            {memoryInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used:</span>
                      <span>{formatValue(memoryInfo.used, 'MB')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span>{formatValue(memoryInfo.total, 'MB')}</span>
                    </div>
                    <Progress value={memoryInfo.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {connectionInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Network</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <Badge variant="outline">{connectionInfo.effectiveType}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Downlink:</span>
                    <span>{connectionInfo.downlink} Mbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>RTT:</span>
                    <span>{connectionInfo.rtt}ms</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {batteryInfo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Battery</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level:</span>
                    <span>{batteryInfo.level}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={batteryInfo.charging ? "default" : "secondary"}>
                      {batteryInfo.charging ? "Charging" : "Discharging"}
                    </Badge>
                  </div>
                  <Progress value={batteryInfo.level} className="h-2" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-2">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {metrics.slice(-20).reverse().map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{metric.name}</div>
                        <div className="text-xs text-gray-500">
                          {(metric.timestamp instanceof Date 
                            ? metric.timestamp 
                            : new Date(metric.timestamp)
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="outline" className="text-xs">
                          {formatValue(metric.value, 'ms')}
                        </Badge>
                        {metric.connectionType && (
                          <Badge variant="secondary" className="text-xs">
                            {metric.connectionType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {metrics.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No metrics available yet
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Hook for integrating performance monitoring into React components
export function usePerformanceTracking(componentName: string) {
  const monitor = usePerformanceMonitor();

  useEffect(() => {
    monitor.startMeasure(`component-${componentName}-mount`);
    
    return () => {
      monitor.endMeasure(`component-${componentName}-mount`);
    };
  }, [monitor, componentName]);

  const trackRender = React.useCallback(() => {
    monitor.measureSync(`component-${componentName}-render`, () => {
      // This will be measured by React's render cycle
    });
  }, [monitor, componentName]);

  const trackAsyncOperation = React.useCallback(
    <T,>(operationName: string, operation: () => Promise<T>) => {
      return monitor.measureAsync(`${componentName}-${operationName}`, operation);
    },
    [monitor, componentName]
  );

  return {
    trackRender,
    trackAsyncOperation,
    startMeasure: (name: string) => monitor.startMeasure(`${componentName}-${name}`),
    endMeasure: (name: string) => monitor.endMeasure(`${componentName}-${name}`)
  };
}

export default PerformanceMonitorDashboard;
