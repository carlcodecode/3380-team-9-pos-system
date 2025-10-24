import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';

export const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'customer',
    address: '',
  });
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = register(formData, formData.password);
    if (success) {
      toast.success('Account created successfully!');
    } else {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
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
            <h1 className="text-3xl text-black">Create your account</h1>
            <p className="text-gray-500">Join us today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-black">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-black">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-black">
                Account Type
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                <SelectTrigger className="bg-white border border-gray-200 rounded-lg h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'customer' && (
              <div className="space-y-2">
                <Label htmlFor="address" className="text-black">
                  Delivery Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-black text-white rounded-lg h-12 btn-glossy"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Already have an account?</span>
              <button
                onClick={onSwitchToLogin}
                className="text-black hover:opacity-70 transition-opacity"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};