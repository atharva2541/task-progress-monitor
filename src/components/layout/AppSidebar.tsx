
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  CheckSquare, 
  Home, 
  ClipboardCheck, 
  BellRing, 
  Users, 
  Calendar, 
  Settings, 
  BarChart4 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppSidebar() {
  const { user } = useAuth();

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { title: 'Dashboard', icon: Home, path: '/' },
      { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
      { title: 'Calendar', icon: Calendar, path: '/calendar' },
    ];

    const roleSpecificItems = {
      admin: [
        { title: 'User Management', icon: Users, path: '/admin/users' },
        { title: 'Task Management', icon: ClipboardCheck, path: '/admin/tasks' },
        { title: 'Productivity Analytics', icon: BarChart4, path: '/admin/productivity' },
        { title: 'Settings', icon: Settings, path: '/settings' },
      ],
      maker: [],
      checker1: [
        { title: 'Team Dashboard', icon: BarChart4, path: '/team-dashboard' },
      ],
      checker2: [
        { title: 'Team Dashboard', icon: BarChart4, path: '/team-dashboard' },
        { title: 'Escalations', icon: BellRing, path: '/escalations' },
      ],
    };

    if (!user) return commonItems;
    
    return [...commonItems, ...(roleSpecificItems[user.role] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center h-16 border-b">
        <Link to="/" className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-audit-purple-600" />
          <span className="font-bold text-lg">Audit Tracker</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/system-settings" className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      <span>System Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
