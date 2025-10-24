import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Package, ShoppingCart, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const Navbar = ({ onCartClick, onProfileClick, onLogoClick }) => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          >
            <div className="p-2 rounded-lg bg-black">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-black">Bento</span>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user?.role === 'customer' && onCartClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative hover:bg-gray-100 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 text-black" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-black text-white text-xs rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-black" />
                  <span className="text-black hidden sm:inline">{user?.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-[100] rounded-lg">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-black">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs bg-gray-100 text-black border-0">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'customer' && onProfileClick && (
                  <>
                    <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={logout} className="text-black focus:text-black focus:bg-gray-100 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};