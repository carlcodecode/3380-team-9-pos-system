import React, { createContext, useContext, useState, useEffect } from 'react';
import { validatePromoCode } from '../services/api';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoDetails, setPromoDetails] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('bentoCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bentoCart', JSON.stringify(cart));
  }, [cart]);

const addToCart = (meal) => {
  setCart(prevCart => {
    const mealId = meal.meal_id || meal.id;
    const existingItem = prevCart.find(
      item => (item.meal.meal_id || item.meal.id) === mealId
    );

    if (existingItem) {
      return prevCart.map(item =>
        (item.meal.meal_id || item.meal.id) === mealId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...prevCart, { meal, quantity: 1 }];
  });
};


  const removeFromCart = (mealId) => {
    setCart(prevCart => prevCart.filter(item => (item.meal.meal_id || item.meal.id) !== mealId));
  };

  const updateQuantity = (mealId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(mealId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        (item.meal.meal_id || item.meal.id) === mealId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromoCode(null);
    setPromoDetails(null);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
    const discount = getDiscount();
    return subtotal - discount;
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const applyPromoCode = async (code) => {
    try {
      const response = await validatePromoCode(code);
      if (response.valid && response.promotion) {
        setAppliedPromoCode(response.promotion.code);
        setPromoDetails(response.promotion);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Promo code validation error:', error);
      return false;
    }
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoDetails(null);
  };

  const getDiscount = () => {
    if (!appliedPromoCode || !promoDetails) return 0;
    const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
    
    // promo_type is stored as integer in database (e.g., 20 for 20%)
    // Need to divide by 100 to get the decimal percentage (20 / 100 = 0.20)
    const discountRate = promoDetails.type / 100;
    return Math.round(subtotal * discountRate);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        appliedPromoCode,
        applyPromoCode,
        removePromoCode,
        getDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};