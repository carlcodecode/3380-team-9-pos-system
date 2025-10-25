import React from 'react';
import { Button } from '../ui/button';
import { mockMeals } from '../../lib/mockData';

export const StockControl = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
