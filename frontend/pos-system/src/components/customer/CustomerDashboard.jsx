import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Navbar } from '../shared/Navbar';
import { MealCard } from '../shared/MealCard';
import { Cart } from './Cart';
import { Checkout } from './Checkout';
import { OrderHistory } from './OrderHistory';
import { Profile } from './Profile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Gift, ShoppingBag, User as UserIcon, History } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import * as api from '../../services/api';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [currentView, setCurrentView] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealCategories, setMealCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchPromotions();
    fetchMeals();
    fetchMealCategories();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoadingPromos(true);
      const response = await api.getAllPromos();
      const activePromos = (response.promotions || []).filter(
        promo => new Date(promo.promo_exp_date) > new Date()
      );
      setPromotions(activePromos);
    } catch (error) {
      console.error('Failed to load promotions:', error);
      setPromotions([]);
    } finally {
      setLoadingPromos(false);
    }
  };

  const fetchMeals = async () => {
    try {
      setLoadingMeals(true);
      const data = await api.getAllMeals();

      // Normalize meal_types (JSON string → array)
      const normalizedMeals = (data || []).map(meal => ({
        ...meal,
        meal_types: Array.isArray(meal.meal_types)
          ? meal.meal_types
          : typeof meal.meal_types === 'string'
          ? JSON.parse(meal.meal_types)
          : [],
      }));

      setMeals(normalizedMeals);
    } catch (error) {
      console.error('Failed to load meals:', error);
      toast.error('Failed to load meals');
      setMeals([]);
    } finally {
      setLoadingMeals(false);
    }
  };

  const fetchMealCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await api.getAllMealCategories();
      setMealCategories(data || []);
    } catch (error) {
      console.error('Failed to load meal categories:', error);
      toast.error('Failed to load meal categories');
      setMealCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddToCart = meal => {
    addToCart(meal);
    toast.success(`${meal.meal_name || meal.name} added to cart!`);
  };

  const handleLogoClick = () => setCurrentView('browse');

  const filteredMeals = meals.filter(meal => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      meal.meal_name?.toLowerCase().includes(search) ||
      meal.meal_description?.toLowerCase().includes(search);

    const matchesFilter =
      selectedFilter === 'all' ||
      (Array.isArray(meal.meal_types) &&
        meal.meal_types.some(
          type => type.toLowerCase() === selectedFilter.toLowerCase()
        ));

    return matchesSearch && matchesFilter;
  });

  const filters = ['all', ...mealCategories.map(cat => cat.meal_type)];

  // --- View switching ---
  if (currentView === 'cart')
    return (
      <>
        <Navbar
          onCartClick={() => setCurrentView('browse')}
          onProfileClick={() => setCurrentView('profile')}
          onLogoClick={handleLogoClick}
        />
        <Cart
          onBack={() => setCurrentView('browse')}
          onCheckout={() => setCurrentView('checkout')}
        />
      </>
    );

  if (currentView === 'checkout')
    return (
      <>
        <Navbar
          onCartClick={() => setCurrentView('cart')}
          onProfileClick={() => setCurrentView('profile')}
          onLogoClick={handleLogoClick}
        />
        <Checkout
          onBack={() => setCurrentView('cart')}
          onComplete={() => setCurrentView('orders')}
        />
      </>
    );

  if (currentView === 'orders')
    return (
      <>
        <Navbar
          onCartClick={() => setCurrentView('cart')}
          onProfileClick={() => setCurrentView('profile')}
          onLogoClick={handleLogoClick}
        />
        <OrderHistory
          onBack={() => setCurrentView('browse')}
          onReorder={items => {
            items.forEach(item => addToCart(item.meal));
            toast.success('Items added to cart!');
            setCurrentView('cart');
          }}
        />
      </>
    );

  if (currentView === 'profile')
    return (
      <>
        <Navbar
          onCartClick={() => setCurrentView('cart')}
          onProfileClick={() => setCurrentView('profile')}
          onLogoClick={handleLogoClick}
        />
        <Profile onBack={() => setCurrentView('browse')} />
      </>
    );

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onCartClick={() => setCurrentView('cart')}
        onProfileClick={() => setCurrentView('profile')}
        onLogoClick={handleLogoClick}
      />

      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl text-black">
              Premium Meals, <br />Delivered Fresh
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Discover our curated selection of healthy, delicious meals
            </p>
          </motion.div>
        </div>
      </div>

      {/* Promotions */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-10">
          <h2 className="text-black mb-6">Special Offers</h2>
          {loadingPromos ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading offers...</p>
            </div>
          ) : promotions.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map(promo => (
                <motion.div
                  key={promo.promotion_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg border-2 border-black p-6 card-glow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-black flex-shrink-0">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-black">Special Deal</h3>
                        <Badge className="bg-black text-white border-0 text-xs">
                          {promo.promo_type}% OFF
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {promo.promo_description}
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-gray-100 text-black px-2 py-1 rounded">
                          {promo.promo_code}
                        </code>
                        <span className="text-xs text-gray-400">
                          Expires:{' '}
                          {new Date(promo.promo_exp_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
            >
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Please check back for offers later. You ran out of luck.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 py-8">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('browse')}
            className={`gap-2 rounded-lg ${
              currentView === 'browse'
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Meals
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('orders')}
            className={`gap-2 rounded-lg ${
              currentView === 'orders'
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            Order History
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('profile')}
            className={`gap-2 rounded-lg ${
              currentView === 'profile'
                ? 'bg-black text-white'
                : 'hover:bg-gray-100'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            My Profile
          </Button>
        </div>

        {/* Search and filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border border-gray-200 focus:border-black rounded-lg"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map(filter => (
              <Button
                key={filter}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`rounded-full ${
                  selectedFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Meals' : filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Meals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeals.map(meal => (
            <MealCard
              key={meal.meal_id}
              meal={meal}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>

        {filteredMeals.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">
              No meals found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
