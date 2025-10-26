import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export const SeasonalDiscountForm = ({ open, onClose, onSave, discount }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercent: '',
    startDate: '',
    endDate: '',
    applicableMeals: [],
  });

  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load meals + prefill for edit
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await api.getAllMeals();
        console.log('Fetched meals:', data);
        setMeals(data.meals || data ||  []);
      } catch (err) {
        toast.error('Failed to load meals');
      } finally {
        setLoadingMeals(false);
      }
    };
    fetchMeals();

    if (discount) {
      setFormData({
        name: discount.event_name || '',
        description: discount.event_description || '',
        discountPercent: discount.meals?.[0]?.discount_rate?.toString() || '',
        startDate: discount.event_start?.split('T')[0] || '',
        endDate: discount.event_end?.split('T')[0] || '',
        applicableMeals: discount.meals?.map(m => m.meal_ref.toString()) || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discountPercent: '',
        startDate: '',
        endDate: '',
        applicableMeals: [],
      });
    }
  }, [discount]);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        discountPercent: '',
        startDate: '',
        endDate: '',
        applicableMeals: [],
      });
    }
  }, [open]);

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddMeal = (mealId) => {
    if (mealId && !formData.applicableMeals.includes(mealId)) {
      setFormData((prev) => ({
        ...prev,
        applicableMeals: [...prev.applicableMeals, mealId],
      }));
    }
  };

  const handleRemoveMeal = (mealId) => {
    setFormData((prev) => ({
      ...prev,
      applicableMeals: prev.applicableMeals.filter(id => id !== mealId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.discountPercent || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.applicableMeals.length === 0) {
      toast.error('Please select at least one meal');
      return;
    }

    const payload = {
      event_name: formData.name,
      event_description: formData.description,
      event_start: formData.startDate,
      event_end: formData.endDate,
      meals: formData.applicableMeals.map(mealId => ({
        meal_ref: parseInt(mealId),
        discount_rate: parseInt(formData.discountPercent),
      })),
    };

    try {
      setSaving(true);
      if (discount) {
        await api.updateSaleEvent(discount.sale_event_id, payload);
        toast.success(`Discount "${formData.name}" updated successfully`);
      } else {
        await api.createSaleEvent(payload);
        toast.success(`Discount "${formData.name}" created successfully`);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-none !w-[60vw] sm:!w-[60vw] md:!w-[60vw] lg:!w-[60vw] xl:!w-[60vw] rounded-lg"
        style={{ width: '60vw', maxWidth: '60vw' }}
      >
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">
            {discount ? 'Edit Seasonal Discount' : 'Add New Seasonal Discount'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 px-3">
          {/* Name & Percent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label className="block mb-1 text-gray-700">Discount Name *</Label>
              <Input
                name="name"
                className="w-full"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label className="block mb-1 text-gray-700">Discount % *</Label>
              <Input
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                className="w-full"
                value={formData.discountPercent}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="block mb-1 text-gray-700">Description</Label>
            <Textarea
              name="description"
              className="w-full"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Label className="block mb-1 text-gray-700">Start Date *</Label>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label className="block mb-1 text-gray-700">End Date *</Label>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Meal Selector */}
          <div>
            <Label className="block mb-1 text-gray-700">Applicable Meals *</Label>
            {loadingMeals ? (
              <p className="text-gray-500 text-sm mt-2">Loading meals...</p>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                onChange={(e) => handleAddMeal(e.target.value)}
                value=""
              >
                <option value="" disabled>Select a meal...</option>
                {meals.map((meal) => (
                  <option key={meal.meal_id} value={meal.meal_id}>
                    {meal.meal_name} : ${(meal.price / 100).toFixed}
                  </option>
                ))}
              </select>
            )}

            {/* Selected Meals */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formData.applicableMeals.map((mealId) => {
                const meal = meals.find((m) => m.meal_id.toString() === mealId);
                return (
                  <Badge
                    key={mealId}
                    className="bg-black text-white flex items-center gap-1 pr-2 pl-3 rounded-lg"
                  >
                    {meal ? meal.meal_name : `Meal ${mealId}`}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-gray-300 ml-1"
                      onClick={() => handleRemoveMeal(mealId)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="mt-8 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white rounded-lg hover:bg-black"
              disabled={saving}
            >
              {saving ? 'Saving...' : discount ? 'Save Changes' : 'Create Discount'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
