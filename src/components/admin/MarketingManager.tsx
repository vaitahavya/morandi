'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Tag, 
  Image, 
  Mail, 
  Star,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { BannerManager } from './BannerManager';
import { CouponManager } from './CouponManager';
import { CampaignManager } from './CampaignManager';
import { FeaturedProductManager } from './FeaturedProductManager';

interface MarketingStats {
  totalBanners: number;
  activeBanners: number;
  totalImpressions: number;
  totalClicks: number;
  avgClickRate: number;
  totalCoupons: number;
  activeCoupons: number;
  totalUsage: number;
  avgUsage: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalFeaturedProducts: number;
  activeFeaturedProducts: number;
}

export default function MarketingManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'banners' | 'coupons' | 'campaigns' | 'featured'>('overview');
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketingStats();
  }, []);

  const loadMarketingStats = async () => {
    setLoading(true);
    try {
      // Load stats from different endpoints
      const [bannersResponse, couponsResponse] = await Promise.all([
        fetch('/api/marketing/banners?limit=1'),
        fetch('/api/marketing/coupons?limit=1')
      ]);

      const bannersData = await bannersResponse.json();
      const couponsData = await couponsResponse.json();

      if (bannersData.success && couponsData.success) {
        setStats({
          ...bannersData.stats,
          ...couponsData.stats,
          totalCampaigns: 0, // TODO: Add campaign stats
          activeCampaigns: 0,
          totalSent: 0,
          totalOpened: 0,
          totalFeaturedProducts: 0, // TODO: Add featured product stats
          activeFeaturedProducts: 0
        });
      }
    } catch (error) {
      console.error('Error loading marketing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Tools</h1>
          <p className="text-gray-600">Manage banners, coupons, campaigns, and featured products</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Create
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'banners', label: 'Banners', icon: Image },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'campaigns', label: 'Campaigns', icon: Mail },
            { id: 'featured', label: 'Featured Products', icon: Star }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Marketing Stats */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Banner Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Banners</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.activeBanners)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.totalBanners)} total
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Image className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Banner Clicks</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.totalClicks)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(stats.avgClickRate)} avg rate
                      </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coupon Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.activeCoupons)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.totalCoupons)} total
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Tag className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Coupon Usage</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.totalUsage)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.avgUsage)} avg per coupon
                      </p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.activeCampaigns)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.totalCampaigns)} total
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.totalSent)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.totalOpened)} opened
                      </p>
                    </div>
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Featured Products Stats */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Featured Products</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.activeFeaturedProducts)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNumber(stats.totalFeaturedProducts)} total
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Banner Impressions</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatNumber(stats.totalImpressions)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Total views
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <Eye className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common marketing tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('banners')}
                >
                  <Image className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Banner</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('coupons')}
                >
                  <Tag className="h-6 w-6 mb-2" />
                  <span className="text-sm">Create Coupon</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('campaigns')}
                >
                  <Mail className="h-6 w-6 mb-2" />
                  <span className="text-sm">Start Campaign</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => setActiveTab('featured')}
                >
                  <Star className="h-6 w-6 mb-2" />
                  <span className="text-sm">Feature Product</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Marketing Activity</CardTitle>
              <CardDescription>
                Latest marketing actions and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Image className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New banner created</p>
                      <p className="text-xs text-gray-500">Summer Sale Banner</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Tag className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Coupon activated</p>
                      <p className="text-xs text-gray-500">SAVE20 - 20% off</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email campaign sent</p>
                      <p className="text-xs text-gray-500">Welcome Series - 1,234 recipients</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'banners' && <BannerManager />}
      {activeTab === 'coupons' && <CouponManager />}
      {activeTab === 'campaigns' && <CampaignManager />}
      {activeTab === 'featured' && <FeaturedProductManager />}
    </div>
  );
} 