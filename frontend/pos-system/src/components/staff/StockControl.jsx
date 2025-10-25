import React, {useState, useEffect} from 'react';
import { Button } from '../ui/button';
import { mockMeals } from '../../lib/mockData';
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

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const data = await api.getAllStocks();
        setStocks(data);
      } catch (err) {
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  const handleRestock = async (stockId, quantity) => {
    try {
      await api.restockMeal(stockId, { quantity_to_add: quantity });

      const updated = await api.getAllStocks();
      setStocks(updated);
      setShowRestockForm(false);
      setSelectedStock(null);
    } catch (err) {
      console.error('Restock error:', err);
      alert('Restock failed.');
    }
  };

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

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-black text-lg font-medium">Inventory Management</h3>
        <Button
          size="sm"
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
          onClick={() => alert('Will restock all low-stock items (coming soon)')}
        >
          Restock All Low Items
        </Button>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => {
          const stockPercent =
            Math.min((stock.quantity_in_stock / stock.max_stock) * 100, 100);

          return (
            <div
              key={stock.stock_id}
              className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="text-black font-medium mb-2">
                  {stock.meal_name}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500">Stock Level</span>
                      <span className="text-black">
                        {stock.quantity_in_stock} / {stock.max_stock}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stock.quantity_in_stock < stock.reorder_threshold
                            ? 'bg-red-600'
                            : stock.quantity_in_stock <
                              stock.max_stock * 0.3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${stockPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* Modals */}
      {showRestockForm && (
        <StockRestockForm
          open={showRestockForm}
          onClose={() => setShowRestockForm(false)}
          stock={selectedStock}
          onSave={handleRestock}
        />
      )}

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