import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrders } from '../../lib/mockData';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Package, RefreshCw, Eye, MapPin, Clock } from 'lucide-react';
import { motion } from 'motion/react';
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

  const userOrders = mockOrders.filter((order) => order.customerId === user?.id);

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

            {userOrders.length === 0 ? (
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
                {userOrders
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border border-gray-200 p-6 card-glow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-black">Order #{order.id}</h3>
                            <Badge className={`${getStatusColor(order.status)} border-0 flex items-center gap-1.5`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(order.date).toLocaleDateString()}
                            </span>
                            {order.deliveryDate && (
                              <span className="flex items-center gap-1.5">
                                <Package className="w-4 h-4" />
                                Delivered {new Date(order.deliveryDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {order.address}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right md:mr-4">
                            <p className="text-sm text-gray-500 mb-1">{order.items.length} items</p>
                            <p className="text-xl text-black">${order.total.toFixed(2)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              variant="outline"
                              size="sm"
                              className="border-gray-200 hover:bg-gray-100 rounded-lg"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              onClick={() => onReorder(order.items)}
                              size="sm"
                              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-black">Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(selectedOrder?.status || '')} border-0`}>
                  {selectedOrder?.status}
                </Badge>
                <span className="text-gray-500">• {selectedOrder?.date}</span>
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
                      <p className="text-black">{item.meal.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-black">${(item.meal.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="text-black mb-4">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="text-black">{selectedOrder?.address}</span>
                </div>
                {selectedOrder?.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking:</span>
                    <span className="text-black">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className="text-black">{selectedOrder?.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-black">Total</span>
                <span className="text-2xl text-black">${selectedOrder?.total.toFixed(2)}</span>
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