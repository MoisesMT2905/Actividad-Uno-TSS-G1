'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'amber' | 'red';
}

interface SummaryPanelProps {
  title: string;
  items: SummaryItem[];
  interpretation?: string;
}

export function SummaryPanel({ title, items, interpretation }: SummaryPanelProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    amber: 'bg-amber-50 text-amber-900',
    red: 'bg-red-50 text-red-900',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${colorClasses[item.color || 'blue']}`}
            >
              <p className="text-xs font-medium opacity-75">{item.label}</p>
              <p className="text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </div>
        {interpretation && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Interpretación: </span>
              {interpretation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
