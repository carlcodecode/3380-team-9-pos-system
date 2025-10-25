import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export const MealForm = ({ open, onClose, onSave, meal }) => {
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_description: '',
    img_url: '',
    meal_status: 'active',
    start_date: '',
    end_date: '',
    price: '',
    cost_to_make: '',
    meal_types: [],
  });

  const [mealTypesInput, setMealTypesInput] = useState('');

  useEffect(() => {
    if (meal) {

      const formatDate = (date) => {
      if (!date) return '';
      return date.split('T')[0]; // keep only YYYY-MM-DD
    };

      setFormData({
        meal_name: meal.meal_name || '',
        meal_description: meal.meal_description || '',
        img_url: meal.img_url || '',
        meal_status: meal.meal_status === 1 ? 'active' : 'inactive',
        start_date: formatDate(meal.start_date) || '',
        end_date: formatDate(meal.end_date) || '',
        price: meal.price || '',
        cost_to_make: meal.cost_to_make || '',
        meal_types: meal.meal_types || [],
        meal_id: meal.meal_id,
      });
      setMealTypesInput(meal.meal_types?.join(', ') || '');
    } else {
      setFormData({
        meal_name: '',
        meal_description: '',
        img_url: '',
        meal_status: 'active',
        start_date: '',
        end_date: '',
        price: '',
        cost_to_make: '',
        meal_types: [],
      });
      setMealTypesInput('');
    }
  }, [meal]);

  useEffect(() => {
    if (!open) {
      setFormData({
        meal_name: '',
        meal_description: '',
        img_url: '',
        meal_status: 'active',
        start_date: '',
        end_date: '',
        price: '',
        cost_to_make: '',
        meal_types: [],
      });
      setMealTypesInput('');
    }
  }, [open]);

  const handleMealTypesChange = (e) => setMealTypesInput(e.target.value);
  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.meal_name.trim() ||
      !formData.meal_description.trim() ||
      !formData.img_url.trim() ||
      !formData.start_date ||
      !formData.end_date ||
      formData.price === '' ||
      formData.cost_to_make === ''
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        meal_types: mealTypesInput.split(',').map((t) => t.trim()).filter(Boolean),
        price: parseFloat(formData.price),
        cost_to_make: parseFloat(formData.cost_to_make),
      };

      await onSave(payload);
      toast.success(meal ? 'Meal updated successfully' : 'Meal created successfully');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save meal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 mt-4">
            {/* Meal name + description */}
            <div>
              <Label className="block mb-1 text-gray-700">Meal Name *</Label>
              <Input name="meal_name" value={formData.meal_name} onChange={handleInputChange} />
            </div>

            <div>
              <Label className="block mb-1 text-gray-700">Description *</Label>
              <Textarea name="meal_description" value={formData.meal_description} onChange={handleInputChange} />
            </div>

            <div>
              <Label className="block mb-1 text-gray-700">Image Url *</Label>
              <Input name="img_url" value={formData.img_url} onChange={handleInputChange} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label className="block mb-1 text-gray-700">Start Date *</Label>
                <Input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
              </div>
              <div>
                <Label className="block mb-1 text-gray-700">End Date *</Label>
                <Input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label className="block mb-1 text-gray-700">Price (cents)*</Label>
                <Input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" />
              </div>
              <div>
                <Label className="block mb-1 text-gray-700">Cost to Make (cents)*</Label>
                <Input type="number" name="cost_to_make" value={formData.cost_to_make} onChange={handleInputChange} min="0" />
              </div>
            </div>

            {/* Meal Types */}
            <div>
              <Label className="block mb-1 text-gray-700">Meal Types (comma-separated)</Label>
              <Input placeholder="e.g. Vegan, Gluten-Free" value={mealTypesInput} onChange={handleMealTypesChange} />
            </div>

            {/* Status */}
            <div>
              <Label className="block mb-1 text-gray-700">Status</Label>
              <select name="meal_status" value={formData.meal_status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-8 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg border-gray-200">
              Cancel
            </Button>
            <Button type="submit" className="bg-black text-white rounded-lg hover:bg-black">
              {meal ? 'Save Changes' : 'Add Meal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
