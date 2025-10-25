import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import { Percent, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockMeals } from '../../lib/mockData';

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

export const SeasonalDiscountManagement = () => {
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [deleteDiscountDialogOpen, setDeleteDiscountDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  const [discountForm, setDiscountForm] = useState({
    name: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    applicableMeals: [],
  });

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

  return (
    <>
      <div className="space-y-4">
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
      </div>

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
    </>
  );
};
