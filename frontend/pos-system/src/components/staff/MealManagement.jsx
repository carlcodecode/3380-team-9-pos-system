import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import * as api from '../../services/api';
import { motion } from 'framer-motion';
import { MealForm } from './MealForm';
import { Gift, Tag, Plus, Edit, Trash2 } from 'lucide-react';


export const MealManagement = () => {
  const [meals, setMeals] = useState([]);
  const [saleEvents, setSaleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Fetch meals and sale events together
  useEffect(() => {
    const fetchMealsAndSales = async () => {
      try {
        setLoading(true);
        const [mealsData, salesData] = await Promise.all([
          api.getAllMeals(),
          api.getAllSaleEvents(),
        ]);

        console.log('getAllMeals() result:', mealsData);
        console.log('getAllSaleEvents() result:', salesData);

        setMeals(mealsData);
        setSaleEvents(salesData.sale_events || salesData);
      } catch (err) {
        console.error(err);
        setError('Failed to load meals or sale events');
      } finally {
        setLoading(false);
      }
    };

    fetchMealsAndSales();
  }, []);

  // Compute only the highest active discount
  const calculateDiscountedPrice = (meal) => {
    const now = new Date();
    let highestDiscount = 0;
    let bestEvent = null;

    for (const event of saleEvents) {
      const start = new Date(event.event_start);
      const end = new Date(event.event_end);
      const isActive = now >= start && now <= end;

      if (isActive && Array.isArray(event.meals)) {
        const mealSale = event.meals.find((m) => m.meal_ref === meal.meal_id);
        if (mealSale && mealSale.discount_rate > highestDiscount) {
          highestDiscount = mealSale.discount_rate;
          bestEvent = event;
        }
      }
    }

    if (highestDiscount > 0 && bestEvent) {
      const discountedPrice = meal.price * (1 - highestDiscount / 100);
      return { discountedPrice, event: bestEvent };
    }

    return null;
  };

  // Handle create/update meal
  const handleSaveMeal = async (mealData) => {
    try {
      let result;

      if (mealData.meal_id) {
        result = await api.updateMeal(mealData.meal_id, mealData);
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
          const discountInfo = calculateDiscountedPrice(meal);

          return (
            <div
              key={meal.meal_id}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border transition-colors
              ${
                meal.meal_status === 1
                  ? 'border-green-300 hover:border-green-400 bg-green-50 text-green-800'
                  : 'border-red-300 hover:border-red-400 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex-1">
                <div className="text-black font-medium mb-1">
                  {meal.meal_name}
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  {discountInfo ? (
                    <>
                      <span className="line-through text-gray-400">
                        ${(meal.price / 100).toFixed(2)}
                      </span>
                      <span className="price-spacing text-black font-semibold">
                        ${(discountInfo.discountedPrice / 100).toFixed(2)}
                      </span>
                      <Badge className="price-spacing bg-black text-white border-0 text-xs">
                        {discountInfo.event.event_name} –{' '}
                        {discountInfo.event.meals.find(
                          (m) => m.meal_ref === meal.meal_id
                        )?.discount_rate ?? 0}
                        % OFF
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
                  <Edit className="w-4 h-4" />
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
