import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { StockRestockForm } from './StockRestockForm';
import { StockSettingsForm } from './StockSettingsForm';
import { motion } from 'framer-motion';
import * as api from '../../services/api';

export const StockControl = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);

  // ==============================
  // FETCH + POLL STOCKS
  // ==============================
  useEffect(() => {
    let isMounted = true;

    const fetchStocks = async () => {
      try {
        const data = await api.getAllStocks();
        if (isMounted) {
          setStocks((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (isMounted) setError('Failed to load stock data');
      }
    };

    fetchStocks();
    const interval = setInterval(fetchStocks, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ==============================
  // RESTOCK HANDLER
  // ==============================
  const handleRestock = async (stockId, quantity) => {
    try {
      await api.restockMeal(stockId, { quantity_to_add: quantity });
      // Optimistic UI update
      setStocks((prev) =>
        prev.map((s) =>
          s.stock_id === stockId
            ? {
                ...s,
                quantity_in_stock: Math.min(
                  s.quantity_in_stock + quantity,
                  s.max_stock
                ),
              }
            : s
        )
      );
      setShowRestockForm(false);
      setSelectedStock(null);
    } catch (err) {
      console.error('Restock error:', err);
      alert('Restock failed.');
    }
  };

  // ==============================
  // SETTINGS HANDLER
  // ==============================
  const handleUpdateSettings = async (stockId, settings) => {
    try {
      await api.updateStockSettings(stockId, settings);
      const updated = await api.getAllStocks();
      setStocks(updated);
      setShowSettingsForm(false);
      setSelectedStock(null);
    } catch (err) {
      console.error('Update settings error:', err);
      alert('Update failed.');
    }
  };

  // ==============================
  // UI LOADING + ERROR STATES
  // ==============================
  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // ==============================
  // MAIN RENDER
  // ==============================
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-black text-lg font-medium">Inventory Management</h3>

        {/* Future feature: bulk restock button */}
        {/*
        <Button
          size="sm"
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
          onClick={() => alert('Will restock all low-stock items (coming soon)')}
        >
          Restock All Low Items
        </Button>
        */}
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => {
          const quantity = Number(stock.quantity_in_stock) || 0;
          const max = Number(stock.max_stock) || 1;
          const stockPercent = Math.min((quantity / max) * 100, 100);

          console.log(
            'Stock:',
            stock.meal_name,
            'Quantity:',
            quantity,
            'Max:',
            max,
            'Percent:',
            stockPercent
          );

          return (
            <div
              key={stock.stock_id}
              className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* LEFT SIDE — DETAILS */}
              <div className="flex-1">
                <div className="text-black font-medium mb-2">
                  {stock.meal_name}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Stock Level</span>
                      <span className="text-black">
                        {quantity} / {max}
                      </span>
                    </div>

                    {/* ✅ Black progress bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${stockPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE — BUTTONS */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    setSelectedStock(stock);
                    setShowRestockForm(true);
                  }}
                >
                  Restock
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    setSelectedStock(stock);
                    setShowSettingsForm(true);
                  }}
                >
                  Settings
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RESTOCK FORM */}
      {showRestockForm && (
        <StockRestockForm
          open={showRestockForm}
          onClose={() => setShowRestockForm(false)}
          stock={selectedStock}
          onSave={handleRestock}
        />
      )}

      {/* SETTINGS FORM */}
      {showSettingsForm && (
        <StockSettingsForm
          open={showSettingsForm}
          onClose={() => setShowSettingsForm(false)}
          stock={selectedStock}
          onSave={handleUpdateSettings}
        />
      )}
    </motion.div>
  );
};
