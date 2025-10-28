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
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import * as api from '../../services/api';

export const StaffReports = ({ viewMode, onViewModeChange }) => {
  const [reportDateFrom, setReportDateFrom] = useState('2025-10-01');
  const [reportDateTo, setReportDateTo] = useState('2025-10-27');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    
    try {
      const response = await api.getMealSalesReport({
        start_date: reportDateFrom,
        end_date: reportDateTo
      });
      
      // Ensure numeric values are parsed correctly
      const normalizedData = (response.data || []).map(item => ({
        ...item,
        meal_id: parseInt(item.meal_id),
        total_quantity_sold: parseInt(item.total_quantity_sold) || 0,
        total_revenue: parseInt(item.total_revenue) || 0,
        average_price: parseInt(item.average_price) || 0
      }));
      
      setReportData(normalizedData);
      onViewModeChange('report-view');
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
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
  // Total Quantity Sold: Sum of all quantities across all meals in the date range
  const totalQuantitySold = reportData.reduce((sum, item) => sum + item.total_quantity_sold, 0);
  
  // Total Revenue: Sum of all meal revenues in the date range (in cents)
  const totalRevenue = reportData.reduce((sum, item) => sum + item.total_revenue, 0);
  
  // Top Selling Meal: Meal with the highest quantity sold in the date range
  const topSellingMeal = reportData.length > 0 
    ? reportData.reduce((prev, current) => 
        (current.total_quantity_sold > prev.total_quantity_sold) ? current : prev
      )
    : null;
  
  // Highest Revenue Meal: Meal with the highest total revenue in the date range
  const highestRevenueMeal = reportData.length > 0
    ? reportData.reduce((prev, current) => 
        (current.total_revenue > prev.total_revenue) ? current : prev
      )
    : null;

  // Report Selection View
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
                onClick={() => onViewModeChange('dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">Reports - Meal Sales</h2>
            </div>
          </div>

          <div className="space-y-6">
            {/* Available Reports */}
            <div>
              <h3 className="text-black mb-4">Available Reports</h3>
              <div className="space-y-3">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-black transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-black" />
                    <span className="text-black">Meal Sales Report</span>
                  </div>
                  <p className="text-sm text-gray-500">View detailed sales data including meal names, quantities sold, and total revenue</p>
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
                    max={new Date().toISOString().split('T')[0]}
                    className="rounded-lg border-gray-200"
                  />
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
                onClick={() => onViewModeChange('reports')}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-black">
                Report: Meal Sales ({reportDateFrom} - {reportDateTo})
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
                onClick={() => onViewModeChange('reports')}
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
                <span className="text-gray-500 w-40">Total Quantity Sold:</span>
                <span className="text-black">{totalQuantitySold.toLocaleString()}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Total Revenue:</span>
                <span className="text-black">
                  ${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Top Selling Meal:</span>
                <span className="text-black">
                  {topSellingMeal?.meal_name || 'N/A'} ({topSellingMeal?.total_quantity_sold.toLocaleString()} units)
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-40">Highest Revenue Meal:</span>
                <span className="text-black">
                  {highestRevenueMeal?.meal_name || 'N/A'} (${((highestRevenueMeal?.total_revenue || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h3 className="text-black mb-4">Detailed Sales by Meal</h3>
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

          {/* Bar Graph - Revenue by Meal */}
          <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-black" />
              <h4 className="text-black font-semibold">Revenue Distribution by Meal</h4>
            </div>
            
            {reportData.length > 0 && (
              <div className="space-y-4">
                {reportData
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .slice(0, 10) // Show top 10 meals
                  .map((meal, index) => {
                    const percentOfTotal = totalRevenue > 0 
                      ? (meal.total_revenue / totalRevenue) * 100 
                      : 0;
                    
                    return (
                      <div key={meal.meal_id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-gray-500 font-mono text-xs w-6 flex-shrink-0">
                              #{index + 1}
                            </span>
                            <span className="text-black font-medium truncate">
                              {meal.meal_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                            <span className="text-gray-600 text-xs font-mono">
                              {meal.total_quantity_sold} units
                            </span>
                            <span className="text-black font-semibold min-w-[80px] text-right">
                              ${(meal.total_revenue / 100).toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </span>
                            <span className="text-black font-bold min-w-[50px] text-right">
                              {percentOfTotal.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Bar Graph */}
                        <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentOfTotal}%` }}
                            transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                            className="absolute left-0 top-0 h-full bg-black rounded-lg"
                            style={{
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {percentOfTotal > 5 && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                                {percentOfTotal.toFixed(1)}%
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                
                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded"></div>
                      <span>Revenue %</span>
                    </div>
                    <span>• Showing top 10 meals by revenue</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-black">
                      Total: ${(totalRevenue / 100).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {reportData.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No data available to display</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
