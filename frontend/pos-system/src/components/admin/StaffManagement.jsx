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
    email: ''
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

  // Update form when switching modes
  useEffect(() => {
    if (viewMode === 'staff-edit' && selectedStaff) {
      setFormData({
        firstName: selectedStaff.first_name || '',
        lastName: selectedStaff.last_name || '',
        phone_number: selectedStaff.phone_number || '',
        hire_date: selectedStaff.hire_date || '',
        salary: selectedStaff.salary || '',
        username: selectedStaff.username || '',
        email: selectedStaff.email || '',
        password: ''
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
        password: ''
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
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete staff');
    }
  };

  const handleSaveStaff = async () => {
    try {
      if (viewMode === 'staff-add') {
        await api.createStaff(formData);
        toast.success('Staff added successfully');
      } else if (viewMode === 'staff-edit') {
        await api.updateStaff(selectedStaff.user_id, formData);
        toast.success('Staff updated successfully');
      }
      onNavigate('staff-list');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save staff');
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <h2 className="text-black">Staff Management</h2>
              </div>
              <Button className="bg-black text-white" onClick={() => onNavigate('staff-add')}>
                <Plus className="w-4 h-4" /> Add Staff
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or username"
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
                  <SelectItem value="all">All</SelectItem>
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
                    <TableHead className="text-black">ID</TableHead>
                    <TableHead className="text-black">Name</TableHead>
                    <TableHead className="text-black">Email</TableHead>
                    <TableHead className="text-black">Hire Date</TableHead>
                    <TableHead className="text-black text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((s) => (
                    <TableRow key={s.user_id}>
                      <TableCell>{s.staff_id}</TableCell>
                      <TableCell>{s.first_name} {s.last_name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{new Date(s.hire_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditStaff(s)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleViewStaff(s)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(s)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-black">Delete Staff</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Are you sure you want to delete {staffToDelete?.first_name} {staffToDelete?.last_name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 text-white" onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Add/Edit form view (same structure, just simplified)
  if (viewMode === 'staff-add' || viewMode === 'staff-edit') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('staff-list')}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button className="bg-black text-white" onClick={handleSaveStaff}>Save</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>First Name</Label>
            <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <Label>Last Name</Label>
            <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            <Label>Phone</Label>
            <Input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
            <Label>Hire Date</Label>
            <Input type="date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} />
            <Label>Salary</Label>
            <Input type="int" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Label>Username</Label>
            <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            <Label>Password</Label>
            <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
