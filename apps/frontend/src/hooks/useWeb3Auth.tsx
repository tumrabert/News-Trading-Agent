import { createContext, useContext, useEffect, useState } from 'react';

interface Web3AuthContextType {
  user: any;
  isLoading: boolean;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const Web3AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if user was previously connected (localStorage)
    const savedConnection = localStorage.getItem('web3auth_connected');
    const savedUser = localStorage.getItem('web3auth_user');
    
    if (savedConnection === 'true' && savedUser) {
      setIsConnected(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Simulate Web3Auth login (replace with actual Web3Auth when packages are installed)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        name: 'Demo User',
        email: 'demo@web3auth.io',
        profileImage: 'https://images.web3auth.io/web3auth-logo.svg',
        address: '0x1234...5678'
      };
      
      setUser(mockUser);
      setIsConnected(true);
      
      // Save to localStorage
      localStorage.setItem('web3auth_connected', 'true');
      localStorage.setItem('web3auth_user', JSON.stringify(mockUser));
      
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsConnected(false);
      
      // Clear localStorage
      localStorage.removeItem('web3auth_connected');
      localStorage.removeItem('web3auth_user');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Web3AuthContext.Provider 
      value={{
        user,
        isLoading,
        isConnected,
        login,
        logout,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};