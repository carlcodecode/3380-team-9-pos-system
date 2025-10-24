// ...existing code...
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';

export const Login = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      toast.success('Welcome back!');
    } else {
      toast.error('Invalid credentials. Try: customer1, admin, or staff1');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-black">
              <Package className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl text-black">Bento</span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl text-black">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-black text-white rounded-lg h-12 btn-glossy"
            >
              Sign In
            </Button>
          </form>

          <div className="space-y-4 text-center">
            <button className="text-sm text-gray-500 hover:text-black transition-colors">
              Forgot password?
            </button>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Don't have an account?</span>
              <button
                onClick={onSwitchToRegister}
                className="text-black hover:opacity-70 transition-opacity"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-6 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 mb-3">Demo Credentials:</p>
            <div className="text-xs space-y-2 text-black">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span>customer1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Admin:</span>
                <span>admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Staff:</span>
                <span>staff1</span>
              </div>
              <div className="pt-2 border-t border-gray-200 text-gray-500">
                Password: any
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
// ...existing code...