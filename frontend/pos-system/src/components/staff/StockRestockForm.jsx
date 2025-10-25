import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export const StockRestockForm = ({ open, onClose, stock, onSave }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  
  if (!stock) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
        toast.error('Please enter a valid positive quantity');
        return;     
    }

    const newTotal = stock.quantity_in_stock + qty;

    if (newTotal > stock.max_stock) {
    toast.error(
      `Cannot restock ${qty} units. This would exceed the max stock limit of ${stock.max_stock}.`
    );
    return;
  }

    try {
        setLoading(true);
        await onSave(stock.stock_id, qty);
        toast.success(`Successfully restocked ${qty} units of ${stock.meal_name}`);
        setQuantity('');
        onClose();  
    } catch (error) {
        console.error('Restock error:', error);
        toast.error('Failed to restock item');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-black text-lg font-medium">
            Restock {stock.meal_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Add</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              placeholder="Enter amount"
              required
            />
          </div>
          <p className="text-sm text-gray-500">
            Current stock: <strong>{stock.quantity_in_stock}</strong> /{' '}
            <strong>{stock.max_stock}</strong>
          </p>
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
              {loading ? 'Restocking...' : 'Restock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

