import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from '../shared/Navbar';
import { AdminOverview } from './AdminOverview';
import { StaffManagement } from './StaffManagement';
import { ReportsManagement } from './ReportsManagement';
import { motion } from 'motion/react';

// Mock Staff Data for stats
const mockStaff = [
  { id: '001', status: 'active' },
  { id: '002', status: 'active' },
  { id: '003', status: 'active' },
  { id: '004', status: 'inactive' },
  { id: '005', status: 'active' },
];

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const [viewMode, setViewMode] = useState('dashboard');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const totalStaff = mockStaff.length;
  const activeStaff = mockStaff.filter(s => s.status === 'active').length;
  const inactiveStaff = mockStaff.filter(s => s.status === 'inactive').length;

  const handleNavigate = (view) => {
    setViewMode(view);
    if (view === 'staff-add') {
      setSelectedStaff(null);
    }
    // Refresh AdminOverview when navigating back to dashboard
    if (view === 'dashboard') {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h1 className="text-black mb-2">Admin Dashboard - Staff & Reports Management</h1>
            <p className="text-gray-500">Manage staff and generate meal creation reports</p>
          </div>
        </motion.div>

        {/* Dynamic Content Based on View Mode */}
        {viewMode === 'dashboard' && (
          <AdminOverview
            key={refreshKey}
            totalStaff={totalStaff}
            activeStaff={activeStaff}
            inactiveStaff={inactiveStaff}
            onNavigate={handleNavigate}
            onLogout={logout}
          />
        )}
        
        {(viewMode === 'staff-list' || viewMode === 'staff-add' || viewMode === 'staff-edit' || viewMode === 'staff-view') && (
          <StaffManagement
            viewMode={viewMode}
            onNavigate={handleNavigate}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
          />
        )}
        
        {(viewMode === 'reports' || viewMode === 'report-view') && (
          <ReportsManagement
            viewMode={viewMode}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
};
