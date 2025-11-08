import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ArrowLeft, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';

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
  const [isValidating, setIsValidating] = useState(false);

  // Calculate subtotal with seasonal discounts applied
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
  const tax = subtotal * 0.08; // Tax calculated on subtotal only, NOT on discounted amount
  const total = subtotal - discount + tax;

  const handleApplyPromo = async () => {
    setIsValidating(true);
    try {
      const success = await applyPromoCode(promoInput);
      if (success) {
        toast.success('Promo code applied!');
        setPromoInput('');
      } else {
        toast.error('Invalid promo code');
      }
    } catch (error) {
      toast.error(error.message || 'Invalid promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleIncrease = (mealId, currentQty, stock) => {
    if (currentQty + 1 > stock) {
      toast.warning(`Only ${stock} left in stock`);
      return;
    }
    updateQuantity(mealId, currentQty + 1);
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
              {cart.map((item) => {
                const stock = item.meal.quantity_in_stock ?? 0;
                const hasDiscount =
                  item.meal.discountInfo &&
                  item.meal.discountInfo.discountedPrice < item.meal.price &&
                  item.meal.discountInfo.event;
                const pricePerItem = hasDiscount 
                  ? item.meal.discountInfo.discountedPrice 
                  : item.meal.price;
                
                return (
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
                            {/* Sale Event Badge (if applicable) */}
                            {hasDiscount && (
                              <Badge className="bg-black text-white border-0 text-xs mb-2">
                                {item.meal.discountInfo.event.name} – {item.meal.discountInfo.event.discountRate}% OFF
                              </Badge>
                            )}
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
                              {item.meal.nutrition_facts.calories} cal •{' '}
                              {item.meal.nutrition_facts.protein}g protein •{' '}
                              {item.meal.nutrition_facts.carbs}g carbs
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              In stock: {stock}
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
                              onClick={() =>
                                handleIncrease(item.meal.meal_id || item.meal.id, item.quantity, stock)
                              }
                              className="h-8 w-8 hover:bg-white rounded-md"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            {hasDiscount ? (
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 line-through text-base">
                                    ${(item.meal.price * item.quantity / 100).toFixed(2)}
                                  </span>
                                  <span className="text-xl text-black font-bold">
                                    ${(pricePerItem * item.quantity / 100).toFixed(2)}
                                  </span>
                                </div>
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500">
                                    ${(pricePerItem / 100).toFixed(2)} each
                                  </p>
                                )}
                              </div>
                            ) : (
                              <>
                                <p className="text-xl text-black">
                                  ${(item.meal.price * item.quantity / 100).toFixed(2)}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-sm text-gray-500">
                                    ${(item.meal.price / 100).toFixed(2)} each
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
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
                    disabled={!promoInput || isValidating}
                    className="border-gray-200 hover:bg-gray-100 rounded-lg"
                  >
                    {isValidating ? 'Validating...' : 'Apply'}
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
                    <span>Promo Code Discount</span>
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
