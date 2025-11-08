import React, { useState, useEffect } from 'react';
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
import { Gift, Tag, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const PromoCodeManagement = ({ onNavigate }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [deletePromoDialogOpen, setDeletePromoDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);

  const [promoForm, setPromoForm] = useState({
    code: '',
    description: '',
    type: '',
    expiryDate: '',
  });

  // Fetch promos on component mount
  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPromos();
      setPromos(response.promotions || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load promotions');
      console.error('Fetch promos error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromo = () => {
    setEditingPromo(null);
    setPromoForm({
      code: '',
      description: '',
      type: '',
      expiryDate: '',
    });
    setPromoDialogOpen(true);
  };

  const handleEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      code: promo.promo_code,
      description: promo.promo_description,
      type: promo.promo_type.toString(),
      expiryDate: promo.promo_exp_date.split('T')[0], // Format date for input
    });
    setPromoDialogOpen(true);
  };

  const handleSavePromo = async () => {
    if (!promoForm.code || !promoForm.description || !promoForm.type || !promoForm.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const promoData = {
        promo_code: promoForm.code,
        promo_description: promoForm.description,
        promo_type: parseInt(promoForm.type),
        promo_exp_date: promoForm.expiryDate,
      };

      if (editingPromo) {
        await api.updatePromo(editingPromo.promotion_id, promoData);
        toast.success(`Promo code "${promoForm.code}" updated successfully!`);
      } else {
        await api.createPromo(promoData);
        toast.success(`Promo code "${promoForm.code}" created successfully!`);
      }
      
      setPromoDialogOpen(false);
      fetchPromos(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to save promotion');
      console.error('Save promo error:', error);
    }
  };

  const handleDeletePromo = (promo) => {
    setPromoToDelete(promo);
    setDeletePromoDialogOpen(true);
  };

  const confirmDeletePromo = async () => {
    if (!promoToDelete) return;
    
    try {
      await api.deletePromo(promoToDelete.promotion_id);
      toast.success(`Promo code "${promoToDelete.promo_code}" deleted successfully!`);
      setDeletePromoDialogOpen(false);
      setPromoToDelete(null);
      fetchPromos(); // Refresh the list
    } catch (error) {
      console.error('Delete promo error:', error);
      const errorMessage = error.message || 'Failed to delete promotion';
      toast.error(errorMessage);
      // Keep dialog open if there was an error so user can see what happened
    }
  };

  // Helper function to check if promo is active
  const isPromoActive = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  return (
    <>
      <div className="space-y-6">
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
              <h2 className="text-black">Promo Code Management</h2>
            </div>
          </div>
        )}

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

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading promotions...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promos.map((promo) => (
              <div
                key={promo.promotion_id}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Gift className="w-5 h-5 text-black" />
                      <h4 className="text-black">Promo Code</h4>
                      <Badge className={isPromoActive(promo.promo_exp_date) ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                        {isPromoActive(promo.promo_exp_date) ? 'active' : 'expired'}
                      </Badge>
                      <Badge className="bg-gray-100 text-black border-0">
                        Type: {promo.promo_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{promo.promo_description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <code className="bg-white px-2 py-1 rounded border border-gray-200 text-black">
                          {promo.promo_code}
                        </code>
                      </div>
                      <div className="text-gray-500">
                        Expires: {new Date(promo.promo_exp_date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        ID: {promo.promotion_id}
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
                      className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" 
                      onClick={() => handleDeletePromo(promo)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {promos.length === 0 && !loading && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No promo codes yet. Create your first one!</p>
              </div>
            )}
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
              <Label htmlFor="promo-description">Description *</Label>
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
                <Label htmlFor="promo-type">Discount percent *</Label>
                <Input
                  id="promo-type"
                  type="number"
                  placeholder="e.g., 10"
                  value={promoForm.type}
                  onChange={(e) => setPromoForm({...promoForm, type: e.target.value})}
                  className="rounded-lg border-gray-200"
                  min="0"
                />
                <p className="text-xs text-gray-500">Enter the discount percentage (0-100)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-expiry">Expiry Date *</Label>
                <Input
                  id="promo-expiry"
                  type="date"
                  value={promoForm.expiryDate}
                  onChange={(e) => setPromoForm({...promoForm, expiryDate: e.target.value})}
                  className="rounded-lg border-gray-200"
                  min={new Date().toISOString().split('T')[0]}
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
              Are you sure you want to delete the promo code "{promoToDelete?.promo_code}"? 
              This action cannot be undone and customers will no longer be able to use this code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-gray-200">
              Cancel
            </AlertDialogCancel>
            <button
              onClick={confirmDeletePromo}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 px-4 py-2 transition-colors"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
};
