import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-9 h-9 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 flex items-center justify-center"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Smooth icon transition */}
      <div className="relative w-4 h-4">
        <Sun className="absolute inset-0 h-4 w-4 transition-all duration-500 text-gray-600 dark:text-gray-400 rotate-0 opacity-100 dark:rotate-90 dark:opacity-0" />
        <Moon className="absolute inset-0 h-4 w-4 transition-all duration-500 text-gray-600 dark:text-gray-400 -rotate-90 opacity-0 dark:rotate-0 dark:opacity-100" />
      </div>
      
      {/* Subtle pulse animation on hover */}
      <div className="absolute inset-0 rounded-lg bg-current opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </button>
  );
}