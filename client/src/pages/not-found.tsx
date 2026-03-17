import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center 
                    justify-center bg-background">
      <div className="flex flex-col items-center gap-4 
                      text-center p-8 max-w-md">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or 
          you don't have permission to view it.
        </p>
        <Link href="/">
          <button className="mt-2 px-4 py-2 text-sm font-medium 
                             bg-primary text-primary-foreground 
                             rounded-md hover:bg-primary/90 
                             transition-colors">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
