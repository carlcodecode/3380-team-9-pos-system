import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomerOrders } from '../../services/api';
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomerOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: // delivered
        return 'bg-black text-white border-black';
      case 0: // processing
        return 'bg-gray-600 text-white border-gray-600';
      case 2: // shipped
        return 'bg-gray-800 text-white border-gray-800';
      case 3: // refunded
        return 'bg-gray-400 text-black border-gray-400';
      default:
        return 'bg-gray-100 text-black border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'processing';
      case 1: return 'delivered';
      case 2: return 'shipped';
      case 3: return 'refunded';
      default: return 'unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: // delivered
      case 2: // shipped
        return <Package className="w-4 h-4" />;
      case 0: // processing
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
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-black mb-3">Failed to load orders</h3>
                <p className="text-gray-500 mb-8">{error}</p>
                <Button
                  onClick={fetchOrders}
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Try Again
                </Button>
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
                  const statusText = getStatusText(order.orderStatus);
                  const shippingAddress = order.shippingAddress 
                    ? `${order.shippingAddress.street || ''} ${order.shippingAddress.city || ''}`.trim() || 'No address'
                    : 'No address';
                  
                  return (
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
                            <Badge className={`${getStatusColor(order.orderStatus)} border-0 flex items-center gap-1.5`}>
                              {getStatusIcon(order.orderStatus)}
                              {statusText}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            {order.deliveryDate && (
                              <span className="flex items-center gap-1.5">
                                <Package className="w-4 h-4" />
                                Delivered {new Date(order.deliveryDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" />
                              {shippingAddress}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right md:mr-4">
                            <p className="text-sm text-gray-500 mb-1">2 items</p>
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
                              onClick={() => onReorder([])}
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
            <DialogTitle className="text-black">Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(selectedOrder?.orderStatus || 0)} border-0`}>
                  {getStatusText(selectedOrder?.orderStatus || 0)}
                </Badge>
                <span className="text-gray-500">• {selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : ''}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Order Summary */}
            <div>
              <h3 className="text-black mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-black">${selectedOrder?.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Tax:</span>
                  <span className="text-black">${selectedOrder?.tax.toFixed(2)}</span>
                </div>
                {selectedOrder?.discount > 0 && (
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-500">Discount:</span>
                    <span className="text-black">-${selectedOrder?.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="text-black mb-4">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                {selectedOrder?.shippingAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span className="text-black text-right">
                      {selectedOrder.shippingAddress.street && `${selectedOrder.shippingAddress.street}, `}
                      {selectedOrder.shippingAddress.city && `${selectedOrder.shippingAddress.city}, `}
                      {selectedOrder.shippingAddress.state && `${selectedOrder.shippingAddress.state} `}
                      {selectedOrder.shippingAddress.zipcode}
                    </span>
                  </div>
                )}
                {selectedOrder?.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tracking:</span>
                    <span className="text-black">{selectedOrder.trackingNumber}</span>
                  </div>
                )}
                {selectedOrder?.notes && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Notes:</span>
                    <span className="text-black text-right">{selectedOrder.notes}</span>
                  </div>
                )}
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
                onReorder([]);
                setSelectedOrder(null);
              }}
              className="w-full bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reorder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};