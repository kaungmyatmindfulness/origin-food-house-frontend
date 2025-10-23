'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ChefHat, Check, Clock, TrendingUp } from 'lucide-react';

import { selectKitchenStats, useKitchenStore } from '../store/kitchen.store';

/**
 * KitchenStats Component
 * Displays real-time statistics for kitchen operations
 */
export function KitchenStats() {
  const stats = useKitchenStore(selectKitchenStats);

  const statCards = [
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting preparation',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Preparing',
      value: stats.preparing,
      icon: ChefHat,
      description: 'Being prepared',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Ready',
      value: stats.ready,
      icon: Check,
      description: 'Ready to serve',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Active',
      value: stats.totalActive,
      icon: TrendingUp,
      description: 'All active orders',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
