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
    street: '',
    city: '',
    stateCode: '',
    zipcode: '',
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

    // State code validation (if provided, must be 2 characters)
    if (formData.stateCode && formData.stateCode.length !== 2) {
      toast.error('State code must be 2 characters (e.g., TX, CA)');
      return;
    }

    // Zipcode validation (if provided, must be 5 digits)
    if (formData.zipcode && !/^\d{5}$/.test(formData.zipcode)) {
      toast.error('Zipcode must be 5 digits');
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
        street: formData.street,
        city: formData.city,
        stateCode: formData.stateCode,
        zipcode: formData.zipcode,
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
              <Label htmlFor="street" className="text-black">
                Street Address
              </Label>
              <Input
                id="street"
                type="text"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value.slice(0, 50))}
                placeholder="123 Main St"
                maxLength={50}
                className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-black">
                  City
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value.slice(0, 50))}
                  placeholder="Houston"
                  maxLength={50}
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateCode" className="text-black">
                  State
                </Label>
                <Input
                  id="stateCode"
                  type="text"
                  value={formData.stateCode}
                  onChange={(e) => handleChange('stateCode', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2))}
                  placeholder="TX"
                  maxLength={2}
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
                <p className="text-xs text-gray-500">2 letters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipcode" className="text-black">
                  Zipcode
                </Label>
                <Input
                  id="zipcode"
                  type="text"
                  value={formData.zipcode}
                  onChange={(e) => handleChange('zipcode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="77001"
                  maxLength={5}
                  className="bg-white border border-gray-200 focus:border-black focus:ring-black/20 rounded-lg h-12"
                />
                <p className="text-xs text-gray-500">5 digits</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-black">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  // Auto-format phone number as user types
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 6) {
                    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
                  } else if (value.length >= 3) {
                    value = `${value.slice(0, 3)}-${value.slice(3)}`;
                  }
                  handleChange('phoneNumber', value);
                }}
                placeholder="111-111-1111"
                maxLength={12}
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