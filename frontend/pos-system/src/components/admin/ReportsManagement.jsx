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

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Staff Name',
        'Staff ID',
        'Meal ID',
        'Meal Name',
        'Price',
        'Cost',
        'Status',
        'Activity Date'
      ];

      // Prepare CSV rows
      const rows = filteredReports.map(report => [
        `${report.first_name} ${report.last_name}`,
        report.staff_id,
        report.meal_id,
        report.meal_name,
        `$${((report.price_cents || 0) / 100).toFixed(2)}`,
        `$${((report.cost_cents || 0) / 100).toFixed(2)}`,
        report.meal_status || 'N/A',
        new Date(report.activity_timestamp).toLocaleString()
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `staff_report_${selectedReportType}_${reportDateFrom}_to_${reportDateTo}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
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

      const reportTitle = selectedReportType === 'meals-created' 
        ? 'Meals Created by Staff' 
        : 'Meals Updated by Staff';

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle} Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #000;
            }
            h1 {
              color: #000;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .summary {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              padding: 20px;
              margin-bottom: 30px;
              border-radius: 8px;
            }
            .summary h2 {
              margin-top: 0;
              color: #000;
              font-size: 18px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 15px;
            }
            .summary-item {
              display: flex;
            }
            .summary-label {
              color: #6b7280;
              min-width: 150px;
            }
            .summary-value {
              color: #000;
              font-weight: 500;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f9fafb;
              color: #000;
              font-weight: 600;
              text-align: left;
              padding: 12px;
              border: 1px solid #e5e7eb;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #e5e7eb;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <p style="color: #6b7280; margin-bottom: 30px;">
            Report Period: ${reportDateFrom} to ${reportDateTo}
          </p>

          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Total Records:</span>
                <span class="summary-value">${filteredReports.length}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Top Contributor:</span>
                <span class="summary-value">${topCreatorName} (${topCreatorCount} ${selectedReportType === 'meals-created' ? 'created' : 'updated'})</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Date Range:</span>
                <span class="summary-value">${reportDateFrom} to ${reportDateTo}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Unique Staff:</span>
                <span class="summary-value">${Object.keys(staffCounts).length}</span>
              </div>
            </div>
          </div>

          <h2 style="margin-bottom: 15px;">Detailed Table</h2>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Staff ID</th>
                <th>Meal ID</th>
                <th>Meal Name</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Activity Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReports.map(report => `
                <tr>
                  <td>${report.first_name} ${report.last_name}</td>
                  <td>${report.staff_id}</td>
                  <td>${report.meal_id}</td>
                  <td>${report.meal_name}</td>
                  <td>$${((report.price_cents || 0) / 100).toFixed(2)}</td>
                  <td>$${((report.cost_cents || 0) / 100).toFixed(2)}</td>
                  <td>${report.meal_status || 'N/A'}</td>
                  <td>${new Date(report.activity_timestamp).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>POS System - Staff Activity Report</p>
          </div>
        </body>
        </html>
      `;

      // Create blob and open in new window for printing
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            toast.success('PDF ready for printing/saving');
          }, 250);
        };
      } else {
        toast.error('Please allow popups to export PDF');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

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

  // Filtered report data for client-side search by name (exact match or contains)
  const filteredReports = reportData.filter(report => {
    if (!reportStaffSearch) return true;
    
    // If it's a number, it was already filtered by backend, so show all results
    if (!isNaN(reportStaffSearch)) return true;
    
    // For name search, do case-insensitive exact match on full name or partial match
    const searchLower = reportStaffSearch.toLowerCase().trim();
    const firstName = (report.first_name || '').toLowerCase();
    const lastName = (report.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    
    // Match if search term equals first name, last name, or full name
    // OR if full name contains the search term
    return (
      firstName === searchLower ||
      lastName === searchLower ||
      fullName === searchLower ||
      fullName.includes(searchLower)
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
                  <Label>Filter by Staff ID or Name (Optional)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Enter staff ID (e.g., 2) or full name (e.g., John Doe)..."
                      value={reportStaffSearch}
                      onChange={(e) => setReportStaffSearch(e.target.value)}
                      className="pl-10 rounded-lg border-gray-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Staff ID filters at database level. Names filter results after loading (exact or partial match).
                  </p>
                </div>
              </div>
            </div>

            {/* Available Reports */}
            <div>
              <h3 className="text-black mb-4">Available Reports</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => handleRunReport('meals-created')}
                  disabled={loading}
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 w-full"
                >
                  <FileText className="w-4 h-4" />
                  {loading && selectedReportType === 'meals-created' ? 'Generating Report...' : 'Meals Created by Staff'}
                </Button>
                <Button
                  onClick={() => handleRunReport('meals-updated')}
                  disabled={loading}
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 w-full"
                >
                  <FileText className="w-4 h-4" />
                  {loading && selectedReportType === 'meals-updated' ? 'Generating Report...' : 'Meals Updated by Staff'}
                </Button>
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
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg border-gray-200 gap-2"
                onClick={exportToCSV}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg border-gray-200 gap-2"
                onClick={exportToPDF}
              >
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
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
        </motion.div>
      </div>
    );
  }

  return null;
};
