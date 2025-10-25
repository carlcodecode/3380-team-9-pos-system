import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, FileText, LogOut, Clock, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

// Mock Activity Data
const mockActivity = [
  { type: 'hire', staffName: 'John Smith', staffId: '001', action: 'New hire', details: 'John Smith', date: '10/20/25', time: '10:00 AM' },
  { type: 'update', staffName: 'Jane Doe', staffId: '002', action: 'Update', details: 'Jane Doe salary', date: '10/22/25', time: '02:30 PM' },
  { type: 'hire', staffName: 'Mike Johnson', staffId: '003', action: 'New hire', details: 'Mike Johnson', date: '10/18/25', time: '11:00 AM' },
  { type: 'update', staffName: 'Sarah Williams', staffId: '004', action: 'Status change', details: 'Sarah Williams to inactive', date: '10/15/25', time: '05:00 PM' },
];

export const AdminOverview = ({ totalStaff, activeStaff, inactiveStaff, onNavigate, onLogout }) => {
  return (
    <div className="grid lg:grid-cols-4 gap-8">
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
      <div className="lg:col-span-3 space-y-6">
        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h2 className="text-black mb-4">System Stats</h2>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Total Staff:</span>
              <Badge className="bg-gray-100 text-black border-0">{totalStaff}</Badge>
            </div>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Active:</span>
              <Badge className="bg-black text-white border-0">{activeStaff}</Badge>
            </div>
            <div className="text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Inactive:</span>
              <Badge className="bg-gray-200 text-black border-0">{inactiveStaff}</Badge>
            </div>
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
            {mockActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-black">{activity.action}:</span>{' '}
                  <span className="text-gray-600">{activity.details}</span>{' '}
                  <span className="text-gray-400">- {activity.date}</span>
                </div>
              </div>
            ))}
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
