import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Users, Loader2, X } from "lucide-react";
import { userApi } from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";

// Dropdown Portal Component
function DropdownPortal({ children, isOpen, triggerRef, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dropdownHeight = 320;
        const dropdownWidth = 288;

        // Calculate available space
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Position vertically (above or below)
        let topPosition;
        let positionType = 'below';

        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          // Position above
          topPosition = rect.top + window.scrollY - dropdownHeight - 4;
          positionType = 'above';
        } else {
          // Position below
          topPosition = rect.bottom + window.scrollY + 4;
          positionType = 'below';
        }

        // Position horizontally (ensure it stays within viewport)
        let leftPosition = rect.left + window.scrollX;
        const maxLeft = viewportWidth - dropdownWidth;

        if (leftPosition > maxLeft) {
          leftPosition = maxLeft;
        }
        if (leftPosition < 0) {
          leftPosition = 8; // Add some padding from edge
        }

        setPosition({
          top: topPosition,
          left: leftPosition,
          width: Math.max(rect.width, dropdownWidth),
          positionType
        });
      };

      updatePosition();

      // Use passive event listeners for better performance
      const options = { passive: true, capture: true };

      window.addEventListener('scroll', updatePosition, options);
      window.addEventListener('resize', updatePosition, options);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition, true);
      };
    }
  }, [isOpen, triggerRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        triggerRef.current && !triggerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: '320px'
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// Backdrop component to prevent background interaction
function Backdrop({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-0 z-40"
      onClick={onClose}
    />,
    document.body
  );
}

export default function SearchUser({ selectedUser, onUserSelect, className = "" }) {
  const [users, setUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const triggerRef = useRef(null);
  const { toast } = useToast();

  // Store original body style
  const originalStyleRef = useRef('');

  useEffect(() => {
    loadUsers();
  }, []);

  // Prevent body scroll when dropdown is open
  useEffect(() => {
    if (isDropdownOpen) {
      // Store original style
      originalStyleRef.current = document.body.style.overflow;

      // Completely lock scroll without shifting content
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore original style
      document.body.style.overflow = originalStyleRef.current;
      document.documentElement.style.overflow = originalStyleRef.current;
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = originalStyleRef.current;
      document.documentElement.style.overflow = originalStyleRef.current;
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDropdownOpen]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const userData = await userApi.getAllUsers();
      const userList = Array.isArray(userData) ? userData : userData.data || [];
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleUserSelect = (userId) => {
    onUserSelect(userId);
    setIsDropdownOpen(false);
    setUserSearchTerm("");
  };

  const handleToggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    if (newState) {
      setUserSearchTerm("");
    }
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

 return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      <Button
        variant="outline"
        onClick={handleToggleDropdown}
        className="flex items-center gap-2 min-w-[150px] justify-between w-full relative z-10"
        disabled={loadingUsers}
      >
        {loadingUsers ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedUser && selectedUserData ? (
          <span className="truncate text-gray-900 dark:text-gray-100 font-medium">
            {selectedUserData.name}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">All Users</span>
        )}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
            }`}
        />
      </Button>

      {/* Backdrop for outside clicks */}
      <Backdrop isOpen={isDropdownOpen} onClose={handleCloseDropdown} />

      {/* Dropdown Portal */}
      <DropdownPortal
        isOpen={isDropdownOpen}
        triggerRef={triggerRef}
        onClose={handleCloseDropdown}
      >
        {/* Header with search and close button */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex-1 mr-2">
            <Input
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="h-9 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseDropdown}
            className="h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </div>

        {/* Users list */}
        <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800">
          {/* All Users option */}
          <button
            onClick={() => handleUserSelect("")}
            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20 group ${selectedUser === ""
                ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500 text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            <Users className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
            <span className="font-medium">All Users</span>
          </button>

          {/* Users list */}
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/20 group ${selectedUser === user.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-medium flex items-center justify-center shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-current">
                  {user.name}
                </div>
                <div className="text-xs truncate text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 mt-0.5">
                  {user.email}
                </div>
              </div>
            </button>
          ))}

          {/* No results */}
          {filteredUsers.length === 0 && userSearchTerm && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
              <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm">No users found for "{userSearchTerm}"</p>
            </div>
          )}
        </div>
      </DropdownPortal>
    </div>
  );
}