import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockOrders } from '../../lib/mockData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Package, Calendar, DollarSign, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

export const OrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      toast.error('Please select a status');
      return;
    }

    // Here you would typically call an API to update the order status
    // For now, we'll just show a success message
    toast.success(`Order #${selectedOrder.id} status updated to ${selectedStatus}`);
    setIsViewDialogOpen(false);
    setSelectedOrder(null);
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
                <Badge className={getStatusBadgeClass(order.status)}>
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
                onClick={() => handleViewOrder(order)}
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
                  <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              {/* Order Date */}
              <div className="space-y-2">
                <Label className="text-black">Order Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <Label className="text-black">Items</Label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-black">{item.meal?.name || item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-black">
                        ${((item.meal?.price || item.price) * item.quantity).toFixed(2)}
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
                  <span className="text-lg font-semibold text-black">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <Label className="text-black">Customer</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{selectedOrder.customer}</span>
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
              disabled={!selectedStatus || selectedStatus === selectedOrder?.status}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
