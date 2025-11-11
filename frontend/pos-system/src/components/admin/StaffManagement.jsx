import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Checkbox } from '../ui/checkbox';
import { Plus, Search, Edit, Trash2, Eye, Download, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import * as api from '../../services/api';
import { bitmaskToPermissions, permissionsToBitmask } from '../../utils/permissions';

export const StaffManagement = ({ viewMode, onNavigate, selectedStaff, setSelectedStaff }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone_number: '',
    hire_date: '',
    salary: '',
    username: '',
    password: '',
    email: '',
    permissions: {
      reports: false,
      orders: false,
      mealManagement: false,
      stockControl: false,
      promoCodes: false,
      seasonalDiscounts: false,
    }
  });

  // Fetch staff when on list view
  useEffect(() => {
    if (viewMode === 'staff-list') fetchStaff();
  }, [viewMode]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.getAllStaff();
      setStaffList(res.staff || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  // Auto-format phone number as user types (333-333-3333)
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Format as 333-333-3333
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({...formData, phone_number: formatted});
  };

  // Update form when switching modes
  useEffect(() => {
    if (viewMode === 'staff-edit' && selectedStaff) {
      // Decode permissions from bitmask if it's a number
      let permissions = {
        reports: false,
        orders: false,
        mealManagement: false,
        stockControl: false,
        promoCodes: false,
        seasonalDiscounts: false,
      };
      
      if (typeof selectedStaff.PERMISSIONS === 'number') {
        permissions = bitmaskToPermissions(selectedStaff.PERMISSIONS);
      } else if (selectedStaff.permissions) {
        permissions = selectedStaff.permissions;
      }

      // Format hire_date to yyyy-MM-dd format for date input
      let formattedHireDate = '';
      if (selectedStaff.hire_date) {
        const date = new Date(selectedStaff.hire_date);
        formattedHireDate = date.toISOString().split('T')[0];
      }

      setFormData({
        firstName: selectedStaff.first_name || '',
        lastName: selectedStaff.last_name || '',
        phone_number: selectedStaff.phone_number || '',
        hire_date: formattedHireDate,
        salary: selectedStaff.salary || '',
        username: selectedStaff.username || '',
        email: selectedStaff.email || '',
        password: '',
        permissions
      });
    } else if (viewMode === 'staff-add') {
      setFormData({
        firstName: '',
        lastName: '',
        phone_number: '',
        hire_date: '',
        salary: '',
        username: '',
        email: '',
        password: '',
        permissions: {
          reports: false,
          orders: false,
          mealManagement: false,
          stockControl: false,
          promoCodes: false,
          seasonalDiscounts: false,
        }
      });
    }
  }, [selectedStaff, viewMode]);

  // Handlers
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    onNavigate('staff-edit');
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    onNavigate('staff-view');
  };

  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.deleteStaff(staffToDelete.user_id);
      toast.success('Staff deleted successfully');
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
      setDeleteReason('');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete staff');
    }
  };

  const validateForm = () => {
    // Required field validation
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.salary) {
      toast.error('Salary is required');
      return false;
    }
    if (viewMode === 'staff-add' && !formData.password.trim()) {
      toast.error('Password is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone format validation (111-111-1111)
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      toast.error('Phone number must be in format: 111-111-1111');
      return false;
    }

    // Salary validation (must be positive)
    if (parseFloat(formData.salary) <= 0) {
      toast.error('Salary must be a positive number');
      return false;
    }

    // Hire date validation (cannot be in the future)
    if (formData.hire_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const hireDate = new Date(formData.hire_date);
      if (hireDate > today) {
        toast.error('Hire date cannot be in the future');
        return false;
      }
    }

    return true;
  };

  const handleSaveStaff = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Convert permissions object to backend field names
      // Backend mapping: REPORT, MEAL, STOCK, MEAL_CATEGORY, SALE_EVENT, PROMO
      const payload = {
        ...formData,
        report_perm: formData.permissions.reports,           // Bit 0: Reports (placeholder)
        meal_perm: formData.permissions.mealManagement,      // Bit 1: Meal Management
        stock_perm: formData.permissions.stockControl,       // Bit 2: Stock Control
        meal_category_perm: formData.permissions.orders,     // Bit 3: Orders
        sale_event_perm: formData.permissions.seasonalDiscounts, // Bit 4: Seasonal Discounts
        promo_perm: formData.permissions.promoCodes,         // Bit 5: Promo Codes
      };
      
      // Remove the frontend permissions object
      delete payload.permissions;

      if (viewMode === 'staff-add') {
        await api.createStaff(payload);
        toast.success('Staff added successfully');
      } else if (viewMode === 'staff-edit') {
        await api.updateStaff(selectedStaff.user_id, payload);
        toast.success('Staff updated successfully');
      }
      onNavigate('staff-list');
      fetchStaff();
    } catch (error) {
      console.log('STAFF SAVE ERROR RESPONSE:', error.response?.data);
      toast.error('Staff already exists!');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.status === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ==========================
  // Staff List View
  // ==========================
  if (viewMode === 'staff-list') {
    return (
      <>
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-lg border border-gray-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
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
                <h2 className="text-black">Staff Management</h2>
              </div>
              <Button 
                className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2" 
                onClick={() => onNavigate('staff-add')}
              >
                <Plus className="w-4 h-4" />
                Add Staff
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by Name/ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] rounded-lg border-gray-200">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-black">Staff ID</TableHead>
                    <TableHead className="text-black">Name</TableHead>
                    <TableHead className="text-black">Email</TableHead>
                    <TableHead className="text-black">Hire Date</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Loading staff...
                      </TableCell>
                    </TableRow>
                  ) : filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        No staff found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((s) => (
                      <TableRow key={s.user_id}>
                        <TableCell className="text-black">{s.staff_id}</TableCell>
                        <TableCell className="text-black">
                          {s.first_name} {s.last_name}
                        </TableCell>
                        <TableCell className="text-gray-600">{s.email}</TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(s.hire_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={s.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                            {s.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-gray-100 rounded-lg"
                              onClick={() => handleEditStaff(s)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-gray-100 rounded-lg"
                              onClick={() => handleViewStaff(s)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-gray-100 rounded-lg"
                              onClick={() => handleDeleteClick(s)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer Stats and Export */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Staff: {filteredStaff.length}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg border-gray-200 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-lg border-gray-200 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">
                Confirm Delete Staff - {staffToDelete?.first_name} {staffToDelete?.last_name}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-black mb-2">
                        Warning: This will remove the staff account and archive associated data.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="deleteReason">Reason (Optional)</Label>
                    <Textarea
                      id="deleteReason"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Enter reason for deletion..."
                      className="rounded-lg border-gray-200 mt-1"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-black mb-2">Impact:</p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Meals created by this staff will be reassigned to 'System'.</li>
                      <li>Stock records created by this staff will be reassigned to 'System'.</li>
                      <li>Orders/Other updates unaffected.</li>
                    </ul>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg border-gray-200">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-black hover:bg-black text-white rounded-lg btn-glossy" 
                onClick={handleDeleteConfirm}
              >
                Delete Staff
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // ==========================
  // Add/Edit Staff Form
  // ==========================
  if (viewMode === 'staff-add' || viewMode === 'staff-edit') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-lg border border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => onNavigate('staff-list')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">
                {viewMode === 'staff-add' ? 'Add Staff Account' : 'Edit Staff Account'}
              </h2>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-black hover:bg-black text-white rounded-lg btn-glossy" 
                onClick={handleSaveStaff}
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                className="rounded-lg border-gray-200"
                onClick={() => onNavigate('staff-list')}
              >
                Cancel
              </Button>
              {viewMode === 'staff-edit' && selectedStaff && (
                <Button 
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                  onClick={() => handleDeleteClick(selectedStaff)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Staff
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Personal & Employment Info */}
            <div className="space-y-6">
              {/* Personal Info Section */}
              <div>
                <h3 className="text-black mb-4">Personal Info</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="firstName"
                      value={formData.firstName} 
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="lastName"
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="phone"
                      value={formData.phone_number} 
                      onChange={handlePhoneChange}
                      className="rounded-lg border-gray-200"
                      placeholder="333-333-3333"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 333-333-3333 (auto-formatted)</p>
                  </div>
                </div>
              </div>

              {/* Employment Section */}
              <div>
                <h3 className="text-black mb-4">Employment</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input 
                      id="hireDate"
                      type="date" 
                      value={formData.hire_date} 
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      className="rounded-lg border-gray-200"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500 mt-1">Cannot be in the future</p>
                  </div>
                  <div>
                    <Label htmlFor="salary">
                      Salary <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="salary"
                      type="number" 
                      value={formData.salary} 
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder="$"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be a positive value</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Account & Permissions */}
            <div className="space-y-6">
              {/* Account Section */}
              <div>
                <h3 className="text-black mb-4">Account</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder="staff@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">
                      Username <span className="text-red-600">*</span>
                    </Label>
                    <Input 
                      id="username"
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">
                      Password {viewMode === 'staff-add' && <span className="text-red-600">*</span>}
                      {viewMode === 'staff-edit' && ' (leave blank to keep current)'}
                    </Label>
                    <Input 
                      id="password"
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="rounded-lg border-gray-200"
                      placeholder={viewMode === 'staff-edit' ? '••••••••' : 'Enter password'}
                      required={viewMode === 'staff-add'}
                    />
                    <p className="text-xs text-gray-500 mt-1">Password will be hashed</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select defaultValue="staff">
                      <SelectTrigger className="rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Limited options</p>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <h3 className="text-black mb-4">Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reports"
                      checked={formData.permissions.reports}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, reports: checked}
                        })
                      }
                    />
                    <Label htmlFor="reports" className="cursor-pointer font-normal">
                      Reports
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="orders"
                      checked={formData.permissions.orders}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, orders: checked}
                        })
                      }
                    />
                    <Label htmlFor="orders" className="cursor-pointer font-normal">
                      Orders
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mealManagement"
                      checked={formData.permissions.mealManagement}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, mealManagement: checked}
                        })
                      }
                    />
                    <Label htmlFor="mealManagement" className="cursor-pointer font-normal">
                      Meal Management
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stockControl"
                      checked={formData.permissions.stockControl}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, stockControl: checked}
                        })
                      }
                    />
                    <Label htmlFor="stockControl" className="cursor-pointer font-normal">
                      Stock Control
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="promoCodes"
                      checked={formData.permissions.promoCodes}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, promoCodes: checked}
                        })
                      }
                    />
                    <Label htmlFor="promoCodes" className="cursor-pointer font-normal">
                      Promo Codes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="seasonalDiscounts"
                      checked={formData.permissions.seasonalDiscounts}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, seasonalDiscounts: checked}
                        })
                      }
                    />
                    <Label htmlFor="seasonalDiscounts" className="cursor-pointer font-normal">
                      Seasonal Discounts
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================
  // View Staff Details
  // ==========================
  if (viewMode === 'staff-view' && selectedStaff) {
    // Decode permissions from bitmask
    let permissions = {
      reports: false,
      orders: false,
      mealManagement: false,
      stockControl: false,
      promoCodes: false,
      seasonalDiscounts: false,
    };
    
    if (typeof selectedStaff.PERMISSIONS === 'number') {
      permissions = bitmaskToPermissions(selectedStaff.PERMISSIONS);
    } else if (selectedStaff.permissions) {
      permissions = selectedStaff.permissions;
    }

    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-lg border border-gray-200 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => onNavigate('staff-list')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">
                Staff Details - {selectedStaff.first_name} {selectedStaff.last_name} (ID: {selectedStaff.staff_id})
              </h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="rounded-lg border-gray-200 gap-2"
                onClick={() => handleEditStaff(selectedStaff)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="rounded-lg border-gray-200 text-red-600 hover:text-red-700 gap-2"
                onClick={() => handleDeleteClick(selectedStaff)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-black mb-4">Personal Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Name:</span>
                    <span className="text-black">
                      {selectedStaff.first_name} {selectedStaff.last_name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Phone:</span>
                    <span className="text-black">{selectedStaff.phone_number}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Hire Date:</span>
                    <span className="text-black">
                      {new Date(selectedStaff.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Salary:</span>
                    <span className="text-black">${selectedStaff.salary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h3 className="text-black mb-4">Account</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Email:</span>
                    <span className="text-black">{selectedStaff.email}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Username:</span>
                    <span className="text-black">{selectedStaff.username}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Role:</span>
                    <span className="text-black">Staff</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 w-32">Status:</span>
                    <Badge className={selectedStaff.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                  {selectedStaff.created_at && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Created At:</span>
                      <span className="text-black">
                        {new Date(selectedStaff.created_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedStaff.updated_at && (
                    <div className="flex">
                      <span className="text-gray-500 w-32">Last Updated:</span>
                      <span className="text-black">
                        {new Date(selectedStaff.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Permissions */}
              <div>
                <h3 className="text-black mb-4">Permissions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.reports ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.reports ? 'text-black' : 'text-gray-400'}>
                      Reports
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.orders ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.orders ? 'text-black' : 'text-gray-400'}>
                      Orders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.mealManagement ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.mealManagement ? 'text-black' : 'text-gray-400'}>
                      Meal Management
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.stockControl ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.stockControl ? 'text-black' : 'text-gray-400'}>
                      Stock Control
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.promoCodes ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.promoCodes ? 'text-black' : 'text-gray-400'}>
                      Promo Codes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${permissions.seasonalDiscounts ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={permissions.seasonalDiscounts ? 'text-black' : 'text-gray-400'}>
                      Seasonal Discounts
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Log Placeholder */}
              <div>
                <h3 className="text-black mb-4">Activity Log</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    Activity tracking coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};