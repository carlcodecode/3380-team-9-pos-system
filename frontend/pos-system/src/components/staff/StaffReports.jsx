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
  Download,
  BarChart3,
  X,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';

// Mock data for meal sales report
const generateMockMealSalesData = (startDate, endDate) => {
  return [
    {
      meal_id: 1,
      meal_name: 'Classic Burger',
      total_quantity_sold: 145,
      total_revenue: 217500, // in cents
      average_price: 1500,
    },
    {
      meal_id: 2,
      meal_name: 'Caesar Salad',
      total_quantity_sold: 89,
      total_revenue: 106800,
      average_price: 1200,
    },
    {
      meal_id: 3,
      meal_name: 'Margherita Pizza',
      total_quantity_sold: 132,
      total_revenue: 237600,
      average_price: 1800,
    },
    {
      meal_id: 4,
      meal_name: 'Grilled Chicken',
      total_quantity_sold: 67,
      total_revenue: 114900,
      average_price: 1700,
    },
    {
      meal_id: 5,
      meal_name: 'Fish & Chips',
      total_quantity_sold: 98,
      total_revenue: 156800,
      average_price: 1600,
    },
    {
      meal_id: 6,
      meal_name: 'Pasta Carbonara',
      total_quantity_sold: 76,
      total_revenue: 106400,
      average_price: 1400,
    },
    {
      meal_id: 7,
      meal_name: 'Veggie Wrap',
      total_quantity_sold: 54,
      total_revenue: 59400,
      average_price: 1100,
    },
    {
      meal_id: 8,
      meal_name: 'Chocolate Cake',
      total_quantity_sold: 112,
      total_revenue: 78400,
      average_price: 700,
    },
  ];
};

export const StaffReports = ({ open, onClose }) => {
  const [reportDateFrom, setReportDateFrom] = useState('2025-10-01');
  const [reportDateTo, setReportDateTo] = useState('2025-10-26');
  const [reportData, setReportData] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData = generateMockMealSalesData(reportDateFrom, reportDateTo);
      setReportData(mockData);
      setShowReport(true);
      setLoading(false);
      toast.success('Report generated successfully');
    }, 500);
  };

  const handleBack = () => {
    setShowReport(false);
    setReportData([]);
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Meal ID',
        'Meal Name',
        'Quantity Sold',
        'Average Price',
        'Total Revenue',
        '% of Total'
      ];

      const totalRevenue = reportData.reduce((sum, item) => sum + item.total_revenue, 0);

      // Prepare CSV rows
      const rows = reportData
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .map(meal => {
          const percentOfTotal = totalRevenue > 0 ? (meal.total_revenue / totalRevenue) * 100 : 0;
          return [
            meal.meal_id,
            meal.meal_name,
            meal.total_quantity_sold,
            `$${(meal.average_price / 100).toFixed(2)}`,
            `$${(meal.total_revenue / 100).toFixed(2)}`,
            `${percentOfTotal.toFixed(1)}%`
          ];
        });

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
      link.setAttribute('download', `meal_sales_report_${reportDateFrom}_to_${reportDateTo}.csv`);
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
      const totalQuantitySold = reportData.reduce((sum, item) => sum + item.total_quantity_sold, 0);
      const totalRevenue = reportData.reduce((sum, item) => sum + item.total_revenue, 0);
      const topSellingMeal = reportData.length > 0 
        ? reportData.reduce((prev, current) => prev.total_quantity_sold > current.total_quantity_sold ? prev : current)
        : null;
      const highestRevenueMeal = reportData.length > 0
        ? reportData.reduce((prev, current) => prev.total_revenue > current.total_revenue ? prev : current)
        : null;

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Meal Sales Report</title>
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
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .summary-label {
              color: #6b7280;
              font-size: 12px;
              margin-bottom: 5px;
            }
            .summary-value {
              color: #000;
              font-weight: 600;
              font-size: 18px;
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
            th.right, td.right {
              text-align: right;
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
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }
            .badge-high {
              background-color: #000;
              color: #fff;
            }
            .badge-normal {
              background-color: #f3f4f6;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <h1>Meal Sales Report</h1>
          <p style="color: #6b7280; margin-bottom: 30px;">
            Report Period: ${reportDateFrom} to ${reportDateTo}
          </p>

          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Quantity Sold</div>
                <div class="summary-value">${totalQuantitySold.toLocaleString()}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value">$${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Top Selling Meal</div>
                <div class="summary-value" style="font-size: 14px;">${topSellingMeal?.meal_name || 'N/A'}</div>
                <div style="color: #6b7280; font-size: 12px;">${topSellingMeal?.total_quantity_sold.toLocaleString()} units</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Highest Revenue Meal</div>
                <div class="summary-value" style="font-size: 14px;">${highestRevenueMeal?.meal_name || 'N/A'}</div>
                <div style="color: #6b7280; font-size: 12px;">$${((highestRevenueMeal?.total_revenue || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>

          <h2 style="margin-bottom: 15px;">Detailed Sales by Meal</h2>
          <table>
            <thead>
              <tr>
                <th>Meal ID</th>
                <th>Meal Name</th>
                <th class="right">Quantity Sold</th>
                <th class="right">Avg Price</th>
                <th class="right">Total Revenue</th>
                <th class="right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .sort((a, b) => b.total_revenue - a.total_revenue)
                .map(meal => {
                  const percentOfTotal = totalRevenue > 0 ? (meal.total_revenue / totalRevenue) * 100 : 0;
                  const badgeClass = percentOfTotal > 20 ? 'badge-high' : 'badge-normal';
                  return `
                    <tr>
                      <td>${meal.meal_id}</td>
                      <td><strong>${meal.meal_name}</strong></td>
                      <td class="right">${meal.total_quantity_sold.toLocaleString()}</td>
                      <td class="right">$${(meal.average_price / 100).toFixed(2)}</td>
                      <td class="right"><strong>$${(meal.total_revenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
                      <td class="right"><span class="badge ${badgeClass}">${percentOfTotal.toFixed(1)}%</span></td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>POS System - Meal Sales Report</p>
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

  // Calculate statistics
  const totalQuantitySold = reportData.reduce((sum, item) => sum + item.total_quantity_sold, 0);
  const totalRevenue = reportData.reduce((sum, item) => sum + item.total_revenue, 0);
  const topSellingMeal = reportData.length > 0 
    ? reportData.reduce((prev, current) => prev.total_quantity_sold > current.total_quantity_sold ? prev : current)
    : null;
  const highestRevenueMeal = reportData.length > 0
    ? reportData.reduce((prev, current) => prev.total_revenue > current.total_revenue ? prev : current)
    : null;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-black" />
              <h2 className="text-black">Meal Sales Report</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {!showReport ? (
              // Report Form
              <div className="space-y-6">
                <div>
                  <h3 className="text-black mb-4">Generate Meal Sales Report</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    View detailed sales data including meal names, quantities sold, and total revenue.
                  </p>
                </div>

                {/* Date Range Filters */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">Date Range - From</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={reportDateFrom}
                      onChange={(e) => setReportDateFrom(e.target.value)}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Date Range - To</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={reportDateTo}
                      onChange={(e) => setReportDateTo(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="rounded-lg border-gray-200"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-lg border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateReport}
                    disabled={loading}
                    className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            ) : (
              // Report View
              <div className="space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-black mb-1">
                      Meal Sales Report ({reportDateFrom} - {reportDateTo})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Total meals sold and revenue breakdown
                    </p>
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
                      onClick={handleBack}
                      className="rounded-lg border-gray-200"
                    >
                      New Report
                    </Button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-black" />
                      <span className="text-sm text-gray-500">Total Quantity Sold</span>
                    </div>
                    <div className="text-2xl text-black">{totalQuantitySold.toLocaleString()}</div>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-black p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-black" />
                      <span className="text-sm text-gray-500">Total Revenue</span>
                    </div>
                    <div className="text-2xl text-black">
                      ${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-black" />
                      <span className="text-sm text-gray-500">Top Selling</span>
                    </div>
                    <div className="text-sm text-black font-medium truncate">
                      {topSellingMeal?.meal_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {topSellingMeal?.total_quantity_sold.toLocaleString()} units
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-black" />
                      <span className="text-sm text-gray-500">Highest Revenue</span>
                    </div>
                    <div className="text-sm text-black font-medium truncate">
                      {highestRevenueMeal?.meal_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${((highestRevenueMeal?.total_revenue || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Detailed Table */}
                <div>
                  <h4 className="text-black mb-3">Detailed Sales by Meal</h4>
                  {reportData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No sales data found for the selected date range
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-black">Meal ID</TableHead>
                            <TableHead className="text-black">Meal Name</TableHead>
                            <TableHead className="text-black text-right">Quantity Sold</TableHead>
                            <TableHead className="text-black text-right">Avg Price</TableHead>
                            <TableHead className="text-black text-right">Total Revenue</TableHead>
                            <TableHead className="text-black text-right">% of Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData
                            .sort((a, b) => b.total_revenue - a.total_revenue)
                            .map((meal) => {
                              const percentOfTotal = totalRevenue > 0 
                                ? (meal.total_revenue / totalRevenue) * 100 
                                : 0;
                              
                              return (
                                <TableRow key={meal.meal_id}>
                                  <TableCell className="text-gray-600">
                                    {meal.meal_id}
                                  </TableCell>
                                  <TableCell className="text-black font-medium">
                                    {meal.meal_name}
                                  </TableCell>
                                  <TableCell className="text-right text-black">
                                    {meal.total_quantity_sold.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-gray-600">
                                    ${(meal.average_price / 100).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right text-black font-medium">
                                    ${(meal.total_revenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge 
                                      className={
                                        percentOfTotal > 20 
                                          ? 'bg-black text-white border-0' 
                                          : 'bg-gray-100 text-gray-700 border-0'
                                      }
                                    >
                                      {percentOfTotal.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Chart Placeholder */}
                <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-black mb-2">Bar Graph - Revenue by Meal</h4>
                  <p className="text-sm text-gray-500">
                    Visual representation of meal sales performance
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
