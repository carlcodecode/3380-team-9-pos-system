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
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-gray-200 gap-2"
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
