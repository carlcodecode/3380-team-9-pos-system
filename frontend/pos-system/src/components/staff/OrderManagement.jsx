import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Package, Calendar, DollarSign, MapPin, User, RefreshCw, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export const OrderManagement = ({ onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        return 'bg-black text-white border-0';
      case 0: // processing
        return 'bg-black text-white border-0';
      case 2: // shipped
        return 'bg-black text-white border-0';
      case 3: // refunded
        return 'bg-black text-white border-0';
      default:
        return 'bg-gray-300 text-black border-0';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 0: return 'Processing';
      case 1: return 'Refunded';
      case 2: return 'Shipped';
      case 3: return 'Delivered';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button (only show for admin) */}
      {isAdmin && onNavigate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h2 className="text-black">Order Management</h2>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-black">Order Processing</h3>
          <div className="flex items-center gap-2">
            {/* Search by Order Number */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 bg-white border-gray-200 focus:border-black rounded-lg h-9"
              />
            </div>
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
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-black mb-3">No orders</h3>
          <p className="text-gray-500">No orders available at the moment!</p>
        </div>
      ) : (
        (() => {
          const filteredOrders = orders
            .filter((order) => {
              // Filter by order number if search query exists
              if (searchQuery.trim() === '') return true;
              return order.id.toString().includes(searchQuery.trim());
            })
            .sort((a, b) => {
              // Sort: Processing (0) and Shipped (2) first, then Delivered (1) and Refunded (3) at bottom
              const aPriority = (a.orderStatus === 0 || a.orderStatus === 2) ? 0 : 1;
              const bPriority = (b.orderStatus === 0 || b.orderStatus === 2) ? 0 : 1;
              if (aPriority !== bPriority) return aPriority - bPriority;
              // Within same priority, sort by order ID (newest first)
              return b.id - a.id;
            });

          if (filteredOrders.length === 0 && searchQuery.trim() !== '') {
            return (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-black mb-3">No orders found</h3>
                <p className="text-gray-500">No orders match "#{searchQuery}"</p>
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  className="mt-4 border-gray-200 hover:bg-gray-100 rounded-lg"
                >
                  Clear Search
                </Button>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
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
                    onClick={async () => {
                      try {
                        setUpdating(true);
                        await updateOrderStatus(order.id, 2); // Update to shipped directly
                        toast.success(`Order #${order.id} marked as shipped`);
                        await fetchOrders(); // Refresh the list
                      } catch (error) {
                        console.error('Failed to update order status:', error);
                        toast.error('Failed to update order status');
                      } finally {
                        setUpdating(false);
                      }
                    }}
                    disabled={updating}
                    className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                  >
                    {updating ? 'Processing...' : 'Process'}
                  </Button>
                )}
              </div>
            </div>
          ))}
            </div>
          );
        })()
      )}

      {/* Order View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="order-items-scroll px-1">
          <DialogHeader>
            <DialogTitle className="text-black text-xl">Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge className={getStatusBadgeClass(selectedOrder?.orderStatus || 0)}>
                {getStatusText(selectedOrder?.orderStatus || 0)}
              </Badge>
              <span className="text-gray-500">•</span>
              <span>{selectedOrder?.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : ''}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-2">
              {/* Customer & Address Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Customer</div>
                    <div className="text-black font-medium">{selectedOrder.customerName}</div>
                    <div className="text-sm text-gray-500">{selectedOrder.customerEmail}</div>
                  </div>
                  {selectedOrder.shippingAddress && (selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.city) && (
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery Address</div>
                      <div className="text-sm text-gray-700">
                        {selectedOrder.shippingAddress.street && `${selectedOrder.shippingAddress.street}`}
                        {selectedOrder.shippingAddress.city && `, ${selectedOrder.shippingAddress.city}`}
                        {selectedOrder.shippingAddress.state && `, ${selectedOrder.shippingAddress.state}`}
                        {selectedOrder.shippingAddress.zipcode && ` ${selectedOrder.shippingAddress.zipcode}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Order Items Section */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Order Items ({selectedOrder.items.length})</div>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-black">{item.mealName}</div>
                          <div className="text-xs text-gray-500">Quantity: {item.quantity} × ${item.priceAtSale.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-black">${item.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Order Summary</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-black">${selectedOrder.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="text-black">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="text-black font-semibold">Total</span>
                    <span className="text-xl font-bold text-black">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              {selectedOrder.notes && (
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Customer Notes</div>
                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200 italic">
                    "{selectedOrder.notes}"
                  </div>
                </div>
              )}

              {/* Update Status Section */}
              <div className="pt-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-3">Update Status</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedStatus(0)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedStatus === 0
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-black">Processing</div>
                    <div className="text-xs text-gray-500">Being prepared</div>
                  </button>

                  <button
                    onClick={() => setSelectedStatus(2)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedStatus === 2
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-black">Shipped</div>
                    <div className="text-xs text-gray-500">On the way</div>
                  </button>

                  <button
                    onClick={() => setSelectedStatus(3)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedStatus === 3
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-black">Delivered</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </button>

                  <button
                    onClick={() => setSelectedStatus(1)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedStatus === 1
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-black">Refunded</div>
                    <div className="text-xs text-gray-500">Cancelled</div>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-gray-200 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
              disabled={updating || selectedStatus === undefined || selectedStatus === selectedOrder?.orderStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};
