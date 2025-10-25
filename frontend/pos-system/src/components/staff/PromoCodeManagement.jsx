import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Gift, Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { mockPromotions } from '../../lib/mockData';

export const PromoCodeManagement = () => {
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [deletePromoDialogOpen, setDeletePromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);

  const [promoForm, setPromoForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    discount: '',
    expiryDate: '',
  });

  const handleAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      discount: '',
      expiryDate: '',
    });
    setPromoDialogOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      discount: promo.discount.toString(),
      expiryDate: promo.expiryDate,
    });
    setPromoDialogOpen(true);
  };

  const handleSavePromo = () => {
    if (!promoForm.code || !promoForm.name || !promoForm.discount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const message = editingPromo 
      ? `Promo code "${promoForm.code}" updated successfully!`
      : `Promo code "${promoForm.code}" created successfully!`;
    
    toast.success(message);
    setPromoDialogOpen(false);
  };

  const handleDeletePromo = (promo) => {
    setPromoToDelete(promo);
    setDeletePromoDialogOpen(true);
  };

  const confirmDeletePromo = () => {
    toast.success(`Promo code "${promoToDelete?.code}" deleted successfully!`);
    setDeletePromoDialogOpen(false);
    setPromoToDelete(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-black mb-1">Promo Code Management</h3>
            <p className="text-sm text-gray-500">Create and manage promotional codes for customers</p>
          </div>
          <Button 
            size="sm" 
            className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
            onClick={handleAddPromo}
          >
            <Plus className="w-4 h-4" />
            Add Promo Code
          </Button>
        </div>

        <div className="space-y-3">
          {mockPromotions.map((promo) => (
            <div
              key={promo.id}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-5 h-5 text-black" />
                    <h4 className="text-black">{promo.name}</h4>
                    <Badge className={promo.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                      {promo.status}
                    </Badge>
                    <Badge className="bg-gray-100 text-black border-0">
                      {promo.discount}% OFF
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <code className="bg-white px-2 py-1 rounded border border-gray-200 text-black">
                        {promo.code}
                      </code>
                    </div>
                    <div className="text-gray-500">
                      Expires: {new Date(promo.expiryDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-500">
                      Used: {promo.usageCount} times
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-gray-100 rounded-lg gap-2"
                    onClick={() => handleEditPromo(promo)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg gap-2"
                    onClick={() => handleDeletePromo(promo)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockPromotions.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No promo codes yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Promo Code Dialog */}
      <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
        <DialogContent className="bg-white rounded-lg max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Create promotional codes that will be displayed on the customer dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-code">Promo Code *</Label>
                <Input
                  id="promo-code"
                  placeholder="e.g., SUMMER25"
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-name">Name *</Label>
                <Input
                  id="promo-name"
                  placeholder="e.g., Summer Sale"
                  value={promoForm.name}
                  onChange={(e) => setPromoForm({...promoForm, name: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-description">Description</Label>
              <Textarea
                id="promo-description"
                placeholder="Describe the promotion..."
                value={promoForm.description}
                onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                className="rounded-lg border-gray-200"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-discount">Discount % *</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  placeholder="e.g., 20"
                  value={promoForm.discount}
                  onChange={(e) => setPromoForm({...promoForm, discount: e.target.value})}
                  className="rounded-lg border-gray-200"
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-expiry">Expiry Date *</Label>
                <Input
                  id="promo-expiry"
                  type="date"
                  value={promoForm.expiryDate}
                  onChange={(e) => setPromoForm({...promoForm, expiryDate: e.target.value})}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPromoDialogOpen(false)}
              className="rounded-lg border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePromo}
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
            >
              {editingPromo ? 'Update' : 'Create'} Promo Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Promo Confirmation */}
      <AlertDialog open={deletePromoDialogOpen} onOpenChange={setDeletePromoDialogOpen}>
        <AlertDialogContent className="bg-white rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black">Delete Promo Code</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete the promo code "{promoToDelete?.code}"? 
              This action cannot be undone and customers will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePromo}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
