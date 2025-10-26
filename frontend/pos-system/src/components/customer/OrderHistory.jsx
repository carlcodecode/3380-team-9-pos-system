import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Package, RefreshCw, Eye, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import * as api from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export const OrderHistory = ({ onBack, onReorder }) => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load order history');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (statusCode) => {
    switch(statusCode) {
      case 0: return 'pending';
      case 1: return 'processing';
      case 2: return 'shipped';
      case 3: return 'delivered';
      case 4: return 'cancelled';
      case 5: return 'refunded';
      default: return 'unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-black text-white border-black';
      case 'processing':
        return 'bg-gray-600 text-white border-gray-600';
      case 'shipped':
        return 'bg-gray-800 text-white border-gray-800';
      case 'refunded':
        return 'bg-gray-400 text-black border-gray-400';
      default:
        return 'bg-gray-100 text-black border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'shipped':
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6">
          <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-8"
          >
            <h1 className="text-black mb-8">Order History</h1>

            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-500">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-black mb-3">No orders yet</h3>
                <p className="text-gray-500 mb-8">Start your healthy eating journey today!</p>
                <Button
                  onClick={onBack}
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Browse Meals
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = getStatusText(order.order_status);
                  return (
                    <motion.div
                      key={order.order_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-6 card-glow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-black">Order #{order.order_id}</h3>
                            <Badge className={`${getStatusColor(status)} border-0 flex items-center gap-1.5`}>
                              {getStatusIcon(status)}
                              {status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(order.order_date).toLocaleDateString()}
                            </span>
                            {order.shipping_street && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {order.shipping_city}, {order.shipping_state_code}
                              </span>
                            )}
                            <span className="text-black">${(order.total / 100).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="border-gray-200 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {(status === 'delivered' || status === 'cancelled') && (
                            <Button
                              size="sm"
                              onClick={() => onReorder(order.items)}
                              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 text-sm text-gray-600">
                            {item.meal.meal_name} x {item.quantity}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex-shrink-0 text-sm text-gray-400">
                            +{order.items.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">Order #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(getStatusText(selectedOrder?.order_status || 0))} border-0`}>
                  {getStatusText(selectedOrder?.order_status || 0)}
                </Badge>
                <span className="text-gray-500">• {selectedOrder?.order_date}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Items */}
            <div>
              <h3 className="text-black mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder?.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-black">{item.meal.meal_name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-black">${((item.meal.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="text-black mb-4">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                {selectedOrder?.shipping_street && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span className="text-black">
                      {selectedOrder.shipping_street}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state_code} {selectedOrder.shipping_zipcode}
                    </span>
                  </div>
                )}
                {selectedOrder?.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking:</span>
                    <span className="text-black">{selectedOrder.tracking_number}</span>
                  </div>
                )}
                {selectedOrder?.payment_type !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment:</span>
                    <span className="text-black">
                      {selectedOrder.payment_type === 0 ? 'Credit Card' : 
                       selectedOrder.payment_type === 1 ? 'Debit Card' :
                       selectedOrder.payment_type === 2 ? 'Apple Pay' : 'Google Pay'}
                      {selectedOrder.last_four && ` •••• ${selectedOrder.last_four}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${((selectedOrder?.unit_price || 0) / 100).toFixed(2)}</span>
                </div>
                {selectedOrder?.discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span>Discount</span>
                    <span>-${((selectedOrder.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>${((selectedOrder?.tax || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-black font-medium">Total</span>
                  <span className="text-2xl text-black">${((selectedOrder?.total || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                onReorder(selectedOrder?.items || []);
                setSelectedOrder(null);
              }}
              className="w-full bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reorder These Items
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};