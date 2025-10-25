import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockMeals } from '../../lib/mockData';

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
    d => d.status === 'active' && d.applicableMeals.includes(meal.id)
  );
  
  if (activeDiscount) {
    const discountedPrice = meal.price * (1 - activeDiscount.discountPercent / 100);
    return discountedPrice.toFixed(2);
  }
  
  return null;
};

export const MealManagement = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
