import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorClass?: string;
}

export function KPICard({ title, value, icon: Icon, subtitle, trend, trendValue, colorClass = 'text-gray-900' }: KPICardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      {(subtitle || trendValue) && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex items-center text-sm">
            {trend === 'up' && <span className="text-emerald-600 font-medium mr-2">↑ {trendValue}</span>}
            {trend === 'down' && <span className="text-rose-600 font-medium mr-2">↓ {trendValue}</span>}
            {trend === 'neutral' && <span className="text-gray-600 font-medium mr-2">- {trendValue}</span>}
            <span className="text-gray-500">{subtitle}</span>
          </div>
        </div>
      )}
    </div>
  );
}
