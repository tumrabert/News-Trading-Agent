
import { Wallet, LogOut, Settings, User } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserMenu = () => {
  const { user, isConnected, login, logout, isLoading } = useWeb3Auth();

  // Show connect button when not connected
  if (!isConnected) {
    return (
      <Button 
        onClick={login} 
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  const handleDisconnect = async () => {
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} alt={user?.name || user?.email} />
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'W'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || 'Web3 User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'Connected via Web3Auth'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Wallet className="mr-2 h-4 w-4" />
          <span>Wallet</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
