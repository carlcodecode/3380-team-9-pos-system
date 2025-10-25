import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockOrders, mockMeals, mockPromotions } from '../../lib/mockData';
import { Navbar } from '../shared/Navbar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck,
  RefreshCw,
  Gift,
  Tag,
  Plus,
  Edit,
  Trash2,
  Percent,
  Calendar,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

// Mock seasonal discounts data
const mockSeasonalDiscounts = [
  {
    id: 'SD001',
    name: 'Summer Sale',
    description: 'Hot summer deals on selected fresh meals',
    discountPercent: 15,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    applicableMeals: ['001', '002', '004'],
    status: 'scheduled',
    createdBy: 'staff1',
  },
  {
    id: 'SD002',
    name: 'Winter Warmth',
    description: 'Comfort food at cozy prices',
    discountPercent: 20,
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    applicableMeals: ['003', '005', '006'],
    status: 'active',
    createdBy: 'staff1',
  },
];

export const StaffDashboard = () => {
  const { user } = useAuth();

  // State for dialogs
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [deletePromoDialogOpen, setDeletePromoDialogOpen] = useState(false);
  const [deleteDiscountDialogOpen, setDeleteDiscountDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  // Form states for promo codes
  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discount: '',
    expiryDate: '',
  });

  // Form states for seasonal discounts
  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    applicableMeals: [],
  });

  const todayOrders = {
    pending: mockOrders.filter((o) => o.status === 'pending').length,
    processing: mockOrders.filter((o) => o.status === 'processing').length,
    shipped: mockOrders.filter((o) => o.status === 'shipped').length,
    delivered: mockOrders.filter((o) => o.status === 'delivered').length,
  };

  const lowStockMeals = mockMeals.filter((m) => m.stock < 10);

  const handleAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount: '',
      expiryDate: '',
    });
    setPromoDialogOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      discount: promo.discount.toString(),
      expiryDate: promo.expiryDate,
    });
    setPromoDialogOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoForm.code || !promoForm.name || !promoForm.discount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const message = editingPromo 
      ? `Promo code "${promoForm.code}" updated successfully!`
      : `Promo code "${promoForm.code}" created successfully!`;
    
    toast.success(message);
    setPromoDialogOpen(false);
  };

  const handleDeletePromo = (promo) => {
    setPromoToDelete(promo);
    setDeletePromoDialogOpen(true);
  };

  const confirmDeletePromo = () => {
    toast.success(`Promo code "${promoToDelete?.code}" deleted successfully!`);
    setDeletePromoDialogOpen(false);
    setPromoToDelete(null);
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setDiscountForm({
      name: '',
      description: '',
      discountPercent: '',
      startDate: '',
      endDate: '',
      applicableMeals: [],
    });
    setDiscountDialogOpen(true);
  };

  const handleEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      name: discount.name,
      description: discount.description,
      discountPercent: discount.discountPercent.toString(),
      startDate: discount.startDate,
      endDate: discount.endDate,
      applicableMeals: discount.applicableMeals,
    });
    setDiscountDialogOpen(true);
  };

  const handleSaveDiscount = () => {
    if (!discountForm.name || !discountForm.discountPercent || !discountForm.startDate || !discountForm.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const message = editingDiscount
      ? `Seasonal discount "${discountForm.name}" updated successfully!`
      : `Seasonal discount "${discountForm.name}" created successfully!`;
    
    toast.success(message);
    setDiscountDialogOpen(false);
  };

  const handleDeleteDiscount = (discount) => {
    setDiscountToDelete(discount);
    setDeleteDiscountDialogOpen(true);
  };

  const confirmDeleteDiscount = () => {
    toast.success(`Seasonal discount "${discountToDelete?.name}" deleted successfully!`);
    setDeleteDiscountDialogOpen(false);
    setDiscountToDelete(null);
  };

  const toggleMealSelection = (mealId) => {
    setDiscountForm(prev => ({
      ...prev,
      applicableMeals: prev.applicableMeals.includes(mealId)
        ? prev.applicableMeals.filter(id => id !== mealId)
        : [...prev.applicableMeals, mealId]
    }));
  };

  const calculateDiscountedPrice = (meal) => {
    const activeDiscount = mockSeasonalDiscounts.find(
      d => d.status === 'active' && d.applicableMeals.includes(meal.id)
    );
    
    if (activeDiscount) {
      const discountedPrice = meal.price * (1 - activeDiscount.discountPercent / 100);
      return discountedPrice.toFixed(2);
    }
    
    return null;
  };

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
                {mockMeals.map((meal) => {
                  const discountedPrice = calculateDiscountedPrice(meal);
                  return (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="text-black mb-1">{meal.name}</div>
                        <div className="text-sm text-gray-500 mb-2">
                          {discountedPrice ? (
                            <>
                              <span className="line-through text-gray-400">${meal.price}</span>
                              <span className="ml-2 text-black">${discountedPrice}</span>
                              <Badge className="ml-2 bg-black text-white border-0 text-xs">
                                Discounted
                              </Badge>
                            </>
                          ) : (
                            <span>${meal.price}</span>
                          )}
                          {' • Stock: '}{meal.stock}
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
                  );
                })}
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

            {/* Promo Codes Tab */}
            <TabsContent value="promos" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-black mb-1">Promo Code Management</h3>
                  <p className="text-sm text-gray-500">Create and manage promotional codes for customers</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
                  onClick={handleAddPromo}
                >
                  <Plus className="w-4 h-4" />
                  Add Promo Code
                </Button>
              </div>

              <div className="space-y-3">
                {mockPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Gift className="w-5 h-5 text-black" />
                          <h4 className="text-black">{promo.name}</h4>
                          <Badge className={promo.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                            {promo.status}
                          </Badge>
                          <Badge className="bg-gray-100 text-black border-0">
                            {promo.discount}% OFF
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <code className="bg-white px-2 py-1 rounded border border-gray-200 text-black">
                              {promo.code}
                            </code>
                          </div>
                          <div className="text-gray-500">
                            Expires: {new Date(promo.expiryDate).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            Used: {promo.usageCount} times
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:bg-gray-100 rounded-lg gap-2"
                          onClick={() => handleEditPromo(promo)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg gap-2"
                          onClick={() => handleDeletePromo(promo)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mockPromotions.length === 0 && (
                <div className="text-center py-12">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No promo codes yet. Create your first one!</p>
                </div>
              )}
            </TabsContent>

            {/* Seasonal Discounts Tab */}
            <TabsContent value="discounts" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-black mb-1">Seasonal Discount Management</h3>
                  <p className="text-sm text-gray-500">Apply time-based discounts to selected meals</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
                  onClick={handleAddDiscount}
                >
                  <Plus className="w-4 h-4" />
                  Add Seasonal Discount
                </Button>
              </div>

              <div className="space-y-3">
                {mockSeasonalDiscounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Percent className="w-5 h-5 text-black" />
                          <h4 className="text-black">{discount.name}</h4>
                          <Badge className={
                            discount.status === 'active' 
                              ? 'bg-black text-white border-0' 
                              : discount.status === 'scheduled'
                              ? 'bg-gray-600 text-white border-0'
                              : 'bg-gray-300 text-black border-0'
                          }>
                            {discount.status}
                          </Badge>
                          <Badge className="bg-gray-100 text-black border-0">
                            {discount.discountPercent}% OFF
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{discount.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Applicable meals:</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {discount.applicableMeals.map(mealId => {
                                const meal = mockMeals.find(m => m.id === mealId);
                                return meal ? (
                                  <Badge key={mealId} className="bg-white border border-gray-200 text-black text-xs">
                                    {meal.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:bg-gray-100 rounded-lg gap-2"
                          onClick={() => handleEditDiscount(discount)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg gap-2"
                          onClick={() => handleDeleteDiscount(discount)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mockSeasonalDiscounts.length === 0 && (
                <div className="text-center py-12">
                  <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No seasonal discounts yet. Create your first one!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Promo Code Dialog */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Create promotional codes that will be displayed on the customer dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-code">Promo Code *</Label>
                <Input
                  id="promo-code"
                  placeholder="e.g., SUMMER25"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-name">Name *</Label>
                <Input
                  id="promo-name"
                  placeholder="e.g., Summer Sale"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({...promoForm, name: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-description">Description</Label>
              <Textarea
                id="promo-description"
                placeholder="Describe the promotion..."
                value={promoForm.description}
                onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                className="rounded-lg border-gray-200"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-discount">Discount % *</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  placeholder="e.g., 20"
                  value={promoForm.discount}
                  onChange={(e) => setPromoForm({...promoForm, discount: e.target.value})}
                  className="rounded-lg border-gray-200"
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-expiry">Expiry Date *</Label>
                <Input
                  id="promo-expiry"
                  type="date"
                  value={promoForm.expiryDate}
                  onChange={(e) => setPromoForm({...promoForm, expiryDate: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPromoDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePromo}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              {editingPromo ? 'Update' : 'Create'} Promo Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seasonal Discount Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingDiscount ? 'Edit Seasonal Discount' : 'Add New Seasonal Discount'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Create time-based discounts that automatically adjust meal prices
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-name">Discount Name *</Label>
                <Input
                  id="discount-name"
                  placeholder="e.g., Summer Sale"
                  value={discountForm.name}
                  onChange={(e) => setDiscountForm({...discountForm, name: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-percent">Discount % *</Label>
                <Input
                  id="discount-percent"
                  type="number"
                  placeholder="e.g., 15"
                  value={discountForm.discountPercent}
                  onChange={(e) => setDiscountForm({...discountForm, discountPercent: e.target.value})}
                  className="rounded-lg border-gray-200"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-description">Description</Label>
              <Textarea
                id="discount-description"
                placeholder="Describe the seasonal discount..."
                value={discountForm.description}
                onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                className="rounded-lg border-gray-200"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-start">Start Date *</Label>
                <Input
                  id="discount-start"
                  type="date"
                  value={discountForm.startDate}
                  onChange={(e) => setDiscountForm({...discountForm, startDate: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount-end">End Date *</Label>
                <Input
                  id="discount-end"
                  type="date"
                  value={discountForm.endDate}
                  onChange={(e) => setDiscountForm({...discountForm, endDate: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Applicable Meals</Label>
              <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {mockMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => toggleMealSelection(meal.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={discountForm.applicableMeals.includes(meal.id)}
                          onChange={() => toggleMealSelection(meal.id)}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <div className="text-sm text-black">{meal.name}</div>
                          <div className="text-xs text-gray-500">${meal.price}</div>
                        </div>
                      </div>
                      {discountForm.applicableMeals.includes(meal.id) && discountForm.discountPercent && (
                        <Badge className="bg-black text-white border-0 text-xs">
                          ${(meal.price * (1 - parseInt(discountForm.discountPercent) / 100)).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {discountForm.applicableMeals.length} meal(s) selected
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDiscountDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDiscount}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              {editingDiscount ? 'Update' : 'Create'} Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Promo Confirmation */}
      <AlertDialog open={deletePromoDialogOpen} onOpenChange={setDeletePromoDialogOpen}>
        <AlertDialogContent className="bg-white rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Delete Promo Code</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete the promo code "{promoToDelete?.code}"? 
              This action cannot be undone and customers will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePromo}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Discount Confirmation */}
      <AlertDialog open={deleteDiscountDialogOpen} onOpenChange={setDeleteDiscountDialogOpen}>
        <AlertDialogContent className="bg-white rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Delete Seasonal Discount</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete the seasonal discount "{discountToDelete?.name}"? 
              This will remove the discount from all applicable meals and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDiscount}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
