import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockPaymentMethods } from '../../lib/mockData';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, User, CreditCard, Award, TrendingUp, MapPin, Mail, Phone } from 'lucide-react';

export const Profile = ({ onBack }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-6">
        <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-lg bg-black flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-black mb-1">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-gray-500 mb-2">{user?.email}</p>
                  <Badge className="bg-gray-100 text-black border-0">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-black">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Phone className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-black">{user?.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="text-black">{user?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="payment" className="space-y-6">
            <TabsList className="bg-gray-100 border-gray-200">
              <TabsTrigger value="payment" className="data-[state=active]:bg-white">
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-white">
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-black mb-5">Saved Payment Methods</h2>
                <div className="space-y-3">
                  {mockPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-black">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-black">
                            {method.type === 'credit'
                              ? 'Credit Card'
                              : method.type === 'debit'
                              ? 'Debit Card'
                              : method.type === 'applepay'
                              ? 'Apple Pay'
                              : 'Google Pay'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.type === 'applepay' || method.type === 'googlepay'
                              ? method.name
                              : `•••• ${method.last4}`}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-black border-0">Default</Badge>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-gray-200 hover:bg-gray-100 rounded-lg"
                >
                  Add Payment Method
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-black rounded-lg p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6" />
                    <h3>Loyalty Points</h3>
                  </div>
                  <p className="text-4xl mb-2">{user?.loyaltyPoints || 0}</p>
                  <p className="text-sm text-gray-300">Available to redeem</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-black" />
                    <h3 className="text-black">Total Spent</h3>
                  </div>
                  <p className="text-4xl text-black mb-2">${user?.totalSpent?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500">All time</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-black mb-4">Rewards Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Points until next reward</span>
                      <span className="text-black">
                        {user?.loyaltyPoints ? 2000 - (user.loyaltyPoints % 2000) : 2000} points
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full transition-all"
                        style={{
                          width: `${user?.loyaltyPoints ? ((user.loyaltyPoints % 2000) / 2000) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Earn 100 points for every $10 spent. Redeem 2000 points for $20 off your next order.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};