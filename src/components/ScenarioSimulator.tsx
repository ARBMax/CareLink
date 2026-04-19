import React, { useState, useMemo, memo } from 'react';
import { AnalysisReport, StrategicLever, ChartDataPoint } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';
import { Zap, TrendingUp, Info } from 'lucide-react';

interface ScenarioSimulatorProps {
  report: AnalysisReport;
}

export const ScenarioSimulator = memo(function ScenarioSimulator({ report }: ScenarioSimulatorProps) {
  const [leverValues, setLeverValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    report.strategicLevers?.forEach(lever => {
      initial[lever.name] = lever.current;
    });
    return initial;
  });

  const simulatedForecast = useMemo(() => {
    if (!report.chartData) return [];

    // Simple simulation logic: levers multiply the base values
    const multipliers = Object.entries(leverValues).map(([name, val]) => {
      const original = report.strategicLevers?.find(l => l.name === name);
      if (!original) return 1;
      const currentVal = Number(val);
      const originalCurrent = Number(original.current);
      const originalMin = Number(original.min);
      const originalMax = Number(original.max);
      const denominator = originalMax - originalMin || 1;
      const pctChange = (currentVal - originalCurrent) / denominator;
      return 1 + pctChange;
    });

    const combinedMultiplier = multipliers.reduce((acc, current) => acc * current, 1);

    return report.chartData.map((point, i) => ({
      ...point,
      label: point.label ? `${point.label} (${i})` : `P-${i}`,
      value: Math.round(point.value * combinedMultiplier)
    }));
  }, [report, leverValues]);

  if (!report.strategicLevers || report.strategicLevers.length === 0) {
    return (
      <div className="py-20 text-center opacity-20 text-[10px] uppercase tracking-[0.3em]">
        Impact levers not initialized for this dataset.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Levers Card */}
        <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
              <Zap className="h-3 w-3 text-primary" />
              Impact Simulation Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {report.strategicLevers.map((lever, i) => (
              <div key={`lever-${lever.name}-${i}`} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold uppercase tracking-tight">{lever.name}</p>
                    <p className="text-[9px] opacity-40 leading-relaxed max-w-[200px]">{lever.description}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
                    {leverValues[lever.name]}
                    {lever.unit}
                  </Badge>
                </div>
                <Slider
                  min={lever.min}
                  max={lever.max}
                  step={1}
                  value={[leverValues[lever.name]]}
                  onValueChange={(val) => setLeverValues(prev => ({ ...prev, [lever.name]: val[0] }))}
                  className="py-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Impact Visualizer */}
        <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              Projected Social Outcome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulatedForecast}>
                  <defs>
                    <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.4 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.4 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontSize: '10px',
                      color: '#E4E3E0'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-primary)" 
                    fillOpacity={1} 
                    fill="url(#simulatedGradient)" 
                    strokeWidth={2}
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] opacity-60 italic leading-relaxed">
                Note: This simulation uses logic derived from regional impact metrics. Actual results may vary based on community dynamics and logistics shifts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
