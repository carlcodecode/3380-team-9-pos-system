import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Package, Calendar, DollarSign, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
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

  const getStatusCode = (statusText) => {
    switch(statusText) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return 4;
      case 'refunded': return 5;
      default: return 0;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(getStatusText(order.order_status));
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await api.updateOrderStatus(selectedOrder.order_id, {
        order_status: getStatusCode(selectedStatus)
      });

      toast.success(`Order #${selectedOrder.order_id} status updated to ${selectedStatus}`);
      setIsViewDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders list
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-600 text-white border-0';
      case 'processing':
        return 'bg-blue-600 text-white border-0';
      case 'shipped':
        return 'bg-gray-800 text-white border-0';
      case 'pending':
        return 'bg-yellow-600 text-white border-0';
      case 'refunded':
        return 'bg-red-600 text-white border-0';
      default:
        return 'bg-gray-300 text-black border-0';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-black">Order Processing</h3>
        <Button 
          size="sm" 
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
          onClick={fetchOrders}
        >
          Refresh Orders
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = getStatusText(order.order_status);
            return (
              <div
                key={order.order_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-black">Order #{order.order_id}</div>
                    <Badge className={getStatusBadgeClass(status)}>
                      {status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items.length} items • ${(order.total / 100).toFixed(2)} • {order.customer}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-200 hover:bg-gray-100 rounded-lg"
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </Button>
                  {status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                      onClick={() => {
                        handleViewOrder(order);
                        setSelectedStatus('processing');
                      }}
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-black">Order Details - #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              View and update order status
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Order Status */}
              <div className="space-y-2">
                <Label className="text-black">Current Status</Label>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <Badge className={getStatusBadgeClass(getStatusText(selectedOrder.order_status))}>
                    {getStatusText(selectedOrder.order_status)}
                  </Badge>
                </div>
              </div>

              {/* Order Date */}
              <div className="space-y-2">
                <Label className="text-black">Order Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{new Date(selectedOrder.order_date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <Label className="text-black">Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-black">{item.meal?.meal_name || item.meal?.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-black">
                        ${((item.meal?.price || item.price_at_sale) * item.quantity / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="space-y-2">
                <Label className="text-black">Total Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold text-black">${(selectedOrder.total / 100).toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <Label className="text-black">Customer</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedOrder.customer}</span>
                  </div>
                  {selectedOrder.customer_phone && (
                    <div className="text-sm text-gray-500 ml-6">{selectedOrder.customer_phone}</div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div className="space-y-2">
                  <Label className="text-black">Delivery Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{selectedOrder.address}</span>
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Label className="text-black">Update Order Status</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="orderStatus"
                      value="processing"
                      checked={selectedStatus === 'processing'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-black"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">Processing</div>
                      <div className="text-xs text-gray-500">Order is being prepared</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="orderStatus"
                      value="delivered"
                      checked={selectedStatus === 'delivered'}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-4 h-4 text-black"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">Delivered</div>
                      <div className="text-xs text-gray-500">Order has been delivered to customer</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              className="bg-black hover:bg-gray-800 text-white"
              disabled={!selectedStatus || selectedStatus === getStatusText(selectedOrder?.order_status)}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
