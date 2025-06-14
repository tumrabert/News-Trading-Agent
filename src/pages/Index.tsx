
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Wallet, Activity } from "lucide-react";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import MarketOverview from "@/components/dashboard/MarketOverview";
import PriceChart from "@/components/dashboard/PriceChart";
import TradingPanel from "@/components/dashboard/TradingPanel";
import NewsPanel from "@/components/dashboard/NewsPanel";

const Index = () => {
  const [portfolioValue, setPortfolioValue] = useState(45320.50);
  const [portfolioChange, setPortfolioChange] = useState(2.34);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">CryptoTrader Pro</h1>
              <Badge variant="secondary">AI-Powered</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
                <p className="text-xl font-bold">${portfolioValue.toLocaleString()}</p>
                <p className={`text-sm flex items-center ${portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {portfolioChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {portfolioChange >= 0 ? '+' : ''}{portfolioChange}%
                </p>
              </div>
              <Button>Connect Wallet</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${portfolioValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+2.34% from yesterday</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h P&L</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$1,250.32</div>
                <p className="text-xs text-muted-foreground">+2.84% gain</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">8 profitable positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Signals</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">New buy signals</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <div className="lg:col-span-4">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="trading">Trading</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
                <TabsTrigger value="news">News & Signals</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PriceChart />
                  </div>
                  <div>
                    <PortfolioOverview />
                  </div>
                </div>
                <MarketOverview />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioOverview detailed={true} />
              </TabsContent>

              <TabsContent value="trading">
                <TradingPanel />
              </TabsContent>

              <TabsContent value="market">
                <MarketOverview detailed={true} />
              </TabsContent>

              <TabsContent value="news">
                <NewsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
