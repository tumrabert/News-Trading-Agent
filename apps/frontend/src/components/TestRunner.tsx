
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { runTests } from '@/utils/testRunner';

interface TestStatus {
  isRunning: boolean;
  hasRun: boolean;
  results: string[];
}

const TestRunner = () => {
  const [testStatus, setTestStatus] = useState<TestStatus>({
    isRunning: false,
    hasRun: false,
    results: []
  });

  const handleRunTests = async () => {
    setTestStatus({ isRunning: true, hasRun: false, results: [] });
    
    // Capture console output
    const originalConsoleLog = console.log;
    const capturedLogs: string[] = [];
    
    console.log = (...args) => {
      capturedLogs.push(args.join(' '));
      originalConsoleLog(...args);
    };

    try {
      await runTests();
      setTestStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    } catch (error) {
      capturedLogs.push(`Error: ${error}`);
      setTestStatus({ 
        isRunning: false, 
        hasRun: true, 
        results: capturedLogs 
      });
    } finally {
      console.log = originalConsoleLog;
    }
  };

  const getStatusBadge = () => {
    if (testStatus.isRunning) {
      return <Badge variant="outline" className="text-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
    }
    if (!testStatus.hasRun) {
      return <Badge variant="outline">Ready</Badge>;
    }
    
    const hasFailures = testStatus.results.some(result => result.includes('❌') || result.includes('✗'));
    return hasFailures ? 
      <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge> :
      <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            CryptoTrader AI Test Suite
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Run comprehensive tests to verify all functionality is working correctly.
          </p>
          <Button 
            onClick={handleRunTests} 
            disabled={testStatus.isRunning}
            className="flex items-center gap-2"
          >
            {testStatus.isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            Run Tests
          </Button>
        </div>

        {testStatus.results.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
              {testStatus.results.map((result, index) => (
                <div 
                  key={index} 
                  className={`${
                    result.includes('✅') || result.includes('✓') ? 'text-green-600' :
                    result.includes('❌') || result.includes('✗') ? 'text-red-600' :
                    result.includes('🎉') ? 'text-green-600 font-bold' :
                    result.includes('⚠️') ? 'text-yellow-600 font-bold' :
                    'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p><strong>Test Coverage:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Authentication flow and user management</li>
            <li>Market data hooks and real-time updates</li>
            <li>AI agents system and signals</li>
            <li>Component rendering and navigation</li>
            <li>Database connectivity and operations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestRunner;
