import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockOrders } from '../../lib/mockData';

export const OrderManagement = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-black">Order Processing</h3>
        <Button 
          size="sm" 
          className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
        >
          Process All
        </Button>
      </div>
      <div className="space-y-3">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-black">Order #{order.id}</div>
                <Badge
                  className={
                    order.status === 'delivered'
                      ? 'bg-black text-white border-0'
                      : order.status === 'processing'
                      ? 'bg-gray-600 text-white border-0'
                      : order.status === 'shipped'
                      ? 'bg-gray-800 text-white border-0'
                      : 'bg-gray-300 text-black border-0'
                  }
                >
                  {order.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {order.items.length} items • ${order.total.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-200 hover:bg-gray-100 rounded-lg"
              >
                View
              </Button>
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  className="bg-black hover:bg-black text-white rounded-lg btn-glossy"
                >
                  Process
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
