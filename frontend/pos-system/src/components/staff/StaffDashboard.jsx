import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../shared/Navbar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  Gift,
  Percent,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StockRestockForm } from './StockRestockForm';
import { StaffReports } from './StaffReports';
import * as api from '../../services/api';
import { PERMISSIONS, hasPermission } from '../../utils/permissions';

// Import the new component modules
import { OrderManagement } from './OrderManagement';
import { MealManagement } from './MealManagement';
import { StockControl } from './StockControl';
import { PromoCodeManagement } from './PromoCodeManagement';
import { SeasonalDiscountManagement } from './SeasonalDiscountManagement';

export const StaffDashboard = () => {
  const { user } = useAuth();
  
  const [selectedStock, setSelectedStock] = useState(null);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'reports', 'report-view'
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Debug: Log user object to see what we're getting
  useEffect(() => {
    console.log('👤 Current user in StaffDashboard:', user);
    console.log('🔑 User permissions:', user?.permissions);
    console.log('🎭 User role:', user?.role);
  }, [user]);

  // Get user permissions (default to 0 if not available, admins get all permissions)
  const isAdmin = user?.role === 'admin';
  const userPermissions = isAdmin ? 63 : (user?.permissions || 0); // 63 = all 6 permissions
  
  console.log('📊 Is Admin:', isAdmin);
  console.log('📊 Calculated userPermissions:', userPermissions);
  
  // Check which tabs should be visible
  const canViewReports = isAdmin || hasPermission(userPermissions, PERMISSIONS.REPORTS);
  const canViewOrders = isAdmin || hasPermission(userPermissions, PERMISSIONS.ORDERS);
  const canViewMeals = isAdmin || hasPermission(userPermissions, PERMISSIONS.MEAL_MANAGEMENT);
  const canViewStock = isAdmin || hasPermission(userPermissions, PERMISSIONS.STOCK_CONTROL);
  const canViewPromos = isAdmin || hasPermission(userPermissions, PERMISSIONS.PROMO_CODES);
  const canViewDiscounts = isAdmin || hasPermission(userPermissions, PERMISSIONS.SEASONAL_DISCOUNTS);

  console.log('✅ Permission checks:', {
    canViewReports,
    canViewOrders,
    canViewMeals,
    canViewStock,
    canViewPromos,
    canViewDiscounts
  });

  // Determine default tab (first available permission)
  const getDefaultTab = () => {
    if (canViewOrders) return 'orders';
    if (canViewMeals) return 'meals';
    if (canViewStock) return 'stock';
    if (canViewPromos) return 'promos';
    if (canViewDiscounts) return 'discounts';
    return 'orders'; // fallback
  };

  useEffect(() => {
      let isMounted = true;
  
      const fetchStocks = async () => {
        try {
          const data = await api.getAllStocks();
          if (isMounted) {
            setStocks((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(data)) {
                return data;
              }
              return prev;
            });
            setLoading(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
          if (isMounted) setError('Failed to load stock data');
        }
      };
  
      fetchStocks();
      const interval = setInterval(fetchStocks, 3000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, []);

  // Fetch orders for stats
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.getAllOrders();
        setOrders(response.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

    // ==============================
    // RESTOCK HANDLER
    // ==============================
    const handleRestock = async (stockId, quantity) => {
      try {
        await api.restockMeal(stockId, { quantity_to_add: quantity });
        // Optimistic UI update
        setStocks((prev) =>
          prev.map((s) =>
            s.stock_id === stockId
              ? {
                  ...s,
                  quantity_in_stock: Math.min(
                    s.quantity_in_stock + quantity,
                    s.max_stock
                  ),
                }
              : s
          )
        );
        setShowRestockForm(false);
        setSelectedStock(null);
      } catch (err) {
        console.error('Restock error:', err);
        alert('Restock failed.');
      }
    };

  // Calculate order stats from real data
  const todayOrders = {
    processing: orders.filter((o) => o.orderStatus === 0).length,
    delivered: orders.filter((o) => o.orderStatus === 1).length,
    shipped: orders.filter((o) => o.orderStatus === 2).length,
    refunded: orders.filter((o) => o.orderStatus === 3).length,
  };

  const [lowStockMeals, setLowStockMeals] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLowStockMeals = async () => {
      try {
        const data = await api.getLowStockAlerts();
        setLowStockMeals(data);
      } catch (error) {
        console.error('Error fetching low stock alerts:', error);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchLowStockMeals();

    // Auto-refresh every 3 seconds so staff see real-time updates
    const interval = setInterval(fetchLowStockMeals, 3000);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Show Reports View */}
        {(viewMode === 'reports' || viewMode === 'report-view') ? (
          <StaffReports 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-black mb-2">Staff Dashboard</h1>
                    <p className="text-gray-500">Operations and inventory management</p>
                  </div>
                  {/* Generate Report Button - Only visible if user has Reports permission */}
                  {canViewReports && (
                    <Button
                      onClick={() => setViewMode('reports')}
                      className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Report
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Order Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-500">Processing</span>
                </div>
                <div className="text-3xl text-black">{todayOrders.processing}</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-gray-800" />
                  <span className="text-sm text-gray-500">Shipped</span>
                </div>
                <div className="text-3xl text-black">{todayOrders.shipped}</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm text-gray-500">Delivered</span>
                </div>
                <div className="text-3xl text-black">{todayOrders.delivered}</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <span className="text-sm text-gray-500">Refunded</span>
                </div>
                <div className="text-3xl text-black">{todayOrders.refunded}</div>
              </div>
            </motion.div>

            {/* Low Stock Alert (Live from API) */}
            {!loadingAlerts && lowStockMeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg border-2 border-black p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle className="w-6 h-6 text-black" />
                    <h3 className="text-black">Low Stock Alerts</h3>
                    <Badge className="bg-black text-white border-0">
                      {lowStockMeals.length}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {lowStockMeals.map((meal) => (
                      <div
                        key={meal.event_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <div className="text-black mb-1">
                            {meal.meal_name || `Meal #${meal.meal_ref}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            Only {meal.quantity_in_stock} units remaining
                            (threshold: {meal.reorder_threshold})
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                          onClick={() => {
                          setSelectedStock(meal);
                          setShowRestockForm(true);
                      }}
                        >
                          Restock
                        </Button>
                        <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:text-black border-gray-300 rounded-lg"
                        onClick={async () => {
                          try {
                            await api.resolveLowStockAlert(meal.event_id);
                            console.log(`Marked ${meal.meal_name} as resolved`);
                            // Remove this alert immediately from UI
                            setLowStockMeals((prev) =>
                              prev.filter((m) => m.event_id !== meal.event_id)
                            );
                          } catch (err) {
                            console.error('Failed to mark alert resolved:', err);
                          }
                        }}
                      >
                        Mark as Resolved
                      </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* RESTOCK FORM */}
            {showRestockForm && (
              <StockRestockForm
                open={showRestockForm}
                onClose={() => setShowRestockForm(false)}
                stock={selectedStock}
                onSave={handleRestock}
              />
            )}


            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-gray-200 p-8"
            >
              <Tabs defaultValue={getDefaultTab()} className="space-y-6">
                <TabsList className="w-full grid bg-gray-100 border-gray-200 h-auto" style={{ gridTemplateColumns: `repeat(${[canViewOrders, canViewMeals, canViewStock, canViewPromos, canViewDiscounts].filter(Boolean).length}, 1fr)` }}>
                  {canViewOrders && (
                    <TabsTrigger value="orders" className="data-[state=active]:bg-white">
                      Orders
                    </TabsTrigger>
                  )}
                  {canViewMeals && (
                    <TabsTrigger value="meals" className="data-[state=active]:bg-white">
                      Meal Management
                    </TabsTrigger>
                  )}
                  {canViewStock && (
                    <TabsTrigger value="stock" className="data-[state=active]:bg-white">
                      Stock Control
                    </TabsTrigger>
                  )}
                  {canViewPromos && (
                    <TabsTrigger value="promos" className="data-[state=active]:bg-white flex items-center justify-center">
                      <Gift className="w-4 h-4 mr-2" />
                      Promo Codes
                    </TabsTrigger>
                  )}
                  {canViewDiscounts && (
                    <TabsTrigger value="discounts" className="data-[state=active]:bg-white flex items-center justify-center">
                      <Percent className="w-4 h-4 mr-2" />
                      Seasonal Discounts
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Orders Tab */}
                {canViewOrders && (
                  <TabsContent value="orders" className="space-y-4">
                    <OrderManagement />
                  </TabsContent>
                )}

                {/* Meals Tab */}
                {canViewMeals && (
                  <TabsContent value="meals" className="space-y-4">
                    <MealManagement />
                  </TabsContent>
                )}

                {/* Stock Tab */}
                {canViewStock && (
                  <TabsContent value="stock" className="space-y-4">
                    <StockControl />
                  </TabsContent>
                )}

                {/* Promo Codes Tab */}
                {canViewPromos && (
                  <TabsContent value="promos" className="space-y-4">
                    <PromoCodeManagement />
                  </TabsContent>
                )}

                {/* Seasonal Discounts Tab */}
                {canViewDiscounts && (
                  <TabsContent value="discounts" className="space-y-4">
                    <SeasonalDiscountManagement />
                  </TabsContent>
                )}

                {/* No Permissions Message */}
                {!canViewOrders && !canViewMeals && !canViewStock && !canViewPromos && !canViewDiscounts && (
                  <div className="text-center py-16">
                    <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-black mb-2">No Permissions</h3>
                    <p className="text-gray-500">You don't have access to any modules. Contact your administrator.</p>
                  </div>
                )}
              </Tabs>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
