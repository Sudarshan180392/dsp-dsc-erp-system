'use client';

import React from 'react';

type BadgeType = 'lead' | 'progress' | 'followup';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
}

export function StatusBadge({ status, type = 'lead' }: StatusBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-800';

  if (type === 'lead') {
    switch (status) {
      case 'NEW': colorClass = 'bg-blue-100 text-blue-800'; break;
      case 'CONTACTED': colorClass = 'bg-amber-100 text-amber-800'; break;
      case 'DEMO_SCHEDULED': colorClass = 'bg-purple-100 text-purple-800'; break;
      case 'ENROLLED': colorClass = 'bg-emerald-100 text-emerald-800'; break;
      case 'LOST': colorClass = 'bg-gray-200 text-gray-700'; break;
    }
  } else if (type === 'progress') {
    switch (status) {
      case 'On Track': colorClass = 'bg-emerald-100 text-emerald-800'; break;
      case 'Slightly Behind': colorClass = 'bg-amber-100 text-amber-800'; break;
      case 'Behind': colorClass = 'bg-rose-100 text-rose-800'; break;
      case 'No Data': colorClass = 'bg-gray-200 text-gray-700'; break;
    }
  } else if (type === 'followup') {
    switch (status) {
      case 'PENDING': colorClass = 'bg-amber-100 text-amber-800'; break;
      case 'COMPLETED': colorClass = 'bg-emerald-100 text-emerald-800'; break;
      case 'MISSED': colorClass = 'bg-rose-100 text-rose-800'; break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
