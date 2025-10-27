import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

export const MealCard = ({ meal, onAddToCart }) => {
  const hasDiscount =
    meal.discountInfo &&
    meal.discountInfo.discountedPrice < meal.price &&
    meal.discountInfo.event;

  // Safely get stock count (fallback to 0)
  const stock = meal.quantity_in_stock ?? meal.stock ?? 0;

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.error(`'${meal.meal_name || meal.name}' is out of stock!`);
      return;
    }

    onAddToCart(meal);
    //toast.success(`Added '${meal.meal_name || meal.name}' to cart!`);
  };

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
            src={meal.img_url}
            alt={meal.meal_name || meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Stock badge */}
          {stock <= 0 ? (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-600 text-white border-0">
                Out of Stock
              </Badge>
            </div>
          ) : stock < 10 ? (
            <div className="absolute top-3 right-3">
              <Badge className="bg-black text-white border-0">
                Only {stock} left
              </Badge>
            </div>
          ) : null}

          {/* Rating */}
          <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-black text-black" />
            <span className="text-xs">{meal.rating ?? ''}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
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
          <div>
            <h3 className="text-black mb-1 font-semibold">
              {meal.meal_name || meal.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {meal.meal_description || meal.description}
            </p>
          </div>

          {/* Nutrition */}
          {meal.nutrition_facts && (
            <div className="flex items-center gap-3 text-xs text-gray-500 pb-3 border-b border-gray-200">
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

          {/* Price & Add to Cart */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-lg">
                      ${(meal.price / 100).toFixed(2)}
                    </span>
                    <span className="text-2xl text-black font-semibold">
                      ${(meal.discountInfo.discountedPrice / 100).toFixed(2)}
                    </span>
                  </div>
                  <Badge className="bg-black text-white border-0 text-xs mt-1">
                    {meal.discountInfo.event.name} – {meal.discountInfo.event.discountRate}% OFF
                  </Badge>
                </>
              ) : (
                <span className="text-2xl text-black">
                  ${(meal.price / 100).toFixed(2)}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={
                meal.meal_status === 'unavailable' ||
                meal.status === 'unavailable' ||
                stock <= 0
              }
              className={`gap-2 rounded-lg btn-glossy transition-colors ${
                stock <= 0
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed'
                  : 'bg-black hover:bg-black text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              {stock <= 0 ? 'No Stock' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

