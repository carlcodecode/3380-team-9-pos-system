import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export const MealCard = ({ meal, onAddToCart }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 card-glow">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Stock badge */}
          {meal.stock < 10 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-black text-white border-0">
                Only {meal.stock} left
              </Badge>
            </div>
          )}
          {/* Rating */}
          <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-black text-black" />
            <span className="text-xs">{meal.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Types */}
          <div className="flex flex-wrap gap-2">
            {meal.type.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="text-xs bg-gray-100 text-black border-0"
              >
                {type}
              </Badge>
            ))}
          </div>

          {/* Name & Description */}
          <div>
            <h3 className="text-black mb-1">{meal.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{meal.description}</p>
          </div>

          {/* Nutrition */}
          <div className="flex items-center gap-3 text-xs text-gray-500 pb-3 border-b border-gray-200">
            <span>{meal.calories} cal</span>
            <span>•</span>
            <span>{meal.protein}g protein</span>
            <span>•</span>
            <span>{meal.carbs}g carbs</span>
          </div>

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-2xl text-black">${meal.price}</span>
            </div>
            <Button
              onClick={() => onAddToCart(meal)}
              disabled={meal.status === 'unavailable'}
              className="bg-black hover:bg-black text-white gap-2 rounded-lg btn-glossy"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};