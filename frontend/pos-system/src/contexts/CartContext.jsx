import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);

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
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
    const discount = getDiscount();
    return subtotal - discount;
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const applyPromoCode = (code) => {
    // Mock promo codes
    const validCodes = ['SPRING20', 'BOGO50', 'WELCOME10'];
    if (validCodes.includes(code.toUpperCase())) {
      setAppliedPromoCode(code.toUpperCase());
      return true;
    }
    return false;
  };

  const removePromoCode = () => {
    setAppliedPromoCode(null);
  };

  const getDiscount = () => {
    if (!appliedPromoCode) return 0;
    const subtotal = cart.reduce((total, item) => total + item.meal.price * item.quantity, 0);
    
    if (appliedPromoCode === 'SPRING20') {
      return subtotal * 0.2;
    } else if (appliedPromoCode === 'WELCOME10') {
      return subtotal * 0.1;
    } else if (appliedPromoCode === 'BOGO50') {
      // Simple BOGO 50% off calculation
      return subtotal * 0.25;
    }
    return 0;
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