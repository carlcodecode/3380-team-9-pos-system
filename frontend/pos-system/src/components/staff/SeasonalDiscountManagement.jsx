import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import * as api from '../../services/api';
import { motion } from 'framer-motion';
import { SeasonalDiscountForm } from './SeasonalDiscountForm';
import { Gift, Tag, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';


export const SeasonalDiscountManagement = ({ onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        setLoading(true);
        const data = await api.getAllSaleEvents();
        console.log('Fetched sale events:', data);
        setDiscounts(data.sale_events || []);
      } catch (err) {
        console.error('Error loading discounts:', err);
        setError('Failed to load seasonal discounts');
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  const handleSaveDiscount = async (discountData) => {
    try {
      setLoading(true);
      const data = await api.getAllSaleEvents();
      console.log('Refetched sale events:', data);
      setDiscounts(data.sale_events || []);
    } catch (err) {
      console.error('Error refreshing discounts:', err);
      toast.error('Failed to refresh discounts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading seasonal discounts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Back Button (only show for admin) */}
      {isAdmin && onNavigate && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onNavigate('dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h2 className="text-black">Seasonal Discount Management</h2>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-black text-lg font-medium">Seasonal Discounts</h3>
        <Button
          size="sm"
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
          onClick={() => {
            setShowForm(true);
            setEditingDiscount(null);
          }}
        >
          Add New Discount
        </Button>
      </div>

      <SeasonalDiscountForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingDiscount(null);
        }}
        onSave={handleSaveDiscount}
        discount={editingDiscount}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {discounts.map((discount) => (
          <div
            key={discount.sale_event_id}
            className="p-5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-black font-medium">{discount.event_name}</h4>
                <Badge className="bg-black text-white border-0 text-xs">
                  {discount.meals?.length || 0} Meals
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {discount.event_description || 'No description provided'}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                {new Date(discount.event_start).toLocaleDateString()} →{' '}
                {new Date(discount.event_end).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {discount.meals?.map((meal) => (
                  <Badge
                    key={meal.meal_ref}
                    className="bg-white border border-gray-200 text-black text-xs"
                  >
                    {meal.meal_name} ({meal.discount_rate}%)
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setShowForm(true);
                  setEditingDiscount(discount);
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
              variant="outline"
              size="sm"
              className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              onClick={async () => {
                if (!window.confirm(`Are you sure you want to delete "${discount.event_name}"?`)) return;
                
                try {
                  await api.deleteSaleEvent(discount.sale_event_id);
                  setDiscounts(prev => prev.filter(d => d.sale_event_id !== discount.sale_event_id));
                  console.log(`Deleted sale event ${discount.sale_event_id}`);
                  toast.success('Discount deleted successfully');
                } catch (err) {
                  console.error('Error deleting discount:', err);
                  toast.error('Failed to delete discount');
                }
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
