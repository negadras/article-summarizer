import {FC, ReactNode} from "react";
import {useAuth} from "@/hooks/use-auth";
import {useLocation} from "wouter";

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * AuthGuard component protects routes that require authentication
 * It redirects unauthenticated users to the login page or a specified fallback path
 */
const AuthGuard: FC<AuthGuardProps> = ({
  children,
  fallbackPath = "/auth"
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated and not loading
  if (!isLoading && !isAuthenticated) {
    const currentPath = window.location.pathname;
    const redirectPath = `${fallbackPath}?redirect=${encodeURIComponent(currentPath)}`;
    setLocation(redirectPath);
    return null;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default AuthGuard;
