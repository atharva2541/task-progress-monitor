
import { useState } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpRight, 
  BarChart4, 
  CheckCircle, 
  Clock, 
  Users, 
  UserPlus,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

export function AdminDashboard() {
  const { tasks } = useTask();
  const { users, addUser, updateUser, deleteUser } = useAuth();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'maker' as UserRole,
    roles: [] as UserRole[]
  });
  const [editingUser, setEditingUser] = useState<null | {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    roles: UserRole[];
  }>(null);
  
  // Calculate task statistics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const submittedTasks = tasks.filter(task => task.status === 'submitted').length;
  const approvedTasks = tasks.filter(task => task.status === 'approved').length;
  const rejectedTasks = tasks.filter(task => task.status === 'rejected').length;
  
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  // Data for pie chart (task status)
  const statusData = [
    { name: 'Pending', value: pendingTasks, color: '#94a3b8' },
    { name: 'In Progress', value: inProgressTasks, color: '#3b82f6' },
    { name: 'Submitted', value: submittedTasks, color: '#8b5cf6' },
    { name: 'Approved', value: approvedTasks, color: '#22c55e' },
    { name: 'Rejected', value: rejectedTasks, color: '#ef4444' }
  ];
  
  // Data for bar chart (task priority)
  const priorityData = [
    { name: 'High', value: highPriorityTasks, color: '#ef4444' },
    { name: 'Medium', value: mediumPriorityTasks, color: '#f59e0b' },
    { name: 'Low', value: lowPriorityTasks, color: '#22c55e' }
  ];
  
  // Mock data for team performance chart
  const teamData = [
    { name: 'Team A', completed: 20, inProgress: 5, rejected: 2 },
    { name: 'Team B', completed: 15, inProgress: 8, rejected: 1 },
    { name: 'Team C', completed: 12, inProgress: 4, rejected: 3 },
    { name: 'Team D', completed: 18, inProgress: 6, rejected: 0 }
  ];

  const handleCreateUser = () => {
    addUser({
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      roles: newUserData.roles.length > 0 ? 
        [...new Set([newUserData.role, ...newUserData.roles])] : 
        [newUserData.role]
    });
    
    setNewUserData({
      name: '',
      email: '',
      role: 'maker',
      roles: []
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    updateUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
      roles: editingUser.roles.length > 0 ? 
        [...new Set([editingUser.role, ...editingUser.roles])] : 
        [editingUser.role]
    });
    
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      alert("Cannot delete the last user");
      return;
    }
    
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  const formatRoles = (roles: UserRole[]) => {
    return roles.map(role => {
      switch(role) {
        case 'admin': return 'Admin';
        case 'maker': return 'Maker';
        case 'checker1': return 'Checker 1';
        case 'checker2': return 'Checker 2';
        default: return role;
      }
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system performance and metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              All tasks in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks ? Math.round((approvedTasks / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Task approval percentage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 days</div>
            <p className="text-xs text-muted-foreground">
              -0.5 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue="overview" 
        className="space-y-4" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>
                  Overview of tasks by their current status
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Task Priority</CardTitle>
                <CardDescription>
                  Distribution of tasks by priority level
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={priorityData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Tasks" fill="#8884d8">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 grid-cols-1">
            <Card className="col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Tasks</CardTitle>
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'}`}
                        >
                          {task.priority}
                        </span>
                        <span 
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${task.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            task.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            task.status === 'submitted' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'}`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">User Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system. Users can have multiple roles.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="primary-role" className="text-right">
                      Primary Role
                    </Label>
                    <Select 
                      value={newUserData.role}
                      onValueChange={(value: UserRole) => setNewUserData({...newUserData, role: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select primary role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="maker">Maker</SelectItem>
                        <SelectItem value="checker1">Checker 1</SelectItem>
                        <SelectItem value="checker2">Checker 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                      Additional Roles
                    </Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                      {(['admin', 'maker', 'checker1', 'checker2'] as UserRole[]).map((role) => (
                        <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={newUserData.roles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUserData({
                                  ...newUserData, 
                                  roles: [...newUserData.roles, role]
                                });
                              } else {
                                setNewUserData({
                                  ...newUserData, 
                                  roles: newUserData.roles.filter(r => r !== role)
                                });
                              }
                            }}
                          />
                          {role === 'admin' ? 'Admin' : 
                           role === 'maker' ? 'Maker' : 
                           role === 'checker1' ? 'Checker 1' : 'Checker 2'}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateUser}>Create User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Primary Role</TableHead>
                    <TableHead>All Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role === 'admin' ? 'Admin' : 
                                user.role === 'maker' ? 'Maker' : 
                                user.role === 'checker1' ? 'Checker 1' : 'Checker 2'}</TableCell>
                      <TableCell>{formatRoles(user.roles || [])}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingUser({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                roles: user.roles || []
                              })}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information and roles.
                                </DialogDescription>
                              </DialogHeader>
                              {editingUser && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">
                                      Name
                                    </Label>
                                    <Input
                                      id="edit-name"
                                      value={editingUser.name}
                                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-email" className="text-right">
                                      Email
                                    </Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-primary-role" className="text-right">
                                      Primary Role
                                    </Label>
                                    <Select 
                                      value={editingUser.role}
                                      onValueChange={(value: UserRole) => setEditingUser({...editingUser, role: value})}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select primary role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="maker">Maker</SelectItem>
                                        <SelectItem value="checker1">Checker 1</SelectItem>
                                        <SelectItem value="checker2">Checker 2</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">
                                      Additional Roles
                                    </Label>
                                    <div className="col-span-3 flex flex-wrap gap-2">
                                      {(['admin', 'maker', 'checker1', 'checker2'] as UserRole[]).map((role) => (
                                        <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                                          <input 
                                            type="checkbox"
                                            checked={editingUser.roles.includes(role)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setEditingUser({
                                                  ...editingUser, 
                                                  roles: [...editingUser.roles, role]
                                                });
                                              } else {
                                                setEditingUser({
                                                  ...editingUser, 
                                                  roles: editingUser.roles.filter(r => r !== role)
                                                });
                                              }
                                            }}
                                          />
                                          {role === 'admin' ? 'Admin' : 
                                           role === 'maker' ? 'Maker' : 
                                           role === 'checker1' ? 'Checker 1' : 'Checker 2'}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateUser}>Update User</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>
                Task completion metrics by team
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={teamData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                  <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
