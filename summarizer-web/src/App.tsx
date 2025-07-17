import {lazy, Suspense} from "react";
import {Route, Switch} from "wouter";
import {queryClient} from "./lib/queryClient";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "@/components/ui/toaster";
import {TooltipProvider} from "@/components/ui/tooltip";
import AuthGuard from "@/components/auth/AuthGuard";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const AuthPage = lazy(() => import("@/pages/auth").then(module => ({ default: module.AuthPage })));
const SummariesPage = lazy(() => import("@/pages/summaries"));
const SummaryDetailPage = lazy(() => import("@/pages/summary-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const PageLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
);

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
    return (
        <AuthGuard>
            <Component {...rest} />
        </AuthGuard>
    );
};

function Router() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/summaries/:tab" component={(props) => <ProtectedRoute component={SummariesPage} {...props} />} />
                <Route path="/summaries" component={(props) => <ProtectedRoute component={SummariesPage} {...props} />} />
                <Route path="/summary/:id" component={(props) => <ProtectedRoute component={SummaryDetailPage} {...props} />} />
                {/* Example of a protected route - uncomment when needed */}
                {/* <Route path="/dashboard" component={(props) => <ProtectedRoute component={Dashboard} {...props} />} /> */}
                <Route component={NotFound} />
            </Switch>
        </Suspense>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Router />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;
