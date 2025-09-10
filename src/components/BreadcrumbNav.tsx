import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2 text-sm text-cloudvault-text-secondary">
      {items.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <button 
            onClick={() => navigate(crumb.path)}
            className={`hover:text-foreground transition-colors ${
              index === items.length - 1 ? 'text-foreground font-medium' : ''
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </nav>
  );
}