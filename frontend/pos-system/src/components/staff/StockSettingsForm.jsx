import React, { useState, useEffect, use } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export const StockSettingsForm = ({ open, onClose, stock, onSave }) => {
    const [formData, setFormData] = useState({
        reorder_threshold: '',
        stock_fulfillment_time: '',
        max_stock: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (stock) {
            setFormData({
                reorder_threshold: stock.reorder_threshold || '',
                stock_fulfillment_time: stock.stock_fulfillment_time || '',
                max_stock: stock.max_stock || '',
            });
        }
    }, [stock]);

    if (!stock) return null;

    const handleChange = (e) => {
        const { name, value} = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await onSave(stock.stock_id, {
                reorder_threshold: parseInt(formData.reorder_threshold),
                stock_fulfillment_time: parseInt(formData.stock_fulfillment_time),
                max_stock: parseInt(formData.max_stock),
            });
            toast.success('Stock settings updated successfully');
            onClose();
        } catch (error) {
            console.error('Update stock settings error:', error);
            toast.error('Failed to update stock settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-medium">
            Update Settings for {stock.meal_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reorder_threshold">Reorder Threshold</Label>
            <Input
              id="reorder_threshold"
              name="reorder_threshold"
              type="number"
              value={formData.reorder_threshold}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_fulfillment_time">
              Stock Fulfillment Rate (units/min)
            </Label>
            <Input
              id="stock_fulfillment_time"
              name="stock_fulfillment_time"
              type="number"
              value={formData.stock_fulfillment_time}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_stock">Maximum Stock</Label>
            <Input
              id="max_stock"
              name="max_stock"
              type="number"
              value={formData.max_stock}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-200 text-gray-700 rounded-lg"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
