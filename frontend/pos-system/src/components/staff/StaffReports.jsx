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
  
  // Promo Analytics State
  const [promoReportData, setPromoReportData] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [reportType, setReportType] = useState('meal-sales'); // 'meal-sales' or 'promo-analytics'
  
  // Promo Analytics Filters
  const [minUses, setMinUses] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [minRevenue, setMinRevenue] = useState('');
  const [maxRevenue, setMaxRevenue] = useState('');
  const [minAvgOrder, setMinAvgOrder] = useState('');
  const [maxAvgOrder, setMaxAvgOrder] = useState('');

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

  const handleGeneratePromoReport = async () => {
    if (!reportDateFrom || !reportDateTo) {
      toast.error('Please select date range');
      return;
    }
    
    setPromoLoading(true);
    
    try {
      console.log('🔍 Fetching promo analytics with dates:', { 
        start_date: reportDateFrom, 
        end_date: reportDateTo 
      });
      
      const response = await api.getPromoAnalytics({
        start_date: reportDateFrom,
        end_date: reportDateTo,
      });
      
      console.log('📊 Promo analytics response:', response);
      
      let filteredData = response.promotions || [];
      
      console.log('📋 Initial data count:', filteredData.length);
      
      // Apply filters
      if (minUses !== '') {
        const min = Number(minUses);
        filteredData = filteredData.filter(p => p.total_uses >= min);
        console.log(`✅ After minUses filter (>= ${min}):`, filteredData.length);
      }
      if (maxUses !== '') {
        const max = Number(maxUses);
        filteredData = filteredData.filter(p => p.total_uses <= max);
        console.log(`✅ After maxUses filter (<= ${max}):`, filteredData.length);
      }
      if (minRevenue !== '') {
        const min = Number(minRevenue) * 100;
        filteredData = filteredData.filter(p => p.total_revenue >= min);
        console.log(`✅ After minRevenue filter (>= $${minRevenue}):`, filteredData.length);
      }
      if (maxRevenue !== '') {
        const max = Number(maxRevenue) * 100;
        filteredData = filteredData.filter(p => p.total_revenue <= max);
        console.log(`✅ After maxRevenue filter (<= $${maxRevenue}):`, filteredData.length);
      }
      if (minAvgOrder !== '') {
        const min = Number(minAvgOrder) * 100;
        filteredData = filteredData.filter(p => p.avg_order_value >= min);
        console.log(`✅ After minAvgOrder filter (>= $${minAvgOrder}):`, filteredData.length);
      }
      if (maxAvgOrder !== '') {
        const max = Number(maxAvgOrder) * 100;
        filteredData = filteredData.filter(p => p.avg_order_value <= max);
        console.log(`✅ After maxAvgOrder filter (<= $${maxAvgOrder}):`, filteredData.length);
      }
      
      console.log('✨ Final filtered data:', filteredData);
      
      setPromoReportData(filteredData);
      console.log('🎯 Setting viewMode to: promo-report-view');
      onViewModeChange('promo-report-view');
      toast.success('Promo Analytics report generated successfully!');
    } catch (error) {
      console.error('❌ Error generating promo analytics:', error);
      toast.error('Failed to generate promo analytics report: ' + error.message);
    } finally {
      setPromoLoading(false);
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

  // Export Promo Analytics to CSV
  const exportPromoToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Promo ID',
        'Code',
        'Description',
        'Discount %',
        'Total Uses',
        'Unique Customers',
        'Total Revenue',
        'Avg Order Value',
        'First Used',
        'Last Used'
      ];

      const totalPromoRevenue = promoReportData.reduce((sum, item) => sum + item.total_revenue, 0);

      // Prepare CSV rows
      const rows = promoReportData
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .map(promo => {
          return [
            promo.promotion_id,
            promo.promo_code,
            promo.promo_description,
            `${promo.promo_type}%`,
            promo.total_uses,
            promo.unique_customers,
            `$${(promo.total_revenue / 100).toFixed(2)}`,
            `$${(promo.avg_order_value / 100).toFixed(2)}`,
            promo.first_use_date ? new Date(promo.first_use_date).toLocaleDateString() : 'N/A',
            promo.last_use_date ? new Date(promo.last_use_date).toLocaleDateString() : 'N/A'
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
      link.setAttribute('download', `promo_analytics_report_${reportDateFrom}_to_${reportDateTo}.csv`);
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

  // Export Promo Analytics to PDF
  const exportPromoToPDF = () => {
    try {
      const totalPromoUses = promoReportData.reduce((sum, item) => sum + item.total_uses, 0);
      const totalPromoRevenue = promoReportData.reduce((sum, item) => sum + item.total_revenue, 0);
      const avgRevenuePerUse = totalPromoUses > 0 ? totalPromoRevenue / totalPromoUses : 0;
      const topPromo = promoReportData.length > 0
        ? promoReportData.reduce((prev, current) =>
            (current.total_revenue > prev.total_revenue) ? current : prev
          )
        : null;

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Promo Analytics Report</title>
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
              grid-template-columns: repeat(4, 1fr);
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
            .top-promo {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              margin-top: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 11px;
            }
            th {
              background-color: #f9fafb;
              color: #000;
              font-weight: 600;
              text-align: left;
              padding: 10px 8px;
              border: 1px solid #e5e7eb;
            }
            th.right, td.right {
              text-align: right;
            }
            td {
              padding: 8px;
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
              font-size: 11px;
              font-weight: 500;
              background-color: #000;
              color: #fff;
            }
          </style>
        </head>
        <body>
          <h1>Promo Analytics Report</h1>
          <p style="color: #6b7280; margin-bottom: 30px;">
            Report Period: ${reportDateFrom} to ${reportDateTo}
          </p>

          <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">Total Promotions</div>
                <div class="summary-value">${promoReportData.length}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Uses</div>
                <div class="summary-value">${totalPromoUses.toLocaleString()}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Total Revenue</div>
                <div class="summary-value">$${(totalPromoRevenue / 100).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Avg Revenue/Use</div>
                <div class="summary-value">$${(avgRevenuePerUse / 100).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}</div>
              </div>
            </div>
            ${topPromo ? `
              <div class="top-promo">
                <div class="summary-label">Top Performing Promo</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                  <div>
                    <div style="font-weight: 600; color: #000;">${topPromo.promo_code}</div>
                    <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${topPromo.promo_description}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 600; color: #000;">$${(topPromo.total_revenue / 100).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}</div>
                    <div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${topPromo.total_uses} uses</div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          <h2 style="margin-bottom: 15px;">Promo Code Performance Details</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Description</th>
                <th class="right">Discount</th>
                <th class="right">Uses</th>
                <th class="right">Customers</th>
                <th class="right">Revenue</th>
                <th class="right">Avg Order</th>
                <th>First Used</th>
                <th>Last Used</th>
              </tr>
            </thead>
            <tbody>
              ${promoReportData
                .sort((a, b) => b.total_revenue - a.total_revenue)
                .map(promo => `
                  <tr>
                    <td>${promo.promotion_id}</td>
                    <td><span class="badge">${promo.promo_code}</span></td>
                    <td style="max-width: 200px;">${promo.promo_description}</td>
                    <td class="right">${promo.promo_type}%</td>
                    <td class="right"><strong>${promo.total_uses.toLocaleString()}</strong></td>
                    <td class="right">${promo.unique_customers.toLocaleString()}</td>
                    <td class="right"><strong>$${(promo.total_revenue / 100).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}</strong></td>
                    <td class="right">$${(promo.avg_order_value / 100).toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}</td>
                    <td>${promo.first_use_date ? new Date(promo.first_use_date).toLocaleDateString() : 'N/A'}</td>
                    <td>${promo.last_use_date ? new Date(promo.last_use_date).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>POS System - Promo Analytics Report</p>
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
          <h2 className="text-black">
            Reports - {reportType === 'meal-sales' ? 'Meal Sales' : 'Promo Analytics'}
          </h2>
        </div>
        </div>

        <div className="space-y-6">
        {/* Report Type Selector */}
        <div>
          <Label className="text-black mb-2">Report Type</Label>
          <div className="flex gap-2">
            <Button
              variant={reportType === 'meal-sales' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReportType('meal-sales')}
              className={reportType === 'meal-sales' ? 'bg-black text-white' : ''}
            >
              Meal Sales
            </Button>
            <Button
              variant={reportType === 'promo-analytics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReportType('promo-analytics')}
              className={reportType === 'promo-analytics' ? 'bg-black text-white' : ''}
            >
              Promo Analytics
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div>
          <h3 className="text-black mb-4">Date Range</h3>
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

        {/* Promo Analytics Specific Filters */}
        {reportType === 'promo-analytics' && (
          <div>
            <h3 className="text-black mb-4">Additional Filters (Optional)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Min Uses</Label>
                <Input
                  type="number"
                  value={minUses}
                  onChange={(e) => setMinUses(e.target.value)}
                  placeholder="e.g., 3"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="e.g., 10"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Min Revenue ($)</Label>
                <Input
                  type="number"
                  value={minRevenue}
                  onChange={(e) => setMinRevenue(e.target.value)}
                  placeholder="e.g., 100"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Max Revenue ($)</Label>
                <Input
                  type="number"
                  value={maxRevenue}
                  onChange={(e) => setMaxRevenue(e.target.value)}
                  placeholder="e.g., 1000"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Min Avg Order ($)</Label>
                <Input
                  type="number"
                  value={minAvgOrder}
                  onChange={(e) => setMinAvgOrder(e.target.value)}
                  placeholder="e.g., 50"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label>Max Avg Order ($)</Label>
                <Input
                  type="number"
                  value={maxAvgOrder}
                  onChange={(e) => setMaxAvgOrder(e.target.value)}
                  placeholder="e.g., 200"
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Available Reports */}
        <div>
          <div className="space-y-3">
          <Button
            onClick={reportType === 'meal-sales' ? handleGenerateReport : handleGeneratePromoReport}
            disabled={reportType === 'meal-sales' ? loading : promoLoading}
            className="bg-black hover:bg-black text-white rounded-lg btn-glossy gap-2 w-full"
          >
            <FileText className="w-4 h-4" />
            {(reportType === 'meal-sales' ? loading : promoLoading) 
              ? 'Generating Report...' 
              : `Generate ${reportType === 'meal-sales' ? 'Meal Sales' : 'Promo Analytics'} Report`}
          </Button>
          </div>
        </div>
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

  // Promo Analytics Report View
  if (viewMode === 'promo-report-view') {
    // Calculate statistics for promo analytics
    const totalPromoUses = promoReportData.reduce((sum, item) => sum + item.total_uses, 0);
    const totalPromoRevenue = promoReportData.reduce((sum, item) => sum + item.total_revenue, 0);
    const avgRevenuePerUse = totalPromoUses > 0 ? totalPromoRevenue / totalPromoUses : 0;
    const topPromo = promoReportData.length > 0
      ? promoReportData.reduce((prev, current) =>
          (current.total_revenue > prev.total_revenue) ? current : prev
        )
      : null;

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
                Report: Promo Analytics ({reportDateFrom} - {reportDateTo})
              </h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg border-gray-200 gap-2"
                onClick={exportPromoToCSV}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg border-gray-200 gap-2"
                onClick={exportPromoToPDF}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Total Promotions</div>
                <div className="text-black text-2xl font-semibold">{promoReportData.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Total Uses</div>
                <div className="text-black text-2xl font-semibold">{totalPromoUses.toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Total Revenue</div>
                <div className="text-black text-2xl font-semibold">
                  ${(totalPromoRevenue / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Avg Revenue/Use</div>
                <div className="text-black text-2xl font-semibold">
                  ${(avgRevenuePerUse / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
            </div>
            {topPromo && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Top Performing Promo</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-black font-semibold">{topPromo.promo_code}</div>
                    <div className="text-gray-600 text-sm">{topPromo.promo_description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-black font-semibold">
                      ${(topPromo.total_revenue / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                    <div className="text-gray-500 text-sm">{topPromo.total_uses} uses</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Table */}
          <div>
            <h3 className="text-black mb-4">Promo Code Performance Details</h3>
            {promoReportData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No promo data found for the selected criteria
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-black">Promo ID</TableHead>
                      <TableHead className="text-black">Code</TableHead>
                      <TableHead className="text-black">Description</TableHead>
                      <TableHead className="text-black text-right">Discount %</TableHead>
                      <TableHead className="text-black text-right">Total Uses</TableHead>
                      <TableHead className="text-black text-right">Unique Customers</TableHead>
                      <TableHead className="text-black text-right">Total Revenue</TableHead>
                      <TableHead className="text-black text-right">Avg Order</TableHead>
                      <TableHead className="text-black">First Used</TableHead>
                      <TableHead className="text-black">Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promoReportData
                      .sort((a, b) => b.total_revenue - a.total_revenue)
                      .map((promo) => {
                        const isExpired = promo.promo_exp_date && new Date(promo.promo_exp_date) < new Date();
                        
                        return (
                          <TableRow key={promo.promotion_id}>
                            <TableCell>{promo.promotion_id}</TableCell>
                            <TableCell>
                              <Badge className="bg-black text-white border-0">
                                {promo.promo_code}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate">{promo.promo_description}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{promo.promo_type}%</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {promo.total_uses.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {promo.unique_customers.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-black">
                              ${(promo.total_revenue / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              ${(promo.avg_order_value / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </TableCell>
                            <TableCell>
                              {promo.first_use_date 
                                ? new Date(promo.first_use_date).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {promo.last_use_date
                                ? new Date(promo.last_use_date).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Bar Graph - Revenue by Promo */}
          <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-black" />
              <h4 className="text-black font-semibold">Revenue Distribution by Promo Code</h4>
            </div>
            
            {promoReportData.length > 0 && (
              <div className="space-y-4">
                {promoReportData
                  .sort((a, b) => b.total_revenue - a.total_revenue)
                  .slice(0, 10)
                  .map((promo, index) => {
                    const percentOfTotal = totalPromoRevenue > 0
                      ? (promo.total_revenue / totalPromoRevenue) * 100
                      : 0;

                    return (
                      <div key={promo.promotion_id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-mono text-xs w-6">
                              #{index + 1}
                            </span>
                            <span className="text-black font-medium">{promo.promo_code}</span>
                            <span className="text-gray-500 text-xs truncate max-w-xs">
                              {promo.promo_description}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-xs">
                              {promo.total_uses} uses
                            </span>
                            <span className="text-black font-semibold min-w-[100px] text-right">
                              ${(promo.total_revenue / 100).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            <span className="text-gray-500 text-xs min-w-[50px] text-right">
                              {percentOfTotal.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-black transition-all duration-500"
                            style={{ width: `${Math.min(percentOfTotal, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded"></div>
                      <span>Revenue %</span>
                    </div>
                    <span>• Showing top 10 promo codes by revenue</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-black">
                      Total: ${(totalPromoRevenue / 100).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {promoReportData.length === 0 && (
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
