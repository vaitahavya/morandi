'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Package,
  XCircle
} from 'lucide-react';

interface ReturnStatsProps {
  stats: {
    totalReturns: number;
    pendingReturns: number;
    approvedReturns: number;
    processedReturns: number;
    refundedReturns: number;
    totalRefundAmount: number;
    avgRefundAmount: number;
  } | null;
}

export function ReturnStats({ stats }: ReturnStatsProps) {
  if (!stats) {
    return (
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
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Returns',
      value: stats.totalReturns.toLocaleString(),
      icon: RotateCcw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All return requests'
    },
    {
      title: 'Pending Returns',
      value: stats.pendingReturns.toLocaleString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Awaiting review',
      percentage: stats.totalReturns > 0 ? Math.round((stats.pendingReturns / stats.totalReturns) * 100) : 0,
      urgent: stats.pendingReturns > 10
    },
    {
      title: 'Approved Returns',
      value: stats.approvedReturns.toLocaleString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Ready for processing',
      percentage: stats.totalReturns > 0 ? Math.round((stats.approvedReturns / stats.totalReturns) * 100) : 0
    },
    {
      title: 'Processed Returns',
      value: stats.processedReturns.toLocaleString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Items received & inspected',
      percentage: stats.totalReturns > 0 ? Math.round((stats.processedReturns / stats.totalReturns) * 100) : 0
    },
    {
      title: 'Refunded Returns',
      value: stats.refundedReturns.toLocaleString(),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Refunds completed',
      percentage: stats.totalReturns > 0 ? Math.round((stats.refundedReturns / stats.totalReturns) * 100) : 0
    },
    {
      title: 'Total Refunds',
      value: formatCurrency(stats.totalRefundAmount),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Amount refunded to customers'
    },
    {
      title: 'Avg Refund',
      value: formatCurrency(stats.avgRefundAmount),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Average refund amount'
    },
    {
      title: 'Return Rate',
      value: '3.2%',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Of total orders',
      isRate: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={stat.urgent ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  {stat.percentage !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.percentage}% of total
                    </p>
                  )}
                  {stat.urgent && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs text-yellow-700 font-medium">Needs attention</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg ${stat.urgent ? 'ring-2 ring-yellow-300' : ''}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}