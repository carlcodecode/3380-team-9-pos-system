import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { LandingMealCard } from './LandingMealCard';
import * as api from '../../services/api';
import { toast } from 'sonner';

export const FullMenuPage = ({ onBack, onLogin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [mealCategories, setMealCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchMealsAndCategories();
  }, []);

  const fetchMealsAndCategories = async () => {
    try {
      setLoadingMeals(true);
      setLoadingCategories(true);

      const [mealsData, categoriesData] = await Promise.all([
        api.getAllMeals(),
        api.getAllMealCategories(),
      ]);

      // Normalize meal_types and filter available meals
      const normalizedMeals = (mealsData || [])
        .filter(meal => meal.meal_status === 1)
        .map(meal => ({
          ...meal,
          meal_types: Array.isArray(meal.meal_types)
            ? meal.meal_types
            : typeof meal.meal_types === 'string'
            ? JSON.parse(meal.meal_types)
            : [],
        }));

      setMeals(normalizedMeals);
      setMealCategories(categoriesData || []);
    } catch (error) {
      console.error('Failed to load meals or categories:', error);
      toast.error('Failed to load menu');
      setMeals([]);
      setMealCategories([]);
    } finally {
      setLoadingMeals(false);
      setLoadingCategories(false);
    }
  };

  const filteredMeals = meals.filter(meal => {
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      meal.meal_name?.toLowerCase().includes(search) ||
      meal.meal_description?.toLowerCase().includes(search);

    const matchesFilter =
      selectedFilter === 'all' ||
      (Array.isArray(meal.meal_types) &&
        meal.meal_types.some(
          type => type.toLowerCase() === selectedFilter.toLowerCase()
        ));

    return matchesSearch && matchesFilter;
  });

  const filters = ['all', ...mealCategories.map(cat => cat.meal_type)];

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-black">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-normal">Bento</span>
            </div>
          </div>
          <Button
            onClick={onLogin}
            className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 px-6 py-2 inline-flex"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl text-black">
              Our Full Menu
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Browse our complete selection of premium, chef-prepared meals
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border border-gray-200 focus:border-black rounded-lg"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {loadingCategories ? (
              <div className="text-gray-500 text-sm">Loading filters...</div>
            ) : (
              filters.map(filter => (
                <Button
                  key={filter}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full ${
                    selectedFilter === filter
                      ? 'bg-black text-white hover:bg-black'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All Meals' : filter}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Loading State */}
        {loadingMeals ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
            <p className="text-gray-500 mt-4">Loading delicious meals...</p>
          </div>
        ) : (
          <>
            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMeals.map(meal => (
                <LandingMealCard
                  key={meal.meal_id}
                  meal={meal}
                  onAddToCart={onLogin}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredMeals.length === 0 && !loadingMeals && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
              >
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No meals found matching your criteria
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* CTA Section */}
        {!loadingMeals && filteredMeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 py-12 text-center bg-gray-50 rounded-xl border border-gray-200"
          >
            <h2 className="text-3xl text-black mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Login or create an account to start ordering
            </p>
            <Button
              onClick={onLogin}
              className="px-8 py-4 bg-black text-white rounded-lg hover:bg-black transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 text-lg btn-glossy"
            >
              Login to Order
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-gray-500">
            © 2025 Bento. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
