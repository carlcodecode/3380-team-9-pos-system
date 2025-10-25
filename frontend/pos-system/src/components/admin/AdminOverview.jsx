import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, FileText, LogOut, Clock, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import * as api from '../../services/api';

export const AdminOverview = ({ totalStaff, activeStaff, inactiveStaff, onNavigate, onLogout }) => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actualTotalStaff, setActualTotalStaff] = useState(0);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const res = await api.getAllStaff();
      const staffList = res.staff || [];
      
      // Set actual total staff count
      setActualTotalStaff(staffList.length);
      
      // Create activity entries from staff data
      const activities = [];
      
      staffList.forEach(staff => {
        // Add hire activity (based on created_at)
        if (staff.created_at) {
          activities.push({
            type: 'hire',
            action: 'New hire',
            details: `${staff.first_name} ${staff.last_name}`,
            date: new Date(staff.created_at),
            staffId: staff.staff_id
          });
        }
        
        // Add update activity if updated_at is different from created_at
        if (staff.updated_at && staff.created_at && staff.updated_at !== staff.created_at) {
          activities.push({
            type: 'update',
            action: 'Staff updated',
            details: `${staff.first_name} ${staff.last_name} - Account modified`,
            date: new Date(staff.updated_at),
            staffId: staff.staff_id
          });
        }
      });
      
      // Sort by date (most recent first) and take top 10
      const sortedActivities = activities
        .sort((a, b) => b.date - a.date)
        .slice(0, 10);
      
      setRecentActivity(sortedActivities);
    } catch (error) {
      console.error('Failed to fetch staff activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }).format(date);
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8 mt-8">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:col-span-1"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-2 sticky top-24">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-lg hover:bg-gray-100 text-black"
            onClick={() => onNavigate('staff-list')}
          >
            <Users className="w-4 h-4" />
            Staff Management
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-lg hover:bg-gray-100 text-black"
            onClick={() => onNavigate('reports')}
          >
            <FileText className="w-4 h-4" />
            Reports
          </Button>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 rounded-lg hover:bg-gray-100 text-black"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:col-span-4 space-y-6">
        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h2 className="text-black mb-4">System Stats</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Total Staff:</span>
            <span className="text-black font-semibold text-lg">{actualTotalStaff}</span>
          </div>
        </motion.div>

        {/* Recent Staff Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-black mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Staff Activity
          </h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-500 py-4">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent activity</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-black">{activity.action}:</span>{' '}
                    <span className="text-gray-600">{activity.details}</span>{' '}
                    <span className="text-gray-400">- {formatDate(activity.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h3 className="text-black mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
              onClick={() => onNavigate('staff-add')}
            >
              <UserPlus className="w-4 h-4" />
              Add Staff
            </Button>
            <Button 
              className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
              onClick={() => onNavigate('reports')}
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="text-black">Note:</span> Access limited to staff CRUD and meal creation reports.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
