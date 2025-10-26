import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ArrowLeft, User, CreditCard, Award, TrendingUp, MapPin, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const Profile = ({ onBack }) => {
  const { user, updateUser } = useAuth();

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // State for dialogs
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);

  // State for edit profile form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: user?.city || '',
    stateCode: user?.state || '',
    zipcode: user?.zipcode || '',
  });

  // State for add payment method form
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZipcode: '',
    paymentType: 0, // 0 = credit, 1 = debit
  });

  // Fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const data = await api.getPaymentMethods();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoadingPayments(false);
    }
  };

  // Handle opening edit profile dialog
  const handleEditProfile = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address || '',
      city: user?.city || '',
      stateCode: user?.state || '',
      zipcode: user?.zipcode || '',
    });
    setEditProfileDialogOpen(true);
  };

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation (if provided)
    if (profileForm.phone && !/^\d{3}-\d{3}-\d{4}$/.test(profileForm.phone)) {
      toast.error('Phone number must be in format: 111-111-1111');
      return;
    }

    // State code validation (if provided)
    if (profileForm.stateCode && profileForm.stateCode.length !== 2) {
      toast.error('State code must be 2 characters (e.g., TX, CA)');
      return;
    }

    // Zipcode validation (if provided)
    if (profileForm.zipcode && !/^\d{5}$/.test(profileForm.zipcode)) {
      toast.error('Zipcode must be 5 digits');
      return;
    }

    try {
      const response = await api.updateCustomerProfile(profileForm);
      
      // Update the user context with new data
      updateUser(response.user);
      
      toast.success('Profile updated successfully!');
      setEditProfileDialogOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  // Handle opening add payment dialog
  const handleAddPayment = () => {
    setPaymentForm({
      cardNumber: '',
      nameOnCard: '',
      expiryDate: '',
      cvv: '',
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingZipcode: '',
      paymentType: 0,
    });
    setAddPaymentDialogOpen(true);
  };

  // Handle saving payment method
  const handleSavePayment = async () => {
    if (!paymentForm.cardNumber || !paymentForm.nameOnCard || !paymentForm.expiryDate || 
        !paymentForm.cvv || !paymentForm.billingStreet || !paymentForm.billingCity || 
        !paymentForm.billingState || !paymentForm.billingZipcode) {
      toast.error('Please fill in all fields');
      return;
    }

    // Card number validation (basic check for 16 digits)
    const cardNumberDigits = paymentForm.cardNumber.replace(/\s/g, '');
    if (cardNumberDigits.length !== 16 || !/^\d+$/.test(cardNumberDigits)) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    // CVV validation
    if (paymentForm.cvv.length !== 3 || !/^\d+$/.test(paymentForm.cvv)) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }

    // Expiry date validation (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(paymentForm.expiryDate)) {
      toast.error('Please enter expiry date in MM/YY format');
      return;
    }

    // State validation (2 characters)
    if (paymentForm.billingState.length !== 2) {
      toast.error('State code must be 2 characters (e.g., TX, CA)');
      return;
    }

    // Zipcode validation (5 digits)
    if (!/^\d{5}$/.test(paymentForm.billingZipcode)) {
      toast.error('Zipcode must be 5 digits');
      return;
    }

    try {
      await api.addPaymentMethod({
        cardNumber: paymentForm.cardNumber,
        nameOnCard: paymentForm.nameOnCard,
        expiryDate: paymentForm.expiryDate,
        billingStreet: paymentForm.billingStreet,
        billingCity: paymentForm.billingCity,
        billingState: paymentForm.billingState.toUpperCase(),
        billingZipcode: paymentForm.billingZipcode,
        paymentType: paymentForm.paymentType
      });
      
      toast.success('Payment method added successfully!');
      setAddPaymentDialogOpen(false);
      
      // Refresh payment methods list
      fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  // Handle deleting payment method
  const handleDeletePayment = async (paymentMethodId) => {
    try {
      await api.deletePaymentMethod(paymentMethodId);
      toast.success('Payment method removed');
      
      // Refresh payment methods list
      fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const digits = value.replace(/\s/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6">
        <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-lg bg-black flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-black mb-1">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-gray-500 mb-2">{user?.email}</p>
                  <Badge className="bg-gray-100 text-black border-0">
                    {user?.role}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleEditProfile}
                className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Info
              </Button>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-black">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-black">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-black">{user?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="payment" className="space-y-6">
            <TabsList className="bg-gray-100 border-gray-200">
              <TabsTrigger value="payment" className="data-[state=active]:bg-white">
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-white">
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-black mb-5">Saved Payment Methods</h2>
                {loadingPayments ? (
                  <div className="text-center py-8 text-gray-500">Loading payment methods...</div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No payment methods added yet</div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <div
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-black">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-black">
                              {method.type === 0 ? 'Credit Card' : 'Debit Card'}
                            </p>
                            <p className="text-sm text-gray-500">•••• {method.last4}</p>
                            <p className="text-xs text-gray-400 mt-1">{method.nameOnCard}</p>
                            <p className="text-xs text-gray-400">Expires: {method.expiryDate}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {method.billingAddress.street}, {method.billingAddress.city}, {method.billingAddress.state} {method.billingAddress.zipcode}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge className="bg-gray-100 text-black border-0">Default</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePayment(method.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  onClick={handleAddPayment}
                  variant="outline"
                  className="w-full mt-4 border-gray-200 hover:bg-gray-100 rounded-lg"
                >
                  Add Payment Method
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black rounded-lg p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6" />
                    <h3>Loyalty Points</h3>
                  </div>
                  <p className="text-4xl mb-2">{user?.loyaltyPoints || 0}</p>
                  <p className="text-sm text-gray-300">Available to redeem</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-black" />
                    <h3 className="text-black">Total Spent</h3>
                  </div>
                  <p className="text-4xl text-black mb-2">${user?.totalSpent?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500">All time</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-black mb-4">Rewards Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Points until next reward</span>
                      <span className="text-black">
                        {user?.loyaltyPoints ? 2000 - (user.loyaltyPoints % 2000) : 2000} points
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{
                          width: `${user?.loyaltyPoints ? ((user.loyaltyPoints % 2000) / 2000) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Earn 100 points for every $10 spent. Redeem 2000 points for $20 off your next order.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Profile Information</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update your personal information and contact details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@email.com"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="111-111-1111"
                value={profileForm.phone}
                onChange={(e) => {
                  // Auto-format phone number as user types
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 6) {
                    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6, 10)}`;
                  } else if (value.length >= 3) {
                    value = `${value.slice(0, 3)}-${value.slice(3)}`;
                  }
                  setProfileForm({ ...profileForm, phone: value });
                }}
                maxLength={12}
                className="rounded-lg border-gray-200"
              />
              <p className="text-xs text-gray-500">Format: 111-111-1111</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Main St"
                value={profileForm.street}
                onChange={(e) => setProfileForm({ ...profileForm, street: e.target.value.slice(0, 50) })}
                maxLength={50}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Houston"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value.slice(0, 50) })}
                  maxLength={50}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateCode">State</Label>
                <Input
                  id="stateCode"
                  placeholder="TX"
                  value={profileForm.stateCode}
                  onChange={(e) => setProfileForm({ 
                    ...profileForm, 
                    stateCode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) 
                  })}
                  maxLength={2}
                  className="rounded-lg border-gray-200"
                />
                <p className="text-xs text-gray-500">2 letters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input
                  id="zipcode"
                  placeholder="77001"
                  value={profileForm.zipcode}
                  onChange={(e) => setProfileForm({ 
                    ...profileForm, 
                    zipcode: e.target.value.replace(/\D/g, '').slice(0, 5) 
                  })}
                  maxLength={5}
                  className="rounded-lg border-gray-200"
                />
                <p className="text-xs text-gray-500">5 digits</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProfileDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">Add Payment Method</DialogTitle>
            <DialogDescription className="text-gray-500">
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Card Type *</Label>
              <select
                id="paymentType"
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value={0}>Credit Card</option>
                <option value={1}>Debit Card</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ 
                  ...paymentForm, 
                  cardNumber: formatCardNumber(e.target.value) 
                })}
                className="rounded-lg border-gray-200"
                maxLength={19}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card *</Label>
              <Input
                id="nameOnCard"
                placeholder="John Doe"
                value={paymentForm.nameOnCard}
                onChange={(e) => setPaymentForm({ ...paymentForm, nameOnCard: e.target.value })}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    expiryDate: formatExpiryDate(e.target.value) 
                  })}
                  className="rounded-lg border-gray-200"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  type="password"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 3) 
                  })}
                  className="rounded-lg border-gray-200"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingStreet">Billing Street Address *</Label>
              <Input
                id="billingStreet"
                placeholder="123 Main St"
                value={paymentForm.billingStreet}
                onChange={(e) => setPaymentForm({ ...paymentForm, billingStreet: e.target.value })}
                className="rounded-lg border-gray-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingCity">City *</Label>
                <Input
                  id="billingCity"
                  placeholder="Houston"
                  value={paymentForm.billingCity}
                  onChange={(e) => setPaymentForm({ ...paymentForm, billingCity: e.target.value })}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingState">State *</Label>
                <Input
                  id="billingState"
                  placeholder="TX"
                  value={paymentForm.billingState}
                  onChange={(e) => setPaymentForm({ 
                    ...paymentForm, 
                    billingState: e.target.value.toUpperCase().slice(0, 2) 
                  })}
                  className="rounded-lg border-gray-200"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingZipcode">Zipcode *</Label>
              <Input
                id="billingZipcode"
                placeholder="77001"
                value={paymentForm.billingZipcode}
                onChange={(e) => setPaymentForm({ 
                  ...paymentForm, 
                  billingZipcode: e.target.value.replace(/\D/g, '').slice(0, 5) 
                })}
                className="rounded-lg border-gray-200"
                maxLength={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddPaymentDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePayment}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              Add Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};