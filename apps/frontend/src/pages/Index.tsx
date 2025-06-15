
import { TrendingUp, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import AIAgentManager from "@/components/dashboard/AIAgentManager";
import AISignalsPanel from "@/components/dashboard/AISignalsPanel";
import TradingPanel from "@/components/dashboard/TradingPanel";
import PortfolioAnalytics from "@/components/dashboard/PortfolioAnalytics";
import TestRunner from "@/components/TestRunner";
import UserMenu from "@/components/UserMenu";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                CryptoTrader AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Test Runner Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Run Tests
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                  <TestRunner />
                </DialogContent>
              </Dialog>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>
          <div>
            <PortfolioOverview />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <AIAgentManager />
          <AISignalsPanel />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TradingPanel />
          <PortfolioAnalytics />
        </div>
      </main>
    </div>
  );
};

export default Index;
