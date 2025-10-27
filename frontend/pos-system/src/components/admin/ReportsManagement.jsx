import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  FileText,
  Search,
  Download,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import * as api from '../../services/api';

export const ReportsManagement = ({ viewMode, onNavigate }) => {
  const [reportDateFrom, setReportDateFrom] = useState('2025-10-01');
  const [reportDateTo, setReportDateTo] = useState('2025-10-25');
  const [reportStaffSearch, setReportStaffSearch] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportMeta, setReportMeta] = useState(null);

  // Fetch report data
  const handleRunReport = async (reportType) => {
    try {
      setLoading(true);
      setSelectedReportType(reportType);

      const params = {
        start_date: reportDateFrom,
        end_date: reportDateTo,
      };

      // Add staff_id filter if search query is numeric
      if (reportStaffSearch && !isNaN(reportStaffSearch)) {
        params.staff_id = reportStaffSearch;
      }

      let response;
      if (reportType === 'meals-created') {
        response = await api.getStaffMealCreatedReport(params);
      } else if (reportType === 'meals-updated') {
        response = await api.getStaffMealUpdatedReport(params);
      }

      setReportData(response.data || []);
      setReportMeta({
        report: response.report,
        filters: response.filters,
        count: response.count,
      });

      onNavigate('report-view');
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Filtered report data for client-side search by name
  const filteredReports = reportData.filter(report => {
    if (!reportStaffSearch) return true;
    const searchLower = reportStaffSearch.toLowerCase();
    return (
      report.first_name?.toLowerCase().includes(searchLower) ||
      report.last_name?.toLowerCase().includes(searchLower) ||
      `${report.first_name} ${report.last_name}`.toLowerCase().includes(searchLower)
    );
  });

  // Reports Dashboard
  if (viewMode === 'reports') {
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
                onClick={() => onNavigate('dashboard')}
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
                <button
                  onClick={() => handleRunReport('meals-created')}
                  disabled={loading}
                  className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-black transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-black" />
                    <span className="text-black">Meals Created by Staff</span>
                  </div>
                  <p className="text-sm text-gray-500">Track meal creation activity by staff members</p>
                </button>
                <button
                  onClick={() => handleRunReport('meals-updated')}
                  disabled={loading}
                  className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-black transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-black" />
                    <span className="text-black">Meals Updated by Staff</span>
                  </div>
                  <p className="text-sm text-gray-500">View all meal modifications by staff members</p>
                </button>
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
                  <Label>Staff ID or Name (Optional)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter staff ID or search by name..."
                      value={reportStaffSearch}
                      onChange={(e) => setReportStaffSearch(e.target.value)}
                      className="pl-10 rounded-lg border-gray-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use numeric ID for backend filtering, or name for client-side search
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4">
                <p className="text-gray-500">Generating report...</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Report View
  if (viewMode === 'report-view') {
    // Calculate statistics
    const staffCounts = filteredReports.reduce((acc, report) => {
      const staffName = `${report.first_name} ${report.last_name}`;
      acc[staffName] = (acc[staffName] || 0) + 1;
      return acc;
    }, {});

    const topCreatorName = Object.keys(staffCounts).length > 0
      ? Object.keys(staffCounts).reduce((a, b) => staffCounts[a] > staffCounts[b] ? a : b)
      : 'N/A';
    const topCreatorCount = staffCounts[topCreatorName] || 0;

    const getReportTitle = () => {
      if (selectedReportType === 'meals-created') {
        return `Meals Created by Staff`;
      } else if (selectedReportType === 'meals-updated') {
        return `Meals Updated by Staff`;
      }
      return 'Staff Activity Report';
    };

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
                onClick={() => onNavigate('reports')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">
                Report: {getReportTitle()} ({reportDateFrom} - {reportDateTo})
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
                onClick={() => onNavigate('reports')}
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
                <span className="text-gray-500 w-40">Total Records:</span>
                <span className="text-black">{filteredReports.length}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Top Contributor:</span>
                <span className="text-black">
                  {topCreatorName} ({topCreatorCount} {selectedReportType === 'meals-created' ? 'created' : 'updated'})
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Date Range:</span>
                <span className="text-black">{reportDateFrom} to {reportDateTo}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Unique Staff:</span>
                <span className="text-black">{Object.keys(staffCounts).length}</span>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h3 className="text-black mb-4">Detailed Table</h3>
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No records found for the selected filters
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-black">Staff Name</TableHead>
                      <TableHead className="text-black">Staff ID</TableHead>
                      <TableHead className="text-black">Meal ID</TableHead>
                      <TableHead className="text-black">Meal Name</TableHead>
                      <TableHead className="text-black">Price</TableHead>
                      <TableHead className="text-black">Cost</TableHead>
                      <TableHead className="text-black">Status</TableHead>
                      <TableHead className="text-black">Activity Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-black">
                          {report.first_name} {report.last_name}
                        </TableCell>
                        <TableCell className="text-gray-600">{report.staff_id}</TableCell>
                        <TableCell className="text-gray-600">{report.meal_id}</TableCell>
                        <TableCell className="text-black">{report.meal_name}</TableCell>
                        <TableCell className="text-gray-600">
                          ${((report.price_cents || 0) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          ${((report.cost_cents || 0) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {report.meal_status || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(report.activity_timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Chart Placeholder */}
          <div className="mt-6 p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-black mb-2">Bar Graph - Staff vs. Meals {selectedReportType === 'meals-created' ? 'Created' : 'Updated'}</h4>
            <p className="text-sm text-gray-500">Visual representation of meal activity by staff</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
