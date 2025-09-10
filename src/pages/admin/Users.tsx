import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const users = [
  { id: 1, name: "Ethan Carter", email: "ethan.carter@example.com", role: "Admin", storage: "60 GB", lastActive: "2 days ago", status: "Active" },
  { id: 2, name: "Olivia Bennett", email: "olivia.bennett@example.com", role: "Editor", storage: "80 GB", lastActive: "1 day ago", status: "Active" },
  { id: 3, name: "Noah Harper", email: "noah.harper@example.com", role: "Viewer", storage: "45 GB", lastActive: "3 days ago", status: "Active" },
  { id: 4, name: "Ava Foster", email: "ava.foster@example.com", role: "Editor", storage: "70 GB", lastActive: "1 week ago", status: "Inactive" },
  { id: 5, name: "Liam Hayes", email: "liam.hayes@example.com", role: "Viewer", storage: "55 GB", lastActive: "2 weeks ago", status: "Inactive" },
  { id: 6, name: "Emma Davis", email: "emma.davis@example.com", role: "Admin", storage: "120 GB", lastActive: "5 hours ago", status: "Active" },
  { id: 7, name: "Mason Wilson", email: "mason.wilson@example.com", role: "Editor", storage: "35 GB", lastActive: "1 day ago", status: "Active" },
  { id: 8, name: "Sophie Brown", email: "sophie.brown@example.com", role: "Uploader", storage: "25 GB", lastActive: "4 days ago", status: "Active" },
];

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreateUser = () => {
    if (!newUserName || !newUserEmail || !newUserRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `User ${newUserName} has been created successfully`,
    });
    
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("");
    setIsDialogOpen(false);
  };

  const handleEditUser = (userId: number) => {
    toast({
      title: "Edit User",
      description: `Editing user with ID: ${userId}`,
    });
  };

  const handleChangeRole = (userId: number) => {
    toast({
      title: "Role Change",
      description: `Changing role for user with ID: ${userId}`,
    });
  };

  const handleViewActivity = (userId: number) => {
    toast({
      title: "User Activity",
      description: `Viewing activity for user with ID: ${userId}`,
    });
  };

  const handleDeactivateUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    const action = user?.status === 'Active' ? 'deactivated' : 'activated';
    
    toast({
      title: "User Status Updated",
      description: `User has been ${action} successfully`,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their permissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter full name" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={setNewUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="uploader">Uploader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreateUser}>Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="uploader">Uploader</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-8 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
              <div className="col-span-2">User</div>
              <div className="col-span-2">Email</div>
              <div>Role</div>
              <div>Storage</div>
              <div>Last Active</div>
              <div>Actions</div>
            </div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-8 gap-4 items-center py-4 border-b border-border last:border-0 hover:bg-accent/50 rounded-lg px-2">
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className="text-xs mt-1">
                      {user.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">{user.email}</div>
                <div>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <div className="text-sm">
                  <div className="w-20 bg-secondary rounded-full h-2 mb-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  {user.storage}
                </div>
                <div className="text-sm text-muted-foreground">{user.lastActive}</div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditUser(user.id)}>Edit User</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeRole(user.id)}>Change Role</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewActivity(user.id)}>View Activity</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)} className="text-destructive">
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}