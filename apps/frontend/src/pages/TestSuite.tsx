
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestFlask2, CheckCircle } from 'lucide-react';
import TestRunner from '@/components/TestRunner';
import AppHealthChecker from '@/components/AppHealthChecker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestSuite = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TestFlask2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">CryptoTrader AI Test Suite</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive testing and health monitoring for the CryptoTrader AI application
          </p>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="default" className="bg-green-600 mb-2">Frontend</Badge>
                <p className="text-sm text-gray-600">React + Vite + TypeScript</p>
              </div>
              <div className="text-center">
                <Badge variant="default" className="bg-blue-600 mb-2">Backend</Badge>
                <p className="text-sm text-gray-600">Supabase + AI Agent</p>
              </div>
              <div className="text-center">
                <Badge variant="default" className="bg-purple-600 mb-2">Testing</Badge>
                <p className="text-sm text-gray-600">Automated Test Suite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="comprehensive">Comprehensive Tests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="mt-6">
            <AppHealthChecker />
          </TabsContent>
          
          <TabsContent value="comprehensive" className="mt-6">
            <TestRunner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TestSuite;
