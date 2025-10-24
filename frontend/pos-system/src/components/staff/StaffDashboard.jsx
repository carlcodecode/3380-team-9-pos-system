import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrders, mockMeals } from '../../lib/mockData';
import { Navbar } from '../shared/Navbar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';

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
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-gray-200">
              <TabsTrigger value="orders" className="data-[state=active]:bg-white">
                Orders
              </TabsTrigger>
              <TabsTrigger value="meals" className="data-[state=active]:bg-white">
                Meal Management
              </TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-white">
                Stock Control
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black">Order Processing</h3>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Process All
                </Button>
              </div>
              <div className="space-y-3">
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-black">Order #{order.id}</div>
                        <Badge
                          className={
                            order.status === 'delivered'
                              ? 'bg-black text-white border-0'
                              : order.status === 'processing'
                              ? 'bg-gray-600 text-white border-0'
                              : order.status === 'shipped'
                              ? 'bg-gray-800 text-white border-0'
                              : 'bg-gray-300 text-black border-0'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items.length} items • ${order.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-200 hover:bg-gray-100 rounded-lg"
                      >
                        View
                      </Button>
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                        >
                          Process
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Meals Tab */}
            <TabsContent value="meals" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black">Meal Catalog</h3>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Add New Meal
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mockMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <div className="text-black mb-1">{meal.name}</div>
                      <div className="text-sm text-gray-500 mb-2">
                        ${meal.price} • Stock: {meal.stock}
                      </div>
                      <div className="flex gap-1.5">
                        {meal.type.slice(0, 2).map((type) => (
                          <Badge
                            key={type}
                            variant="secondary"
                            className="text-xs bg-gray-100 text-black border-0"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-200 hover:bg-gray-100 rounded-lg"
                      >
                        Edit
                      </Button>
                      <Button
                        variant={meal.status === 'available' ? 'default' : 'secondary'}
                        size="sm"
                        className={
                          meal.status === 'available'
                            ? 'bg-black hover:bg-black text-white rounded-lg'
                            : 'bg-gray-200 text-black rounded-lg'
                        }
                      >
                        {meal.status === 'available' ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Stock Tab */}
            <TabsContent value="stock" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-black">Inventory Management</h3>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Restock All Low Items
                </Button>
              </div>
              <div className="space-y-3">
                {mockMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <div className="text-black mb-3">{meal.name}</div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-500">Stock Level</span>
                            <span className="text-black">
                              {meal.stock} / 100 units
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                meal.stock < 10
                                  ? 'bg-black'
                                  : meal.stock < 30
                                  ? 'bg-gray-600'
                                  : 'bg-gray-400'
                              }`}
                              style={{ width: `${meal.stock}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`ml-4 rounded-lg btn-glossy ${
                        meal.stock < 10
                          ? 'bg-black hover:bg-black text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                    >
                      Restock
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};