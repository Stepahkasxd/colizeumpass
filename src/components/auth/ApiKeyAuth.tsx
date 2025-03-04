
import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { validateApiKey } from "@/utils/apiKeyUtils";

interface ApiKeyAuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  authenticate: (apiKey: string) => Promise<boolean>;
}

const ApiKeyAuthContext = createContext<ApiKeyAuthContextProps | undefined>(undefined);

export const ApiKeyAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for API key in localStorage on component mount
    const checkStoredApiKey = async () => {
      const storedApiKey = localStorage.getItem("admin_api_key");
      
      if (storedApiKey) {
        const isValid = await validateApiKey(storedApiKey);
        setIsAuthenticated(isValid);
      }
      
      setLoading(false);
    };
    
    checkStoredApiKey();
  }, []);
  
  const authenticate = async (apiKey: string) => {
    setLoading(true);
    try {
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        localStorage.setItem("admin_api_key", apiKey);
        setIsAuthenticated(true);
        return true;
      } else {
        localStorage.removeItem("admin_api_key");
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.error("API key authentication error:", error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ApiKeyAuthContext.Provider value={{ isAuthenticated, loading, authenticate }}>
      {children}
    </ApiKeyAuthContext.Provider>
  );
};

export const useApiKeyAuth = () => {
  const context = useContext(ApiKeyAuthContext);
  
  if (context === undefined) {
    throw new Error("useApiKeyAuth must be used within an ApiKeyAuthProvider");
  }
  
  return context;
};
