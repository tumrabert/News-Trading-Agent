import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const DevLoginButton = () => {
  const { user, isLoading } = useAuth();

  if (user || isLoading) return null;

  const handleDevLogin = () => {
    // Force reload to trigger dev login
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={handleDevLogin} variant="outline" size="sm">
        Dev Login
      </Button>
    </div>
  );
};