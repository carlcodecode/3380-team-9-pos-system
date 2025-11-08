import React from 'react';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback.tsx';

export const LandingMealCard = ({ meal, onAddToCart }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 card-glow h-full flex flex-col">
        {/* Image - Fixed Height */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={meal.img_url}
            alt={meal.meal_name || meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          {/* Types */}
          <div className="flex flex-wrap gap-2">
            {meal.meal_types && Array.isArray(meal.meal_types) && meal.meal_types.length > 0 ? (
              meal.meal_types.map((type) => (
                <Badge
                  key={type}
                  variant="secondary"
                  className="text-xs bg-gray-100 text-black border-0"
                >
                  {type}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-black border-0">
                No types
              </Badge>
            )}
          </div>

          {/* Name & Description */}
          <div className="flex-1">
            <h3 className="text-black mb-1 font-semibold">
              {meal.meal_name || meal.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {meal.meal_description || meal.description}
            </p>
          </div>

          {/* Nutrition */}
          {meal.nutrition_facts && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {meal.nutrition_facts.calories && (
                <>
                  <span>{meal.nutrition_facts.calories} cal</span>
                  <span>•</span>
                </>
              )}
              {meal.nutrition_facts.protein && (
                <>
                  <span>{meal.nutrition_facts.protein}g protein</span>
                  <span>•</span>
                </>
              )}
              {meal.nutrition_facts.carbs && (
                <span>{meal.nutrition_facts.carbs}g carbs</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
