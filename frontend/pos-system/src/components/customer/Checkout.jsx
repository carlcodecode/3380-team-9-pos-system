import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { mockPaymentMethods, mockOrders } from '../../lib/mockData';
import { createOrder } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export const Checkout = ({ onBack, onComplete }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, getDiscount, appliedPromoCode, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState(mockPaymentMethods[0]?.id || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
  const discount = getDiscount();
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Prepare order data for the database
      const orderData = {
        orderDate: new Date().toISOString().split('T')[0],
        orderStatus: 0, // 0 = processing
        deliveryDate: null,
        unitPrice: Math.round(subtotal), // Store in cents
        tax: Math.round(tax), // Store in cents
        discount: Math.round(discount), // Store in cents
        notes: deliveryNotes || null,
        shippingStreet: user?.address || null,
        shippingCity: user?.city || null,
        shippingState: user?.state || null,
        shippingZipcode: user?.zipcode ? String(user.zipcode) : null,
        trackingNumber: null
      };

      console.log('📦 Placing order with data:', orderData);

      // Create order in database
      const response = await createOrder(orderData);
      
      console.log('✅ Order created:', response);

      // Clear cart and show success
      clearCart();
      toast.success('Order placed successfully! Check your order history.');
      onComplete();
    } catch (error) {
      console.error('❌ Failed to place order:', error);
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
                    value={user?.address || ''}
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
                      value={user?.phone || ''}
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
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                <div className="space-y-3">
                  {mockPaymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={method.id} />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-black">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-black">
                            {method.type === 'credit'
                              ? 'Credit Card'
                              : method.type === 'debit'
                              ? 'Debit Card'
                              : method.type === 'applepay'
                              ? 'Apple Pay'
                              : 'Google Pay'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.type === 'applepay' || method.type === 'googlepay'
                              ? method.name
                              : `•••• ${method.last4}`}
                          </p>
                        </div>
                      </div>
                      {selectedPayment === method.id && (
                        <Check className="w-5 h-5 text-black" />
                      )}
                    </label>
                  ))}
                </div>
              </RadioGroup>
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
                disabled={isProcessing || !selectedPayment}
                className="w-full bg-black hover:bg-black text-white h-12 rounded-lg btn-glossy"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};