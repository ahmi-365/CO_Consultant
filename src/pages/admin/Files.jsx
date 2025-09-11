import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Folder, FolderPlus, Upload, Search, MoreHorizontal, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const folders = [
  {
    name: "Project Alpha",
    users: [
      { name: "Ethan Carter", email: "ethan.carter@example.com" },
      { name: "Olivia Bennett", email: "olivia.bennett@example.com" },
      { name: "Noah Harper", email: "noah.harper@example.com" },
    ],
    subfolders: []
  },
  {
    name: "Marketing Materials",
    users: [
      { name: "Ava Foster", email: "ava.foster@example.com" }
    ],
    subfolders: [
      { name: "Social Media Graphics", users: [] },
      { name: "Campaign Assets Q3", users: [{ name: "Liam Hayes", email: "liam.hayes@example.com" }] }
    ]
  },
  {
    name: "Client Documents", 
    users: [
      { name: "Emma Davis", email: "emma.davis@example.com" },
      { name: "Mason Wilson", email: "mason.wilson@example.com" }
    ],
    subfolders: []
  },
  {
    name: "Archived Projects",
    users: [],
    subfolders: []
  }
];

const assignedUsers = [
  { name: "Ethan Carter", email: "ethan.carter@example.com" },
  { name: "Olivia Bennett", email: "olivia.bennett@example.com" }
];

export default function Files() {
  const [selectedFolder, setSelectedFolder] = useState("Project Alpha");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">File Management</h1>
          <p className="text-muted-foreground mt-1">Manage your team's files and storage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button>
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Folder Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search folders..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-lg font-semibold mb-4">All Folders</div>
                {folders.map((folder, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">{folder.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex -space-x-2">
                              {folder.users.slice(0, 3).map((user, userIndex) => (
                                <Avatar key={userIndex} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {folder.users.length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs font-medium">+{folder.users.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Rename Folder</DropdownMenuItem>
                          <DropdownMenuItem>Manage Access</DropdownMenuItem>
                          <DropdownMenuItem>Move Folder</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Folder</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {folder.subfolders.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {folder.subfolders.map((subfolder, subIndex) => (
                          <div key={subIndex} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50">
                            <div className="flex items-center gap-3">
                              <Folder className="h-4 w-4 text-yellow-500" />
                              <div>
                                <div className="font-medium text-sm">{subfolder.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex -space-x-2">
                                    {subfolder.users.slice(0, 2).map((user, userIndex) => (
                                      <Avatar key={userIndex} className="h-5 w-5 border-2 border-background">
                                        <AvatarFallback className="text-xs">
                                          {user.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assign Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select a Folder</label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder, index) => (
                      <SelectItem key={index} value={folder.name}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Add or remove users</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search by name or email" className="pl-9" />
                </div>
                <Button className="w-full mt-2" variant="outline">Add</Button>
              </div>

              <div>
                <label className="text-sm font-medium">Assigned to '{selectedFolder}'</label>
                <div className="space-y-2 mt-2">
                  {assignedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border border-border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}