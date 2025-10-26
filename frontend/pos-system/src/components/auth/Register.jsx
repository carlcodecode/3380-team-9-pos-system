import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Phone number validation (optional but recommended format)
    if (formData.phoneNumber && !/^\d{3}-\d{3}-\d{4}$/.test(formData.phoneNumber)) {
      toast.error('Phone number must be in format: 111-111-1111');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
      });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
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

            <div className="space-y-2">
              <Label htmlFor="address" className="text-black">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
                className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-black">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                placeholder="111-111-1111"
                pattern="\d{3}-\d{3}-\d{4}"
                className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
              />
              <p className="text-xs text-gray-500">Format: 111-111-1111</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-black">
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Min 6 characters"
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-black">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Confirm password"
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black text-white rounded-lg h-12 btn-glossy"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
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