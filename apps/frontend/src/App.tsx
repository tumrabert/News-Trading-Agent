
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3AuthProvider } from "@/hooks/useWeb3Auth";
import { configureApiClient } from "@workspace/api-client";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Configure API client at startup - use relative URLs to work with Vite proxy
console.log('Configuring API client with baseUrl: /api');
configureApiClient({
  baseUrl: '/api',  // Will be proxied to localhost:3003/api by vite
  wsUrl: window.location.origin,  // WebSocket URL using same origin (socket.io will handle the path)
  debug: true
});

console.log('App component loaded');

const App = () => {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Web3AuthProvider>
          <Toaster />
          <Sonner />
          <Index />
        </Web3AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
