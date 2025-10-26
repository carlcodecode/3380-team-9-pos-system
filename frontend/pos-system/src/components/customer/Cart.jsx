import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ArrowLeft, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const Cart = ({ onBack, onCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    appliedPromoCode,
    applyPromoCode,
    removePromoCode,
    getDiscount,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
  const discount = getDiscount();
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  const handleApplyPromo = () => {
    if (applyPromoCode(promoInput)) {
      toast.success('Promo code applied!');
      setPromoInput('');
    } else {
      toast.error('Invalid promo code');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6">
          <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-black mb-3">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">
                Add some delicious meals to get started!
              </p>
              <Button
                onClick={onBack}
                className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
              >
                Browse Meals
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6">
        <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-black">Shopping Cart ({cart.length})</h1>
              <Button
                onClick={clearCart}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
              >
                Clear All
              </Button>
            </div>

            {/* Cart items list */}
            <div className="space-y-4">
              {cart.map((item) => (
                <motion.div
                  key={item.meal.meal_id || item.meal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-lg border border-gray-200 p-5 card-glow"
                >
                  <div className="flex gap-5">
                    {/* Image */}
                    <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.meal.img_url}
                        alt={item.meal.meal_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-black mb-1">{item.meal.meal_name}</h3>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {item.meal.meal_types.map((type) => (
                              <Badge
                                key={type}
                                variant="secondary"
                                className="text-xs bg-gray-100 text-black border-0"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">
                            {item.meal.nutrition_facts.calories} cal • {item.meal.nutrition_facts.protein}g protein • {item.meal.nutrition_facts.carbs}g carbs
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.meal.meal_id || item.meal.id)}
                          className="hover:bg-gray-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>

                      {/* Price and quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.meal.meal_id || item.meal.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 hover:bg-white rounded-md"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center text-black">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.meal.meal_id || item.meal.id, item.quantity + 1)}
                            className="h-8 w-8 hover:bg-white rounded-md"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xl text-black">
                            ${(item.meal.price * item.quantity / 100).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500">${(item.meal.price / 100).toFixed(2)} each</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-black mb-6">Order Summary</h2>

              {/* Promo Code */}
              <div className="mb-6 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className="pl-10 bg-white border border-gray-200 focus:border-black rounded-lg h-11"
                    />
                  </div>
                  <Button
                    onClick={handleApplyPromo}
                    variant="outline"
                    disabled={!promoInput}
                    className="border-gray-200 hover:bg-gray-100 rounded-lg"
                  >
                    Apply
                  </Button>
                </div>

                {appliedPromoCode && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-black" />
                      <span className="text-sm text-black">{appliedPromoCode}</span>
                    </div>
                    <Button
                      onClick={removePromoCode}
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-gray-500 hover:text-black"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span>Discount</span>
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
                onClick={onCheckout}
                className="w-full bg-black hover:bg-black text-white h-12 rounded-lg btn-glossy"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};