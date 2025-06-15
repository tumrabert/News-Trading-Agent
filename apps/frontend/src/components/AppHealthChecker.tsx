
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, XCircle, Loader2, Activity } from 'lucide-react';
import { runAppHealthCheck } from '@/utils/appHealthCheck';
import { runIntegrationTests } from '@/utils/integrationTests';

interface HealthStatus {
  isRunning: boolean;
  hasRun: boolean;
  results: string[];
}

const AppHealthChecker = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isRunning: false,
    hasRun: false,
    results: []
  });

  const [integrationStatus, setIntegrationStatus] = useState<HealthStatus>({
    isRunning: false,
    hasRun: false,
    results: []
  });

  const captureConsoleOutput = (capturedLogs: string[], testFunction: () => Promise<void>) => {
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      capturedLogs.push(args.join(' '));
      originalConsoleLog(...args);
    };

    return testFunction().finally(() => {
      console.log = originalConsoleLog;
    });
  };

  const runHealthCheck = async () => {
    setHealthStatus({ isRunning: true, hasRun: false, results: [] });
    const capturedLogs: string[] = [];

    try {
      await captureConsoleOutput(capturedLogs, runAppHealthCheck);
      setHealthStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    } catch (error) {
      capturedLogs.push(`Error: ${error}`);
      setHealthStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    }
  };

  const runIntegrationCheck = async () => {
    setIntegrationStatus({ isRunning: true, hasRun: false, results: [] });
    const capturedLogs: string[] = [];

    try {
      await captureConsoleOutput(capturedLogs, runIntegrationTests);
      setIntegrationStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    } catch (error) {
      capturedLogs.push(`Error: ${error}`);
      setIntegrationStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    if (status.isRunning) {
      return <Badge variant="outline" className="text-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
    }
    if (!status.hasRun) {
      return <Badge variant="outline">Ready</Badge>;
    }
    
    const hasFailures = status.results.some(result => result.includes('❌') || result.includes('✗'));
    return hasFailures ? 
      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Issues Found</Badge> :
      <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
  };

  const renderResults = (results: string[]) => {
    if (results.length === 0) return null;

    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 mt-4">
        <h3 className="font-semibold mb-2">Results:</h3>
        <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`${
                result.includes('✅') || result.includes('✓') ? 'text-green-600' :
                result.includes('❌') || result.includes('✗') ? 'text-red-600' :
                result.includes('⚠️') ? 'text-yellow-600' :
                result.includes('🎯') || result.includes('🔍') ? 'text-blue-600 font-bold' :
                'text-gray-700 dark:text-gray-300'
              }`}
            >
              {result}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Application Health Check
            </CardTitle>
            {getStatusBadge(healthStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Check if all components, hooks, and dependencies are loading correctly.
            </p>
            <Button 
              onClick={runHealthCheck} 
              disabled={healthStatus.isRunning}
              className="flex items-center gap-2"
            >
              {healthStatus.isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Run Health Check
            </Button>
          </div>
          {renderResults(healthStatus.results)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Integration Tests
            </CardTitle>
            {getStatusBadge(integrationStatus)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Test database connections and Supabase integration.
            </p>
            <Button 
              onClick={runIntegrationCheck} 
              disabled={integrationStatus.isRunning}
              className="flex items-center gap-2"
            >
              {integrationStatus.isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              Run Integration Tests
            </Button>
          </div>
          {renderResults(integrationStatus.results)}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppHealthChecker;
