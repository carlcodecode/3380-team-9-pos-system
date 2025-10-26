import React, {useState, useEffect} from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import * as api from '../../services/api';
import { motion } from 'framer-motion';
import { MealForm } from './MealForm';

// Mock seasonal discounts data (temporary - should be from API)
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

const calculateDiscountedPrice = (meal) => {
  const activeDiscount = mockSeasonalDiscounts.find(
    d => d.status === 'active' && d.applicableMeals.includes(meal.meal_id)
  );
  
  if (activeDiscount) {
    const discountedPrice = meal.price * (1 - activeDiscount.discountPercent / 100);
    return (discountedPrice / 100).toFixed(2);
  }
  
  return null;
};


export const MealManagement = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const data = await api.getAllMeals();
        console.log('getAllMeals() raw result:', data);
        setMeals(data);
      } catch (err) {
        setError('Failed to load meals');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const handleSaveMeal = async (mealData) => {
  try {
    let result;

    if (mealData.meal_id) {
      result = await api.updateMeal(mealData.meal_id, mealData);

      // Update the existing meal in the list
      setMeals((prev) =>
        prev.map((meal) =>
          meal.meal_id === mealData.meal_id ? result.meal || result : meal
        )
      );
    } else {
      result = await api.createMeal(mealData);
      setMeals((prev) => [...prev, result.meal || result]);
    }

  } catch (err) {
    console.error('Error saving meal:', err);
  }
};
  
  if (loading) return <div>Loading meals...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-black text-lg font-medium">Meal Catalog</h3>
        <Button 
          size="sm" 
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
          onClick={() => {
            setShowAddForm(true);
            setEditingMeal(null);
          }}
        >
          Add New Meal
        </Button>
      </div>

      <MealForm
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        meal={editingMeal}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {meals.map((meal) => {
          const discountedPrice = calculateDiscountedPrice(meal);
          return (
            <div
              key={meal.meal_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="text-black font-medium mb-1">{meal.meal_name}</div>
                <div className="text-sm text-gray-500 mb-2">
                  {discountedPrice ? (
                    <>
                      <span className="line-through text-gray-400">${(meal.price / 100).toFixed(2)}</span>
                      <span className="ml-2 text-black">${(discountedPrice / 100).toFixed(2)}</span>
                      <Badge className="ml-2 bg-black text-white border-0 text-xs">
                        Discounted
                      </Badge>
                    </>
                  ) : (
                    <span>${(meal.price / 100).toFixed(2)}</span>
                  )}
                </div>
                
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-200 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                  setShowAddForm(true);
                  setEditingMeal(meal);
                }}
                >
                  Edit
                </Button>
                <Button
                variant={meal.meal_status === 1 ? 'default' : 'secondary'}
                size="sm"
                className={
                  meal.meal_status === 1
                    ? 'bg-black text-white rounded-lg hover:bg-black'
                    : 'bg-gray-200 text-black rounded-lg hover:bg-gray-200'
                }
              >
                {meal.meal_status === 1 ? 'Active' : 'Inactive'}
              </Button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

};


