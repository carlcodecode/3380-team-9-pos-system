import React, { useState } from 'react';
import { Button } from '../../../components/ui/button.jsx';
import { Input } from '../../../components/ui/input.jsx';
import { Label } from '../../../components/ui/label.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table.jsx';
import {
  Search,
  Download,
  ArrowLeft,
  BarChart3,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';

// Mock Meal Creation Reports
const mockMealReports = [
  { staffName: 'John Smith', staffId: '001', mealId: '005', mealName: 'Vegan Bowl', createdAt: '10/20/25 09:00 AM' },
  { staffName: 'John Smith', staffId: '001', mealId: '006', mealName: 'Keto Salad', createdAt: '10/21/25 10:30 AM' },
  { staffName: 'Jane Doe', staffId: '002', mealId: '007', mealName: 'Halal Wrap', createdAt: '10/22/25 11:00 AM' },
  { staffName: 'Mike Johnson', staffId: '003', mealId: '008', mealName: 'Protein Box', createdAt: '10/22/25 02:00 PM' },
  { staffName: 'Tom Brown', staffId: '005', mealId: '009', mealName: 'Asian Fusion', createdAt: '10/23/25 08:30 AM' },
];

export const ReportGeneration = ({ onBack }) => {
  const [viewMode, setViewMode] = useState('dashboard');
  const [reportDateFrom, setReportDateFrom] = useState('2025-10-01');
  const [reportDateTo, setReportDateTo] = useState('2025-10-24');
  const [reportStaffSearch, setReportStaffSearch] = useState('');

  // Filtered report data
  const filteredReports = mockMealReports.filter(report => {
    const matchesStaff = report.staffName.toLowerCase().includes(reportStaffSearch.toLowerCase()) ||
                        report.staffId.includes(reportStaffSearch);
    return matchesStaff;
  });

  // Reports Dashboard
  const renderReportsDashboard = () => (
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
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h2 className="text-black">Reports - Staff Activity</h2>
          </div>
        </div>

        <div className="space-y-6">
          {/* Available Reports */}
          <div>
            <h3 className="text-black mb-4">Available Reports</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-black" />
                  <span className="text-black">Staff Creation/Updates Log</span>
                </div>
                <p className="text-sm text-gray-500">View all staff account creations and modifications</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-black" />
                  <span className="text-black">Meals Created by Staff</span>
                </div>
                <p className="text-sm text-gray-500">Track meal creation activity by staff members</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-black" />
                  <span className="text-black">Custom: Staff Productivity (Meals/Stock)</span>
                </div>
                <p className="text-sm text-gray-500">Analyze staff productivity metrics</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-black mb-4">Filters</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Date Range - From</Label>
                <Input
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Date Range - To</Label>
                <Input
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Staff ID/Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search staff..."
                    value={reportStaffSearch}
                    onChange={(e) => setReportStaffSearch(e.target.value)}
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
            onClick={() => setViewMode('view')}
          >
            <BarChart3 className="w-4 h-4" />
            Run Report
          </Button>
        </div>
      </motion.div>
    </div>
  );

  // Report View
  const renderReportView = () => {
    const topCreator = mockMealReports.reduce((acc, report) => {
      acc[report.staffName] = (acc[report.staffName] || 0) + 1;
      return acc;
    }, {});

    const topCreatorName = Object.keys(topCreator).reduce((a, b) => 
      topCreator[a] > topCreator[b] ? a : b
    );
    const topCreatorCount = topCreator[topCreatorName];

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
                onClick={() => setViewMode('dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">
                Report: Meals Created by Staff ({reportDateFrom} - {reportDateTo})
              </h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg border-gray-200 gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg border-gray-200 gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-gray-200"
                onClick={() => setViewMode('dashboard')}
              >
                New Report
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-black mb-4">Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex">
                <span className="text-gray-500 w-40">Total Meals Created:</span>
                <span className="text-black">{filteredReports.length}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Top Creator:</span>
                <span className="text-black">{topCreatorName} ({topCreatorCount} meals)</span>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h3 className="text-black mb-4">Detailed Table</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-black">Staff Name</TableHead>
                    <TableHead className="text-black">Staff ID</TableHead>
                    <TableHead className="text-black">Meal ID</TableHead>
                    <TableHead className="text-black">Meal Name</TableHead>
                    <TableHead className="text-black">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-black">{report.staffName}</TableCell>
                      <TableCell className="text-gray-600">{report.staffId}</TableCell>
                      <TableCell className="text-gray-600">{report.mealId}</TableCell>
                      <TableCell className="text-black">{report.mealName}</TableCell>
                      <TableCell className="text-gray-600">{report.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="mt-6 p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-black mb-2">Bar Graph - Staff vs. Meals Created</h4>
            <p className="text-sm text-gray-500">Visual representation of meal creation by staff</p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      {viewMode === 'dashboard' && renderReportsDashboard()}
      {viewMode === 'view' && renderReportView()}
    </>
  );
};