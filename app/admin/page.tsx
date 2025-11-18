'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, DollarSign, Activity, TrendingUp, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'analytics'>('overview');

  const stats = {
    totalUsers: 12453,
    activeUsers: 8921,
    totalRevenue: 45678,
    totalOrders: 3421,
    conversionRate: 3.2,
    avgOrderValue: 13.35,
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Manage your fitness platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('users')}
          >
            Users
          </Button>
          <Button
            variant={activeTab === 'products' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            Products
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Total Users</CardTitle>
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-sm text-green-500 mt-2">↑ 12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Active Users</CardTitle>
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
                  <p className="text-sm text-green-500 mt-2">↑ 8% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-sm text-green-500 mt-2">↑ 24% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Total Orders</CardTitle>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stats.totalOrders.toLocaleString()}</div>
                  <p className="text-sm text-green-500 mt-2">↑ 18% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'john.doe@email.com', action: 'Created account', time: '2 minutes ago' },
                    { user: 'jane.smith@email.com', action: 'Purchased Premium Plan', time: '15 minutes ago' },
                    { user: 'mike.wilson@email.com', action: 'Logged workout', time: '23 minutes ago' },
                    { user: 'sarah.jones@email.com', action: 'Completed challenge', time: '1 hour ago' },
                    { user: 'david.brown@email.com', action: 'Updated profile', time: '2 hours ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-white/10 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{activity.user}</div>
                        <div className="text-sm text-white/60">{activity.action}</div>
                      </div>
                      <div className="text-sm text-white/40">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                  <CardDescription>Visitor to customer conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white mb-2">{stats.conversionRate}%</div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.conversionRate * 10}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg Order Value</CardTitle>
                  <CardDescription>Average revenue per order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white mb-2">${stats.avgOrderValue.toFixed(2)}</div>
                  <p className="text-sm text-green-500">↑ 5% from last month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="search"
                    placeholder="Search users..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40"
                  />
                  <Button>Add User</Button>
                </div>
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white">Plan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white">Joined</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {[
                        { email: 'user1@example.com', status: 'Active', plan: 'Pro', joined: '2024-01-10' },
                        { email: 'user2@example.com', status: 'Active', plan: 'Free', joined: '2024-01-12' },
                        { email: 'user3@example.com', status: 'Inactive', plan: 'Pro', joined: '2024-01-08' },
                      ].map((user, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.status === 'Active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white">{user.plan}</td>
                          <td className="px-4 py-3 text-sm text-white/60">{user.joined}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm">Edit</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Manage products and inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Add Product</Button>
                <div className="grid gap-4">
                  {[
                    { name: 'Premium Subscription', price: 29.99, stock: 'Unlimited', sales: 342 },
                    { name: 'Protein Powder', price: 49.99, stock: 156, sales: 89 },
                    { name: 'Resistance Bands', price: 24.99, stock: 243, sales: 127 },
                  ].map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-white/10 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-white/60">Stock: {product.stock} • Sales: {product.sales}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold text-white">${product.price}</div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Analytics
                </CardTitle>
                <CardDescription>Track platform growth and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/60">User Growth</span>
                      <span className="text-sm font-medium text-green-500">+24%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '76%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/60">Revenue Growth</span>
                      <span className="text-sm font-medium text-green-500">+32%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '84%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/60">Engagement Rate</span>
                      <span className="text-sm font-medium text-yellow-500">+12%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '67%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Premium Subscription', revenue: 10198, units: 342 },
                    { name: 'Protein Powder', revenue: 4449, units: 89 },
                    { name: 'Resistance Bands', revenue: 3173, units: 127 },
                  ].map((product, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-white/10 rounded-lg">
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-white/60">{product.units} units sold</div>
                      </div>
                      <div className="text-lg font-bold text-primary">${product.revenue.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
