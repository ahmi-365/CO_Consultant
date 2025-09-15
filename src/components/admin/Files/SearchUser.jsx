import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Users, Loader2 } from "lucide-react";
import { userApi } from "@/services/UserService";
import { useToast } from "@/hooks/use-toast";

// Dropdown Portal Component
function DropdownPortal({ children, isOpen, triggerRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '288px',
        maxHeight: '320px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 999999,
        overflow: 'hidden'
      }}
    >
      {children}
    </div>,
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

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        const portal = document.querySelector('[style*="z-index: 999999"]');
        if (!portal || !portal.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div ref={triggerRef} className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 min-w-[150px] justify-between"
        disabled={loadingUsers}
        style={{
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          color: '#374151'
        }}
      >
        {loadingUsers ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : selectedUser && selectedUserData ? (
          <span className="truncate" style={{ color: '#111827' }}>
            {selectedUserData.name}
          </span>
        ) : (
          <span style={{ color: '#6b7280' }}>All Users</span>
        )}
        <ChevronDown className="h-4 w-4" style={{ color: '#9ca3af' }} />
      </Button>
      
      <DropdownPortal isOpen={isDropdownOpen} triggerRef={triggerRef}>
        <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
          <Input
            placeholder="Search users..."
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            style={{ 
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}
          />
        </div>
        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          <button
            onClick={() => handleUserSelect("")}
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              backgroundColor: selectedUser === "" ? '#dbeafe' : 'transparent',
              borderLeft: selectedUser === "" ? '4px solid #3b82f6' : '4px solid transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users className="h-4 w-4" style={{ color: '#4b5563' }} />
            <span style={{ color: '#111827', fontWeight: '500' }}>All Users</span>
          </button>
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                backgroundColor: selectedUser === user.id ? '#dbeafe' : 'transparent',
                borderLeft: selectedUser === user.id ? '4px solid #3b82f6' : '4px solid transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div 
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '500'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '500', 
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.email}
                </div>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && userSearchTerm && (
            <div style={{ 
              padding: '8px 12px', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              No users found
            </div>
          )}
        </div>
      </DropdownPortal>
    </div>
  );
}
