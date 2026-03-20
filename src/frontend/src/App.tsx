import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import DiaryApp from "./components/DiaryApp";
import LandingPage from "./components/LandingPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === "logging-in";

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background paper-texture flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <img
              src="/assets/generated/tree-icon-transparent.dim_80x80.png"
              alt="Heartwood Journal"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <Skeleton className="h-4 w-40 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      {isAuthenticated ? <DiaryApp /> : <LandingPage />}
    </>
  );
}
