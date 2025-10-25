import React, { useState } from 'react';
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

export const MealForm = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    meal_name: '',
    meal_description: '',
    meal_status: 'active',
    start_date: '',
    end_date: '',
    price: '',
    cost_to_make: '',
    meal_types: [],
  });

   const [mealTypesInput, setMealTypesInput] = useState('');
   const handleMealTypesChange = (e) => {
    setMealTypesInput(e.target.value);
  };

  // Handle generic text/number inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle comma-separated meal types
  const handleMealTypes = (e) => {
    const types = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, meal_types: types }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (
      !formData.meal_name.trim() ||
      !formData.meal_description.trim() ||
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
        meal_types: mealTypesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
        price: parseFloat(formData.price),
        cost_to_make: parseFloat(formData.cost_to_make),
      };

      await onSave(payload);
      toast.success('Meal created successfully');

      // Reset form
      setFormData({
        meal_name: '',
        meal_description: '',
        meal_status: 'active',
        start_date: '',
        end_date: '',
        price: '',
        cost_to_make: '',
        meal_types: [],
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create meal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">
            Add New Meal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label className="block mb-1 text-gray-700">Meal Name *</Label>
              <Input
                name="meal_name"
                value={formData.meal_name}
                onChange={handleInputChange}
                placeholder="Enter meal name"
              />
            </div>

            <div>
              <Label className="block mb-1 text-gray-700">Description *</Label>
              <Textarea
                name="meal_description"
                value={formData.meal_description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Enter a short description"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label className="block mb-1 text-gray-700">Start Date *</Label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label className="block mb-1 text-gray-700">End Date *</Label>
              <Input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label className="block mb-1 text-gray-700">Price (cents)*</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="block mb-1 text-gray-700">Cost to Make (cents)*</Label>
              <Input
                type="number"
                name="cost_to_make"
                value={formData.cost_to_make}
                onChange={handleInputChange}
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Meal Types */}
          <div>
            <Label className="block mb-1 text-gray-700">
              Meal Types (comma-separated)
            </Label>
            <Input
            placeholder="e.g. Vegan, Gluten-Free"
            value={mealTypesInput}
            onChange={handleMealTypesChange}
            />
          </div>

          {/* Status */}
          <div>
            <Label className="block mb-1 text-gray-700">Status</Label>
            <select
              name="meal_status"
              value={formData.meal_status}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <DialogFooter className="mt-8 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-black text-white rounded-lg"
          >
            Save Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

