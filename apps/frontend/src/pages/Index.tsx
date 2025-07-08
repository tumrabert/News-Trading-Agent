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
import { useWeb3Auth } from "@/hooks/useWeb3Auth";

const Index = () => {
  const { isConnected, isLoading, initError } = useWeb3Auth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading Web3Auth...
          </p>
        </div>
      </div>
    );
  }

  // Show error if Web3Auth failed to initialize, but continue with basic functionality
  if (initError) {
    console.warn("Web3Auth initialization failed:", initError);
    // Continue to render the app even with Web3Auth error
  }

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
              {/* Test Runner Dialog - Only show when connected */}
              {isConnected && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-4 h-4" />
                      Run Tests
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                    <TestRunner />
                  </DialogContent>
                </Dialog>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Always show Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>
          {/* Only show Portfolio Overview when connected */}
          {isConnected ? (
            <div>
              <PortfolioOverview />
            </div>
          ) : (
            <div className="mt-8 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
                <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect your wallet to access advanced trading features,
                  portfolio management, and AI-powered signals.
                </p>
                <Button
                  onClick={() => {
                    /* This will be handled by UserMenu */
                  }}
                  className="w-full"
                  size="lg"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Only show advanced features when connected */}
        {isConnected && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <AIAgentManager />
              <AISignalsPanel />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TradingPanel />
              <PortfolioAnalytics />
            </div>
          </>
        )}
        
        {initError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Web3Auth Warning:</strong> {initError}. Basic functionality is still available.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
