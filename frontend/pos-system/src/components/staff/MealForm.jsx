import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox'; 
import { toast } from 'sonner';
import { getAllMealCategories, createMealCategory } from '../../services/api';

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
    nutrition_facts: { calories: '', carbs: '', protein: '' },
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');

  // --- Initialization and Cleanup Effects ---

  useEffect(() => {
    if (meal) {
      const formatDate = (date) => (date ? date.split('T')[0] : '');

      setFormData({
        meal_name: meal.meal_name || '',
        meal_description: meal.meal_description || '',
        img_url: meal.img_url || '',
        meal_status: meal.meal_status === 1 ? 'active' : 'inactive',
        start_date: formatDate(meal.start_date) || '',
        end_date: formatDate(meal.end_date) || '',
        price: meal.price ? (meal.price / 100).toFixed(2) : '',
        cost_to_make: meal.cost_to_make ? (meal.cost_to_make / 100).toFixed(2) : '',
        meal_id: meal.meal_id,
        nutrition_facts: meal.nutrition_facts || { calories: '', carbs: '', protein: '' },
      });
      
      // Initialize selectedCategories from meal data
      setSelectedCategories(meal.meal_types || []);
      
    } else {
      // Clear all state for adding a new meal
      setFormData({
        meal_name: '', meal_description: '', img_url: '', meal_status: 'active',
        start_date: '', end_date: '', price: '', cost_to_make: '',
        nutrition_facts: { calories: '', carbs: '', protein: '' },
      });
      setSelectedCategories([]);
      setIsOtherCategory(false);
      setOtherCategory('');
    }
  }, [meal]);

  useEffect(() => {
    // Cleanup on dialog close
    if (!open) {
      setFormData({
        meal_name: '', meal_description: '', img_url: '', meal_status: 'active',
        start_date: '', end_date: '', price: '', cost_to_make: '',
        nutrition_facts: { calories: '', carbs: '', protein: '' },
      });
      setSelectedCategories([]);
      setIsOtherCategory(false);
      setOtherCategory('');
    }
  }, [open]);

  useEffect(() => {
    // Fetch categories on mount
    const fetchCategories = async () => {
      try {
        const data = await getAllMealCategories();
        
        // FIX: No mapping needed. Set raw data. Data fields are meal_type and meal_type_id
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // --- Handlers ---

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNutritionChange = (field, value) =>
    setFormData((prev) => ({
      ...prev,
      nutrition_facts: { ...prev.nutrition_facts, [field]: value },
    }));
    
  // Handler for toggling checkbox selection
  const handleCategoryToggle = (categoryName, isChecked) => {
      setSelectedCategories(prev => {
          if (isChecked) {
              // Add category if checked and not already present
              return [...new Set([...prev, categoryName])];
          } else {
              // Remove category if unchecked
              return prev.filter(name => name !== categoryName);
          }
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCategoryName = isOtherCategory ? otherCategory.trim() : '';
    
    // Check basic required fields
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
    
    // Check if at least one category is selected/entered
    if (selectedCategories.length === 0 && !newCategoryName) {
        toast.error('Please select at least one meal category or enter a new one.');
        return;
    }

    try {
      let finalCategories = [...selectedCategories];

      // If “Other” is checked, create a new category first
      if (newCategoryName) {
        try {
          // Note: createMealCategory expects { name: '...' } from the component
          // The API helper handles mapping this to { meal_type: '...' } for the backend.
          const newCat = await createMealCategory({ name: newCategoryName });
          const createdCategoryName = newCategoryName; // Use the name sent if API doesn't return it
          
          // Add the newly created category to the final list
          finalCategories.push(createdCategoryName);
          
          // Update local state: use meal_type for the name and the new ID from the response
          setCategories(prev => [...prev, { meal_type: createdCategoryName, meal_type_id: newCat.meal_type_id || Date.now() }]); 
          setSelectedCategories(finalCategories); 
          setIsOtherCategory(false);
          setOtherCategory('');
          
        } catch (err) {
          console.error('Failed to create new category:', err);
          toast.error('Could not create new category');
          return;
        }
      }
      
      // Ensure all categories are unique
      const uniqueFinalCategories = [...new Set(finalCategories)];

      const payload = {
        ...formData,
        meal_status: formData.meal_status === 'active' ? 1 : 0,
        meal_types: uniqueFinalCategories, // Pass the array of selected categories
        price: Math.round(parseFloat(formData.price) * 100),
        cost_to_make: Math.round(parseFloat(formData.cost_to_make) * 100),
        nutrition_facts: {
          calories: Number(formData.nutrition_facts.calories) || 0,
          carbs: Number(formData.nutrition_facts.carbs) || 0,
          protein: Number(formData.nutrition_facts.protein) || 0,
        },
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
      <DialogContent
        className="!max-w-none !w-[60vw] sm:!w-[60vw] md:!w-[60vw] lg:!w-[60vw] xl:!w-[60vw] rounded-lg"
        style={{ width: '60vw', maxWidth: '60vw' }}
      >
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-semibold">
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </DialogTitle>
          <DialogDescription>
            {meal ? 'Update the meal details below.' : 'Fill in the details to create a new meal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 px-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              <div>
                <Label className="block mb-1 text-gray-700">Meal Name *</Label>
                <Input
                  name="meal_name"
                  className="w-full"
                  value={formData.meal_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label className="block mb-1 text-gray-700">Image URL *</Label>
                <Input
                  name="img_url"
                  className="w-full"
                  value={formData.img_url}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block mb-1 text-gray-700">Price ($)*</Label>
                  <Input
                    type="number"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-gray-700">Cost ($)*</Label>
                  <Input
                    type="number"
                    name="cost_to_make"
                    step="0.01"
                    value={formData.cost_to_make}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              <div>
                <Label className="block mb-1 text-gray-700">Description *</Label>
                <Textarea
                  name="meal_description"
                  value={formData.meal_description}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full"
                />
              </div>

              {/* Nutrition Facts */}
              <div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-gray-600">Calories</Label>
                    <Input
                      type="number"
                      value={formData.nutrition_facts.calories}
                      onChange={(e) =>
                        handleNutritionChange('calories', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Carbs (g)</Label>
                    <Input
                      type="number"
                      value={formData.nutrition_facts.carbs}
                      onChange={(e) =>
                        handleNutritionChange('carbs', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Protein (g)</Label>
                    <Input
                      type="number"
                      value={formData.nutrition_facts.protein}
                      onChange={(e) =>
                        handleNutritionChange('protein', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Category Selection */}
              <div>
                <Label className="block mb-2 text-gray-700">Meal Categories *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {categories.map((cat) => {
                    // FIX: Use meal_type directly from the fetched data
                    const categoryName = cat.meal_type;
                    const categoryId = cat.meal_type_id; 

                    const isChecked = selectedCategories.includes(categoryName);
                    return (
                      <div key={categoryId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${categoryId}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleCategoryToggle(categoryName, checked)
                          }
                        />
                        <Label htmlFor={`cat-${categoryId}`} className="text-sm font-normal cursor-pointer">
                          {categoryName}
                        </Label>
                      </div>
                    );
                  })}
                  
                  {/* Option for 'Other' / New Category */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cat-other"
                      checked={isOtherCategory}
                      onCheckedChange={setIsOtherCategory}
                    />
                    <Label htmlFor="cat-other" className="text-sm font-normal cursor-pointer">
                      Other (New Category)
                    </Label>
                  </div>
                </div>

                {isOtherCategory && (
                  <Input
                    placeholder="Enter new category name"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
              {/* END Category Selection */}


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
          </div>

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
            >
              {meal ? 'Save Changes' : 'Add Meal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
