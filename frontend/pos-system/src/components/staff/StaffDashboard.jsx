import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrders, mockMeals } from '../../lib/mockData';
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
} from 'lucide-react';
import { motion } from 'motion/react';

// Import the new component modules
import { OrderManagement } from './OrderManagement';
import { MealManagement } from './MealManagement';
import { StockControl } from './StockControl';
import { PromoCodeManagement } from './PromoCodeManagement';
import { SeasonalDiscountManagement } from './SeasonalDiscountManagement';

export const StaffDashboard = () => {
  const { user } = useAuth();

  const todayOrders = {
    pending: mockOrders.filter((o) => o.status === 'pending').length,
    processing: mockOrders.filter((o) => o.status === 'processing').length,
    shipped: mockOrders.filter((o) => o.status === 'shipped').length,
    delivered: mockOrders.filter((o) => o.status === 'delivered').length,
  };

  const lowStockMeals = mockMeals.filter((m) => m.stock < 10);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-black mb-2">Staff Dashboard</h1>
            <p className="text-gray-500">Operations and inventory management</p>
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
              <Clock className="w-6 h-6 text-black" />
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <div className="text-3xl text-black">{todayOrders.pending}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
            <div className="flex items-center gap-3 mb-3">
              <RefreshCw className="w-6 h-6 text-black" />
              <span className="text-sm text-gray-500">Processing</span>
            </div>
            <div className="text-3xl text-black">{todayOrders.processing}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-6 h-6 text-black" />
              <span className="text-sm text-gray-500">Shipped</span>
            </div>
            <div className="text-3xl text-black">{todayOrders.shipped}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 card-glow">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-black" />
              <span className="text-sm text-gray-500">Delivered</span>
            </div>
            <div className="text-3xl text-black">{todayOrders.delivered}</div>
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        {lowStockMeals.length > 0 && (
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
                    key={meal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <div className="text-black mb-1">{meal.name}</div>
                      <div className="text-sm text-gray-500">
                        Only {meal.stock} units remaining
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                    >
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-8"
        >
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="w-full grid grid-cols-5 bg-gray-100 border-gray-200 h-auto">
              <TabsTrigger value="orders" className="data-[state=active]:bg-white">
                Orders
              </TabsTrigger>
              <TabsTrigger value="meals" className="data-[state=active]:bg-white">
                Meal Management
              </TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white">
                Stock Control
              </TabsTrigger>
              <TabsTrigger value="promos" className="data-[state=active]:bg-white flex items-center justify-center">
                <Gift className="w-4 h-4 mr-2" />
                Promo Codes
              </TabsTrigger>
              <TabsTrigger value="discounts" className="data-[state=active]:bg-white flex items-center justify-center">
                <Percent className="w-4 h-4 mr-2" />
                Seasonal Discounts
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <OrderManagement />
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals" className="space-y-4">
              <MealManagement />
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-4">
              <StockControl />
            </TabsContent>

            {/* Promo Codes Tab */}
            <TabsContent value="promos" className="space-y-4">
              <PromoCodeManagement />
            </TabsContent>

            {/* Seasonal Discounts Tab */}
            <TabsContent value="discounts" className="space-y-4">
              <SeasonalDiscountManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};
