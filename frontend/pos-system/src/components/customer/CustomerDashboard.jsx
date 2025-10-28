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
  console.log('🔍 CustomerDashboard mounted, user:', user);
  const { cart, addToCart } = useCart();
  const [currentView, setCurrentView] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [promotions, setPromotions] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealCategories, setMealCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saleEvents, setSaleEvents] = useState([]);
  const [deliveryAlerts, setDeliveryAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    fetchPromotions();
    fetchMealsAndSales();
    fetchMealCategories();
  }, []);

  useEffect(() => {
    if (!user?.customerId) return;

    const fetchDeliveryAlerts = async () => {
      try {
        console.log('Current user in CustomerDashboard:', user);
        const data = await api.getCustomerDeliveryAlerts(user.customerId);
        console.log("Fetched alerts:", data);
        setDeliveryAlerts(data);
      } catch (error) {
        console.error('Error fetching delivery alerts:', error);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchDeliveryAlerts();
    const interval = setInterval(fetchDeliveryAlerts, 3000); // refresh every 3s for real time notifs
    return () => clearInterval(interval);
  }, [user]);

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

    const fetchMealsAndSales = async () => {
      try {
        setLoadingMeals(true);
        const [mealsData, saleEventData] = await Promise.all([
          api.getAllMeals(),
          api.getAllSaleEvents(),
        ]);

        const activeSales = (saleEventData.sale_events || saleEventData || []).filter(event => {
          const now = new Date();
          const start = new Date(event.event_start);
          const end = new Date(event.event_end);
          return now >= start && now <= end;
        });

        setSaleEvents(activeSales);

        // Normalize meal_types
        const normalizedMeals = (mealsData || [])
          .filter(meal => meal.meal_status === 1)
          .map(meal => ({
            ...meal,
            meal_types: Array.isArray(meal.meal_types)
              ? meal.meal_types
              : typeof meal.meal_types === 'string'
              ? JSON.parse(meal.meal_types)
              : [],
          }));

        setMeals(normalizedMeals);
      } catch (error) {
        console.error('Failed to load meals or sales:', error);
        toast.error('Failed to load meals or sale events');
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

const handleAddToCart = (meal) => {
  const stock = meal.quantity_in_stock ?? meal.stock ?? 0;

  // Find current quantity of this meal in cart
  const existingItem = cart.find(
    (item) => item.meal.meal_id === meal.meal_id
  );
  const currentQty = existingItem ? existingItem.quantity : 0;

  if (currentQty + 1 > stock) {
    toast.error(`Only ${stock} '${meal.meal_name}' left in stock!`);
    return;
  }

  addToCart(meal);
  toast.success(`${meal.meal_name || meal.name} added to cart!`);
};


  const handleLogoClick = () => setCurrentView('browse');

  const calculateDiscountedPrice = (meal) => {
  let bestEvent = null;
  let highestDiscount = 0;

  for (const event of saleEvents) {
    if (!Array.isArray(event.meals)) continue;

    const mealSale = event.meals.find(m => m.meal_ref === meal.meal_id);
    if (mealSale) {
      const rate = mealSale.discount_rate;
      if (rate > highestDiscount) {
        highestDiscount = rate;
        bestEvent = {
          name: event.event_name,
          discountRate: rate,
        };
      }
    }
  }

  if (bestEvent) {
    const discountedPrice = meal.price * (1 - highestDiscount / 100);
    return { discountedPrice, event: bestEvent };
  }

  return null;
};


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
  const deliveryAlertBanner = !loadingAlerts && deliveryAlerts.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <div className="bg-white rounded-lg border-2 border-black p-4 mx-6 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-black font-medium">Delivery Updates</h3>
            <Badge className="bg-black text-white border-0">
              {deliveryAlerts.length}
            </Badge>
          </div>
          {deliveryAlerts.map((alert) => (
            <div key={alert.event_id} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
              <div>
                <div className="text-black text-sm">Order #{alert.ref_order_id}</div>
                <div className="text-xs text-gray-500">
                  {alert.event_type === 'ORDER_SHIPPED' && 'Your order has been shipped!'}
                  {alert.event_type === 'ORDER_DELIVERED' && 'Your order was delivered successfully!'}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-gray-600 hover:text-black border-gray-300 rounded-lg"
                onClick={async () => {
                  try {
                    await api.markDeliveryAlertResolved(alert.event_id);
                    setDeliveryAlerts(prev => prev.filter(a => a.event_id !== alert.event_id));
                    toast.success('Alert dismissed');
                  } catch (err) {
                    toast.error('Failed to dismiss alert');
                    console.error(err);
                  }
                }}
              >
                Dismiss
              </Button>

            </div>
          ))}
        </div>
      </motion.div>
    );
  // --- View switching ---
  if (currentView === 'cart')
    return (
      <>
        <Navbar
          onCartClick={() => setCurrentView('browse')}
          onProfileClick={() => setCurrentView('profile')}
          onLogoClick={handleLogoClick}
        />
        {deliveryAlertBanner}
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
        {deliveryAlertBanner}
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
        {deliveryAlertBanner}
        <OrderHistory
          onBack={() => setCurrentView('browse')}
          onReorder={items => {
            items.forEach(item => addToCart(item.meal));
            //toast.success('Items added to cart!');
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
      {deliveryAlertBanner}
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
          {filteredMeals.map(meal => {
            const discountInfo = calculateDiscountedPrice(meal);
            return (
              <MealCard
                key={meal.meal_id}
                meal={{ ...meal, discountInfo }}
                onAddToCart={handleAddToCart}
              />
            );
          })}
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
