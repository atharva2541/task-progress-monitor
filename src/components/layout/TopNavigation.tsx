
import { useState } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, Settings, AlertTriangle, Info, X, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function TopNavigation() {
  const { profile, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotification();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleSettingsClick = () => {
    // Redirect to appropriate settings page based on user role
    if (isAdmin) {
      navigate('/settings');
    } else {
      navigate('/user-settings');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const userNotifications = profile ? notifications.filter(n => n.userId === profile.id) : [];
  const userUnreadCount = userNotifications.filter(n => !n.isRead).length;
  
  return (
    <nav className="bg-white border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <Link to="/" className="text-xl font-bold text-audit-purple-600 flex items-center hover:text-audit-purple-700 transition-colors">Home</Link>

        <div className="relative max-w-md hidden md:flex">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 w-[300px]" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {userUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-audit-purple-500">
                  {userUnreadCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:max-w-none">
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  You have {userUnreadCount} unread notification{userUnreadCount !== 1 ? 's' : ''}
                </p>
                {userUnreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {userNotifications.length > 0 ? (
                userNotifications.map(notification => (
                  <div key={notification.id} className={`p-3 rounded-md ${!notification.isRead ? 'bg-muted' : ''}`}>
                    <div className="flex gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
            <SheetFooter className="mt-4">
              <SheetClose asChild>
                <Button className="w-full" variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
                <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{profile?.name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
