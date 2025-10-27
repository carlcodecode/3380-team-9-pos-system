import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { createOrder, getPaymentMethods } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowLeft, CreditCard, Check, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import * as api from '../../services/api';

export const Checkout = ({ onBack, onComplete }) => {
  const { user } = useAuth();
  const { cart, getCartTotal, getDiscount, appliedPromoCode, clearCart } = useCart();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    street: user?.address || '',
    city: user?.city || '',
    stateCode: user?.state || '',
    zipcode: user?.zipcode || '',
  });
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
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

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const data = await getPaymentMethods();
      setPaymentMethods(data.paymentMethods || []);
      // Auto-select first payment method if available
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        setSelectedPayment(data.paymentMethods[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoadingPayments(false);
    }
  };

  const subtotal = cart.reduce((total, item) => {
    const hasDiscount =
      item.meal.discountInfo &&
      item.meal.discountInfo.discountedPrice < item.meal.price &&
      item.meal.discountInfo.event;
    const pricePerItem = hasDiscount 
      ? item.meal.discountInfo.discountedPrice 
      : item.meal.price;
    return total + pricePerItem * item.quantity;
  }, 0);
  
  const discount = getDiscount();
  const tax = subtotal * 0.08; // Tax calculated on subtotal (after seasonal discounts) only
  const total = subtotal - discount + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Validate payment method selected
      if (!selectedPayment) {
        toast.error('Please select a payment method');
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Prepare cart items for ORDER_LINE table
      const cartItems = cart.map(item => {
        const hasDiscount =
          item.meal.discountInfo &&
          item.meal.discountInfo.discountedPrice < item.meal.price &&
          item.meal.discountInfo.event;
        const pricePerItem = hasDiscount 
          ? item.meal.discountInfo.discountedPrice 
          : item.meal.price;
        
        return {
          mealId: item.meal.meal_id || item.meal.id,
          quantity: item.quantity,
          price: Math.round(pricePerItem) // Price in cents (with seasonal discount applied)
        };
      });

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
        trackingNumber: null,
        cartItems: cartItems, // Add cart items to order data
        paymentMethodId: parseInt(selectedPayment), // Add selected payment method ID
        promoCode: appliedPromoCode || null // Add applied promo code if any
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

  // Helper functions for Card Input Formatting
  const formatCardNumber = (value) => {
    const digits = value.replace(/\s/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

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
                {/* First & Last Name (editable) */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black">First Name *</Label>
                    <Input
                      placeholder="John"
                      value={user?.firstName || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      required
                      className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">Last Name *</Label>
                    <Input
                      placeholder="Doe"
                      value={user?.lastName || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      required
                      className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-2">
                  <Label className="text-black">Street Address *</Label>
                  <Input
                    placeholder="123 Main St"
                    value={addressForm.street}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, street: e.target.value })
                    }
                    required
                    className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                  />
                </div>

                {/* City / State / Zip */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-black">City *</Label>
                    <Input
                      placeholder="Houston"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      required
                      className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">State *</Label>
                    <Input
                      placeholder="TX"
                      value={addressForm.stateCode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          stateCode: e.target.value.toUpperCase().slice(0, 2),
                        })
                      }
                      required
                      maxLength={2}
                      className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                    />
                    <p className="text-xs text-gray-500">2-letter code</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black">Zipcode *</Label>
                    <Input
                      placeholder="77001"
                      value={addressForm.zipcode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          zipcode: e.target.value.replace(/\D/g, '').slice(0, 5),
                        })
                      }
                      required
                      maxLength={5}
                      className="bg-white border-gray-200 focus:border-black rounded-lg h-11"
                    />
                    <p className="text-xs text-gray-500">5 digits</p>
                  </div>
                </div>

                {/* Delivery Notes */}
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
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Loading payment methods...</p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No payment methods available</p>

                    <Button
                      onClick={() => setAddPaymentDialogOpen(true)}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 mt-4"
                    >
                      <CreditCard className="w-4 h-4" />
                      Add New Payment Method
                    </Button>
                  </div>
                ) : (
                  <>
                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPayment === method.id.toString()
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <RadioGroupItem value={method.id.toString()} />
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 rounded-lg bg-black">
                                <CreditCard className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-black">
                                  {method.type === 0 ? 'Credit Card' : 'Debit Card'}
                                </p>
                                <p className="text-sm text-gray-500">•••• {method.last4}</p>
                                <p className="text-xs text-gray-400">Expires: {method.expiryDate}</p>
                              </div>
                            </div>
                            {selectedPayment === method.id.toString() && (
                              <Check className="w-5 h-5 text-black" />
                            )}
                          </label>
                        ))}
                      </div>
                    </RadioGroup>

                    {/* Add New Payment Method Button - Always Visible */}
                    <Button
                      onClick={() => setAddPaymentDialogOpen(true)}
                      variant="outline"
                      className="w-full border-gray-200 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 mt-4"
                    >
                      <CreditCard className="w-4 h-4" />
                      Add New Payment Method
                    </Button>
                  </>
                )}
              </div>

              {/* Add Payment Method Dialog */}
              <Dialog open={addPaymentDialogOpen} onOpenChange={setAddPaymentDialogOpen}>
                <DialogContent className="bg-white rounded-lg max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-black">Add Payment Method</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Add a new credit or debit card to use for this order
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Card Type */}
                    <div className="space-y-2">
                      <Label htmlFor="paymentType">Card Type *</Label>
                      <select
                        id="paymentType"
                        value={paymentForm.paymentType}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentType: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value={0}>Credit Card</option>
                        <option value={1}>Debit Card</option>
                      </select>
                    </div>

                    {/* Card Number */}
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentForm.cardNumber}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            cardNumber: formatCardNumber(e.target.value),
                          })
                        }
                        className="rounded-lg border-gray-200"
                        maxLength={19}
                      />
                    </div>

                    {/* Name on Card */}
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card *</Label>
                      <Input
                        id="nameOnCard"
                        placeholder="John Doe"
                        value={paymentForm.nameOnCard}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, nameOnCard: e.target.value })
                        }
                        className="rounded-lg border-gray-200"
                      />
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentForm.expiryDate}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              expiryDate: formatExpiryDate(e.target.value),
                            })
                          }
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
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cvv: e.target.value.replace(/\D/g, '').slice(0, 3),
                            })
                          }
                          className="rounded-lg border-gray-200"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-2">
                      <Label htmlFor="billingStreet">Billing Street Address *</Label>
                      <Input
                        id="billingStreet"
                        placeholder="123 Main St"
                        value={paymentForm.billingStreet}
                        onChange={(e) =>
                          setPaymentForm({ ...paymentForm, billingStreet: e.target.value })
                        }
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
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, billingCity: e.target.value })
                          }
                          className="rounded-lg border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingState">State *</Label>
                        <Input
                          id="billingState"
                          placeholder="TX"
                          value={paymentForm.billingState}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              billingState: e.target.value.toUpperCase().slice(0, 2),
                            })
                          }
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
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            billingZipcode: e.target.value.replace(/\D/g, '').slice(0, 5),
                          })
                        }
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
                      onClick={async () => {
                        try {
                          await api.addPaymentMethod({
                            cardNumber: paymentForm.cardNumber,
                            nameOnCard: paymentForm.nameOnCard,
                            expiryDate: paymentForm.expiryDate,
                            billingStreet: paymentForm.billingStreet,
                            billingCity: paymentForm.billingCity,
                            billingState: paymentForm.billingState.toUpperCase(),
                            billingZipcode: paymentForm.billingZipcode,
                            paymentType: paymentForm.paymentType,
                          });
                          toast.success('Payment method added successfully!');
                          setAddPaymentDialogOpen(false);
                          fetchPaymentMethods(); // refresh payment list immediately
                        } catch (error) {
                          console.error('Failed to add payment method:', error);
                          toast.error('Failed to add payment method');
                        }
                      }}
                      className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                    >
                      Add Payment Method
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-black mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cart.map((item) => {
                  const hasDiscount =
                    item.meal.discountInfo &&
                    item.meal.discountInfo.discountedPrice < item.meal.price &&
                    item.meal.discountInfo.event;
                  const pricePerItem = hasDiscount 
                    ? item.meal.discountInfo.discountedPrice 
                    : item.meal.price;
                  
                  return (
                    <div key={item.meal.meal_id || item.meal.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.meal.meal_name || item.meal.name} × {item.quantity}
                        </span>
                        {hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 line-through text-xs">
                              ${((item.meal.price * item.quantity) / 100).toFixed(2)}
                            </span>
                            <span className="text-black font-semibold">
                              ${((pricePerItem * item.quantity) / 100).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-black">
                            ${((item.meal.price * item.quantity) / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <div className="text-xs text-green-600 text-right">
                          {item.meal.discountInfo.event.name} – {item.meal.discountInfo.event.discountRate}% OFF
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {/* Show seasonal discount savings if any */}
                {(() => {
                  const originalSubtotal = cart.reduce(
                    (total, item) => total + item.meal.price * item.quantity,
                    0
                  );
                  const seasonalSavings = originalSubtotal - subtotal;
                  
                  return (
                    <>
                      {seasonalSavings > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Original Price</span>
                          <span>${(originalSubtotal / 100).toFixed(2)}</span>
                        </div>
                      )}
                      {seasonalSavings > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Seasonal Savings</span>
                          <span>-${(seasonalSavings / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>${(subtotal / 100).toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
                {discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span>Promo Code Discount ({appliedPromoCode})</span>
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