import { createContext, useContext, useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

interface Web3AuthContextType {
  user: any;
  isLoading: boolean;
  isConnected: boolean;
  provider: IProvider | null;
  initError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(
  undefined
);

const clientId =
  "BDlDFmqrcip10Uxk6l-xJkAoPfuVBjtqK2WUcckxQdTFKixnlmM2pIP1fQF76qzCvviQZ0lVAUkClidqBJ5u7zs";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1", // Ethereum mainnet
  rpcTarget: "https://cloudflare-eth.com",
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

export const Web3AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        console.log("Starting Web3Auth initialization...");

        // Create the private key provider with a working RPC endpoint
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: {
            chainConfig: {
              chainNamespace: CHAIN_NAMESPACES.EIP155,
              chainId: "0x89", // Polygon mainnet (more reliable)
              rpcTarget: "https://polygon-rpc.com",
              displayName: "Polygon Mainnet",
              blockExplorerUrl: "https://polygonscan.com",
              ticker: "MATIC",
              tickerName: "Polygon",
            },
          },
        });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        console.log("Web3Auth instance created, initializing modal...");
        setWeb3auth(web3authInstance);

        // Set a reasonable timeout for initialization
        const initPromise = web3authInstance.initModal();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Web3Auth initialization timeout")),
            10000
          );
        });

        await Promise.race([initPromise, timeoutPromise]);
        console.log("Web3Auth modal initialized successfully");

        if (web3authInstance.connected) {
          console.log("User already connected, getting user info...");
          setProvider(web3authInstance.provider);
          setIsConnected(true);
          const userData = await web3authInstance.getUserInfo();
          setUser(userData);
        }
      } catch (error) {
        console.error("Web3Auth initialization error:", error);
        setInitError(
          error instanceof Error
            ? error.message
            : "Web3Auth initialization failed"
        );
        // Even if initialization fails, we should stop loading
      } finally {
        setIsLoading(false);
        console.log("Web3Auth initialization complete");
      }
    };

    init();

    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn(
        "Web3Auth initialization timeout - forcing loading to false"
      );
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      setIsLoading(true);
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setIsConnected(true);

      const userData = await web3auth.getUserInfo();
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.error("Web3Auth not initialized");
      return;
    }

    try {
      await web3auth.logout();
      setProvider(null);
      setUser(null);
      setIsConnected(false);
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
        provider,
        initError,
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
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider");
  }
  return context;
};
