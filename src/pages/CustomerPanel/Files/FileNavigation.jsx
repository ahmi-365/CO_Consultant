import { Button } from "@/components/ui/button";
import { Home, ArrowUp } from "lucide-react";

export default function FileNavigation({
  currentPath,
  loading,
  handleBreadcrumbClick,
}) {
  return (
    <div className="mb-6 animate-fade-in">
      <nav className="flex items-center justify-between bg-card p-4 rounded-lg shadow-file border">
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            disabled={loading}
            className="flex items-center gap-2 text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium disabled:opacity-50"
          >
            <Home className="h-4 w-4" />
            Root
          </button>
          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <span className="mx-2 text-muted-foreground">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                disabled={loading}
                className="text-primary hover:text-primary/80 cursor-pointer transition-smooth font-medium disabled:opacity-50"
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {/* Parent folder navigation */}
        {currentPath.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBreadcrumbClick(currentPath.length - 2)}
              disabled={loading}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowUp className="h-4 w-4" />
              Back
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
}