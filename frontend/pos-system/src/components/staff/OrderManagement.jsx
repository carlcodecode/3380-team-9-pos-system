import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Package, Calendar, DollarSign, MapPin, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrders();
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.orderStatus);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === undefined || selectedStatus === '') {
      toast.error('Please select a status');
      return;
    }

    if (selectedStatus === selectedOrder.orderStatus) {
      toast.error('Status is already set to this value');
      return;
    }

    try {
      setUpdating(true);
      await updateOrderStatus(selectedOrder.id, selectedStatus);
      toast.success(`Order #${selectedOrder.id} status updated successfully`);
      
      // Refresh orders list
      await fetchOrders();
      
      setIsViewDialogOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 1: // delivered
        return 'bg-green-600 text-white border-0';
      case 0: // processing
        return 'bg-blue-600 text-white border-0';
      case 2: // shipped
        return 'bg-gray-800 text-white border-0';
      case 3: // refunded
        return 'bg-red-600 text-white border-0';
      default:
        return 'bg-gray-300 text-black border-0';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 0: return 'Processing';
      case 1: return 'Delivered';
      case 2: return 'Shipped';
      case 3: return 'Refunded';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-black">Order Processing</h3>
        <Button 
          size="sm" 
          onClick={fetchOrders}
          disabled={loading}
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500">Loading orders...</p>
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
      ) : orders.filter(order => order.orderStatus !== 1 && order.orderStatus !== 3).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-black mb-3">No pending orders</h3>
          <p className="text-gray-500">All orders have been processed!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders
            .filter(order => order.orderStatus !== 1 && order.orderStatus !== 3) // Filter out Delivered (1) and Refunded (3)
            .map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-black">Order #{order.id}</div>
                  <Badge className={getStatusBadgeClass(order.orderStatus)}>
                    {getStatusText(order.orderStatus)}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {order.customerName} • ${order.total.toFixed(2)}
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
                {order.orderStatus === 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedOrder(order);
                      setSelectedStatus(2); // Set to shipped
                      handleUpdateStatus();
                    }}
                    className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                  >
                    Process
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-black">Order Details - #{selectedOrder?.id}</DialogTitle>
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
                  <Badge className={getStatusBadgeClass(selectedOrder.orderStatus)}>
                    {getStatusText(selectedOrder.orderStatus)}
                  </Badge>
                </div>
              </div>

              {/* Order Date */}
              <div className="space-y-2">
                <Label className="text-black">Order Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {new Date(selectedOrder.orderDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Order Breakdown */}
              <div className="space-y-2">
                <Label className="text-black">Order Breakdown</Label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500">Subtotal:</span>
                    <span className="text-sm font-medium text-black">${selectedOrder.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-500">Tax:</span>
                    <span className="text-sm font-medium text-black">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="text-sm font-medium text-black">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="space-y-2">
                <Label className="text-black">Total Amount</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-lg font-semibold text-black">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <Label className="text-black">Customer</Label>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedOrder.customerName}</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">{selectedOrder.customerEmail}</div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.shippingAddress && (selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.city) && (
                <div className="space-y-2">
                  <Label className="text-black">Delivery Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      {selectedOrder.shippingAddress.street && `${selectedOrder.shippingAddress.street}, `}
                      {selectedOrder.shippingAddress.city && `${selectedOrder.shippingAddress.city}, `}
                      {selectedOrder.shippingAddress.state && `${selectedOrder.shippingAddress.state} `}
                      {selectedOrder.shippingAddress.zipcode}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <Label className="text-black">Customer Notes</Label>
                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedOrder.notes}
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
                      value="0"
                      checked={selectedStatus === 0}
                      onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
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
                      value="2"
                      checked={selectedStatus === 2}
                      onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
                      className="w-4 h-4 text-black"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">Shipped</div>
                      <div className="text-xs text-gray-500">Order has been shipped</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="orderStatus"
                      value="1"
                      checked={selectedStatus === 1}
                      onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
                      className="w-4 h-4 text-black"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">Delivered</div>
                      <div className="text-xs text-gray-500">Order has been delivered to customer</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="orderStatus"
                      value="3"
                      checked={selectedStatus === 3}
                      onChange={(e) => setSelectedStatus(parseInt(e.target.value))}
                      className="w-4 h-4 text-black"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-black">Refunded</div>
                      <div className="text-xs text-gray-500">Order has been refunded</div>
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
              disabled={updating || selectedStatus === undefined || selectedStatus === selectedOrder?.orderStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
