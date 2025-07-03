
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Web3AuthProvider } from "@/hooks/useWeb3Auth";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
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

export default App;
