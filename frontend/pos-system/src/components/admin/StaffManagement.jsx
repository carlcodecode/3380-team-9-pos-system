import React, { useState } from 'react';
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
import { motion } from 'motion/react';

// Mock Staff Data
const mockStaff = [
  {
    id: '001',
    firstName: 'John',
    middleInit: 'A',
    lastName: 'Smith',
    phone: '555-123-4567',
    hireDate: '2023-01-15',
    salary: 45000,
    username: 'jsmith',
    status: 'active',
    permissions: { mealsCrud: true, stockCrud: true, reportsView: true },
    createdAt: '2023-01-15 10:00 AM',
    updatedAt: '2025-10-22 02:30 PM',
  },
  {
    id: '002',
    firstName: 'Jane',
    middleInit: 'B',
    lastName: 'Doe',
    phone: '555-234-5678',
    hireDate: '2023-03-10',
    salary: 42000,
    username: 'jdoe',
    status: 'active',
    permissions: { mealsCrud: true, stockCrud: false, reportsView: true },
    createdAt: '2023-03-10 09:00 AM',
    updatedAt: '2025-10-22 01:15 PM',
  },
  {
    id: '003',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '555-345-6789',
    hireDate: '2023-06-20',
    salary: 38000,
    username: 'mjohnson',
    status: 'active',
    permissions: { mealsCrud: true, stockCrud: true, reportsView: false },
    createdAt: '2023-06-20 11:00 AM',
    updatedAt: '2025-10-15 03:00 PM',
  },
  {
    id: '004',
    firstName: 'Sarah',
    middleInit: 'C',
    lastName: 'Williams',
    phone: '555-456-7890',
    hireDate: '2024-02-05',
    salary: 40000,
    username: 'swilliams',
    status: 'inactive',
    permissions: { mealsCrud: false, stockCrud: true, reportsView: false },
    createdAt: '2024-02-05 08:30 AM',
    updatedAt: '2025-09-30 05:00 PM',
  },
  {
    id: '005',
    firstName: 'Tom',
    lastName: 'Brown',
    phone: '555-567-8901',
    hireDate: '2024-05-12',
    salary: 36000,
    username: 'tbrown',
    status: 'active',
    permissions: { mealsCrud: true, stockCrud: false, reportsView: false },
    createdAt: '2024-05-12 10:30 AM',
    updatedAt: '2025-10-10 11:00 AM',
  },
];

export const StaffManagement = ({ viewMode, onNavigate, selectedStaff, setSelectedStaff }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form state for Add/Edit Staff
  const [formData, setFormData] = useState({
    firstName: selectedStaff?.firstName || '',
    middleInit: selectedStaff?.middleInit || '',
    lastName: selectedStaff?.lastName || '',
    phone: selectedStaff?.phone || '',
    hireDate: selectedStaff?.hireDate || '',
    salary: selectedStaff?.salary?.toString() || '',
    username: selectedStaff?.username || '',
    password: '',
    permissions: selectedStaff?.permissions || {
      mealsCrud: false,
      stockCrud: false,
      reportsView: false,
    },
  });

  // Update formData when selectedStaff changes
  React.useEffect(() => {
    if (selectedStaff && viewMode === 'staff-edit') {
      setFormData({
        firstName: selectedStaff.firstName,
        middleInit: selectedStaff.middleInit || '',
        lastName: selectedStaff.lastName,
        phone: selectedStaff.phone,
        hireDate: selectedStaff.hireDate,
        salary: selectedStaff.salary.toString(),
        username: selectedStaff.username,
        password: '',
        permissions: selectedStaff.permissions,
      });
    } else if (viewMode === 'staff-add') {
      setFormData({
        firstName: '',
        middleInit: '',
        lastName: '',
        phone: '',
        hireDate: '',
        salary: '',
        username: '',
        password: '',
        permissions: {
          mealsCrud: false,
          stockCrud: false,
          reportsView: false,
        },
      });
    }
  }, [selectedStaff, viewMode]);

  // Filtered staff list
  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = 
      staff.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.id.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || staff.status === roleFilter;
    return matchesSearch && matchesRole;
  });

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

  const handleDeleteConfirm = () => {
    console.log('Deleting staff:', staffToDelete, 'Reason:', deleteReason);
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
    setDeleteReason('');
    onNavigate('staff-list');
  };

  const handleSaveStaff = () => {
    console.log('Saving staff:', formData);
    onNavigate('staff-list');
  };

  // Staff List View
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
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
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
                    <TableHead className="text-black">Hire Date</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="text-black">{staff.id}</TableCell>
                      <TableCell className="text-black">
                        {staff.firstName} {staff.middleInit && `${staff.middleInit}. `}{staff.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(staff.hireDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={staff.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => handleEditStaff(staff)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => handleDeleteClick(staff)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-100 rounded-lg"
                            onClick={() => handleViewStaff(staff)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Staff: {filteredStaff.length}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-lg border-gray-200 gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg border-gray-200 gap-2">
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
                Confirm Delete Staff - {staffToDelete?.firstName} {staffToDelete?.lastName}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-black mb-2">Warning: This will remove the staff account and archive associated data.</p>
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
                      <li>Orders/Stock updates unaffected.</li>
                    </ul>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
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

  // Add/Edit Staff Form
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
                  variant="outline"
                  className="rounded-lg border-gray-200 text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteClick(selectedStaff)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Info Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-black mb-4">Personal Info</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleInit">Middle Initial</Label>
                    <Input
                      id="middleInit"
                      value={formData.middleInit}
                      onChange={(e) => setFormData({...formData, middleInit: e.target.value})}
                      maxLength={1}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="###-###-####"
                      className="rounded-lg border-gray-200"
                    />
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
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      placeholder="$"
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-black mb-4">Account</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">
                      Password {viewMode === 'staff-edit' && '(leave blank to keep current)'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={viewMode === 'staff-edit' ? '••••••••' : ''}
                      className="rounded-lg border-gray-200"
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
                      id="mealsCrud"
                      checked={formData.permissions.mealsCrud}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, mealsCrud: checked}
                        })
                      }
                    />
                    <Label htmlFor="mealsCrud" className="cursor-pointer">
                      Meals CRUD
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stockCrud"
                      checked={formData.permissions.stockCrud}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, stockCrud: checked}
                        })
                      }
                    />
                    <Label htmlFor="stockCrud" className="cursor-pointer">
                      Stock CRUD
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reportsView"
                      checked={formData.permissions.reportsView}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          permissions: {...formData.permissions, reportsView: checked}
                        })
                      }
                    />
                    <Label htmlFor="reportsView" className="cursor-pointer">
                      Reports View
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

  // View Staff Details
  if (viewMode === 'staff-view' && selectedStaff) {
    const staffActivity = [
      { action: 'Created Meal #005', date: '10/20/2025' },
      { action: 'Updated Stock #003', date: '10/21/2025' },
    ];

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
                Staff Details - {selectedStaff.firstName} {selectedStaff.lastName} (ID: {selectedStaff.id})
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
                      {selectedStaff.firstName} {selectedStaff.middleInit && `${selectedStaff.middleInit}. `}
                      {selectedStaff.lastName}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Phone:</span>
                    <span className="text-black">{selectedStaff.phone}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Hire Date:</span>
                    <span className="text-black">
                      {new Date(selectedStaff.hireDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Salary:</span>
                    <span className="text-black">${selectedStaff.salary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h3 className="text-black mb-4">Account</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-32">Username:</span>
                    <span className="text-black">{selectedStaff.username}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Role:</span>
                    <span className="text-black">Staff</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Status:</span>
                    <Badge className={selectedStaff.status === 'active' ? 'bg-black text-white border-0' : 'bg-gray-300 text-black border-0'}>
                      {selectedStaff.status}
                    </Badge>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Created At:</span>
                    <span className="text-black">{selectedStaff.createdAt}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32">Last Updated:</span>
                    <span className="text-black">{selectedStaff.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Permissions */}
              <div>
                <h3 className="text-black mb-4">Permissions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedStaff.permissions.mealsCrud ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={selectedStaff.permissions.mealsCrud ? 'text-black' : 'text-gray-400'}>
                      Meals CRUD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedStaff.permissions.stockCrud ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={selectedStaff.permissions.stockCrud ? 'text-black' : 'text-gray-400'}>
                      Stock CRUD
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedStaff.permissions.reportsView ? 'bg-black' : 'bg-gray-300'}`} />
                    <span className={selectedStaff.permissions.reportsView ? 'text-black' : 'text-gray-400'}>
                      Reports View
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="text-black mb-4">Activity Log</h3>
                <div className="space-y-3">
                  {staffActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-black">{activity.action}</span>
                        <span className="text-gray-400 ml-2">- {activity.date}</span>
                      </div>
                    </div>
                  ))}
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