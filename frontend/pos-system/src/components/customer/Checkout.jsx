import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import * as api from '../../services/api';

export const Checkout = ({ onBack, onComplete }) => {
  const { user, updateUser } = useAuth();
  const { cart, getCartTotal, getDiscount, appliedPromoCode, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const data = await api.getPaymentMethods();
      setPaymentMethods(data.paymentMethods || []);
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        setSelectedPayment(String(data.paymentMethods[0].id));
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      toast.error('Failed to load payment methods');
      setPaymentMethods([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
  const discount = getDiscount();
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  const handlePlaceOrder = async () => {
    if (!selectedPayment && paymentMethods.length > 0) {
      toast.error('Please select a payment method');
      return;
    }

    // For demo purposes, if no payment methods exist, create a dummy one
    const paymentMethodId = selectedPayment ? parseInt(selectedPayment) : null;
    
    if (!paymentMethodId && paymentMethods.length === 0) {
      toast.info('Demo mode: Creating order without payment method');
    }

    setIsProcessing(true);

    try {
      const orderData = {
        cart: cart,
        payment_method_id: paymentMethodId || 1, // Use 1 as fallback for demo
        delivery_notes: deliveryNotes || null,
        shipping_address: {
          street: user?.street || null,
          city: user?.city || null,
          state_code: user?.stateCode || user?.state_code || null,
          zipcode: user?.zipcode || null
        },
        promo_code: appliedPromoCode || null,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total
      };

      const response = await api.createOrder(orderData);
      
      // Update user's loyalty points in context
      if (response?.order?.loyalty_points_earned) {
        const currentPoints = user?.loyaltyPoints || user?.loyalty_points || 0;
        updateUser({ 
          loyaltyPoints: currentPoints + response.order.loyalty_points_earned,
          loyalty_points: currentPoints + response.order.loyalty_points_earned
        });
      }
      
      clearCart();
      const orderId = response?.order?.order_id || 'N/A';
      const pointsEarned = response?.order?.loyalty_points_earned || 0;
      toast.success(`Order #${orderId} placed successfully! 🎉 You earned ${pointsEarned} loyalty points!`, {
        duration: 5000
      });
      onComplete();
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6">
        <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-black">Checkout</h1>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-black mb-5">Delivery Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-black">Full Name</Label>
                  <Input
                    value={`${user?.firstName} ${user?.lastName}`}
                    disabled
                    className="bg-gray-50 border-gray-200 rounded-lg h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-black">Address</Label>
                  <Input
                    value={user?.street && user?.city ? `${user.street}, ${user.city}, ${user.stateCode || user.state_code} ${user.zipcode}` : ''}
                    disabled
                    className="bg-gray-50 border-gray-200 rounded-lg h-11"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black">Email</Label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">Phone</Label>
                    <Input
                      value={user?.phoneNumber || user?.phone_number || user?.phone || ''}
                      disabled
                      className="bg-gray-50 border-gray-200 rounded-lg h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-black">Delivery Notes (Optional)</Label>
                  <Textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    className="bg-white border-gray-200 focus:border-black rounded-lg min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-black mb-5">Payment Method</h2>

              {loadingPayments ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading payment methods...</p>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No payment methods found</p>
                  <p className="text-sm text-gray-500 mb-4">Add a payment method in your profile to continue</p>
                  <p className="text-xs text-gray-400">Demo mode: You can still place orders for testing</p>
                </div>
              ) : (
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPayment === String(method.id)
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <RadioGroupItem value={String(method.id)} />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-black">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-black">
                              {method.type === 0
                                ? 'Credit Card'
                                : method.type === 1
                                ? 'Debit Card'
                                : method.type === 2
                                ? 'Apple Pay'
                                : 'Google Pay'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.type === 2 || method.type === 3
                                ? method.nameOnCard
                                : `•••• ${method.last4}`}
                            </p>
                          </div>
                        </div>
                        {selectedPayment === String(method.id) && (
                          <Check className="w-5 h-5 text-black" />
                        )}
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-black mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cart.map((item) => (
                  <div key={item.meal.meal_id || item.meal.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.meal.meal_name || item.meal.name} × {item.quantity}
                    </span>
                    <span className="text-black">
                      ${((item.meal.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span>Discount ({appliedPromoCode})</span>
                    <span>-${(discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Tax (8%)</span>
                  <span>${(tax / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-black">Total</span>
                <span className="text-2xl text-black">${(total / 100).toFixed(2)}</span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-black hover:bg-black text-white h-12 rounded-lg btn-glossy"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Order...
                  </div>
                ) : (
                  <>Place Order {paymentMethods.length === 0 && '(Demo Mode)'}</>
                )}
              </Button>
              
              {paymentMethods.length === 0 && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Demo system: Orders can be placed without payment methods for testing
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};