import React, { memo, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Brush,
  ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useTheme } from 'next-themes';
import { AnalysisReport } from '../types';

interface DataVisualizerProps {
  report: AnalysisReport | null;
  rawData?: string;
  liveStream?: any[];
}

const mockData = [
  { time: '08:00', value: 45, baseline: 40 },
  { time: '08:30', value: 48, baseline: 41 },
  { time: '09:00', value: 52, baseline: 42 },
  { time: '09:30', value: 50, baseline: 43 },
  { time: '10:00', value: 48, baseline: 44 },
  { time: '10:30', value: 55, baseline: 45 },
  { time: '11:00', value: 61, baseline: 46 },
  { time: '11:30', value: 58, baseline: 47 },
  { time: '12:00', value: 55, baseline: 48 },
  { time: '12:30', value: 62, baseline: 49 },
  { time: '13:00', value: 67, baseline: 50 },
  { time: '13:30', value: 75, baseline: 51 },
  { time: '14:00', value: 82, baseline: 52 },
  { time: '14:30', value: 78, baseline: 53 },
  { time: '15:00', value: 74, baseline: 54 },
  { time: '15:30', value: 68, baseline: 55 },
  { time: '16:00', value: 62, baseline: 56 },
  { time: '16:30', value: 58, baseline: 57 },
  { time: '17:00', value: 55, baseline: 58 },
];

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const baseline = payload[1]?.value || 0;
    const deviation = baseline !== 0 ? (((value - baseline) / baseline) * 100).toFixed(1) : "0.0";
    const isAbove = value >= baseline;

    return (
      <div className="bg-[#141414] border border-white/10 p-3 rounded-sm shadow-xl font-mono text-[10px]">
        <p className="text-white/40 mb-2 uppercase tracking-tighter">Temporal Marker: {label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-white/60">IMPACT METRIC</span>
            <span className="text-white font-bold">{value} units</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-white/60">BASELINE REF</span>
            <span className="text-white">{baseline} units</span>
          </div>
          <div className="pt-2 border-t border-white/5 mt-1 flex justify-between gap-8">
            <span className="text-white/60">VARIANCE</span>
            <span className={isAbove ? "text-emerald-400" : "text-amber-400"}>
              {isAbove ? "+" : ""}{deviation}%
            </span>
          </div>
          <div className="text-[9px] opacity-40 italic mt-2">
            Status: {isAbove ? "REGIONAL_STABILITY" : "URGENCY_INCREASE"}
          </div>
        </div>
      </div>
    );
  }
  return null;
});

CustomTooltip.displayName = "CustomTooltip";

export const DataVisualizer = memo(function DataVisualizer({ report, rawData, liveStream }: DataVisualizerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#e4e3e0' : '#141414';
  const neonCyan = '#00f3ff';
  const gridColor = isDark ? '#e4e3e0' : '#141414';

  const chartData = useMemo(() => {
    if (liveStream && liveStream.length > 0) {
      return liveStream.map((item, i) => ({
        time: item.time ? `${item.time} (${i})` : (item.label ? `${item.label} (${i})` : `L-${i}`),
        value: item.value,
        baseline: item.baseline
      }));
    }

    if (report?.chartData && report.chartData.length > 0) {
      return report.chartData.map((item, i) => ({
        time: item.label ? `${item.label} (${i})` : `P-${i}`,
        value: item.value,
        baseline: item.value * 0.9 // Fallback baseline
      }));
    }

    if (!rawData) return mockData;
    try {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Try to find numerical fields
        const first = parsed[0];
        const numKeys = Object.keys(first).filter(k => typeof first[k] === 'number');
        const timeKey = Object.keys(first).find(k => k.toLowerCase().includes('time') || k.toLowerCase().includes('date'));
        
        if (numKeys.length > 0) {
          return parsed.map((item, i) => ({
            time: timeKey ? `${String(item[timeKey]).split('T')[0]} (${i})` : `P-${i}`,
            value: item[numKeys[0]],
            baseline: item[numKeys[1]] || (item[numKeys[0]] * 0.9) // Fallback baseline
          }));
        }
      }
    } catch (e) {
      // Not JSON or invalid format
    }
    return mockData;
  }, [rawData, report]);

  const isUsingMock = chartData === mockData;

  return (
    <div className="grid gap-8 grid-cols-1">
      {liveStream && liveStream.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-blue-500/10">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-between">
              <span className="text-blue-500">Live Neural Stream Feed</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-blue-500 opacity-60">INGESTING</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none">
              {liveStream.slice(-8).reverse().map((data, idx) => (
                <motion.div 
                  key={data.timestamp || idx}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="min-w-[140px] p-3 rounded-lg bg-black/40 border border-white/5 font-mono space-y-1"
                >
                  <div className="text-[8px] opacity-40 uppercase tracking-tighter">{data.label || 'SIGNAL'}</div>
                  <div className="text-lg font-black text-blue-400">{Math.round(data.value)}%</div>
                  <div className="flex items-center justify-between text-[7px] opacity-30">
                     <span>LOAD</span>
                     <span>{Math.round(data.load || 0)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {isUsingMock && (
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-30 text-center mb-2 font-bold">
          Note: Displaying synthetic benchmarks (Raw data format incompatible for direct mapping)
        </div>
      )}
      <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Regional Impact Timeline</CardTitle>
          <Badge variant="outline" className="text-[8px] opacity-40">FIELD_INTEL_STREAM</Badge>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={neonCyan} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={neonCyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.05} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={neonCyan} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2} 
                animationDuration={1000}
              />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke={primaryColor} 
                strokeDasharray="5 5" 
                opacity={0.1} 
                dot={false} 
              />
              <Brush 
                dataKey="time" 
                height={30} 
                stroke={primaryColor} 
                fill={isDark ? "#020617" : "#E4E3E0"}
                className="font-mono text-[8px]"
                travellerWidth={10}
                gap={5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Priority Detection & Focus</CardTitle>
          <Badge variant="outline" className="text-[8px] opacity-40 border-magenta/20 text-magenta/50">URGENCY_SCAN</Badge>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.05} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="stepAfter" 
                dataKey="value" 
                stroke={isDark ? "#ff00ff" : "#141414"} 
                strokeWidth={2} 
                dot={{ r: 3, fill: isDark ? "#ff00ff" : '#141414', strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: isDark ? '#141414' : '#E4E3E0', strokeWidth: 2 }}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke={primaryColor} 
                strokeDasharray="5 5" 
                opacity={0.1} 
                dot={false} 
              />
              <ReferenceLine y={80} label={{ value: 'CRITICAL', position: 'right', fill: isDark ? "#ff00ff" : '#141414', fontSize: 10, fontFamily: 'JetBrains Mono', opacity: 0.5 }} stroke={isDark ? "#ff00ff" : "#141414"} strokeDasharray="3 3" opacity={0.3} />
              <Brush 
                dataKey="time" 
                height={30} 
                stroke={primaryColor} 
                fill={isDark ? "#020617" : "#E4E3E0"}
                className="font-mono text-[8px]"
                travellerWidth={10}
                gap={5}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {report?.potentialImpact?.metrics && (
        <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Projected Social Impact</CardTitle>
            <Badge variant="outline" className="text-[8px] opacity-40 text-emerald-500 border-emerald-500/20">IMPACT_FORECAST_ENGINE</Badge>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.potentialImpact.metrics.map((m, i) => ({ ...m, label: m.label ? `${m.label} (${i})` : `M-${i}` }))}>
                <defs>
                  <linearGradient id="visualImpactGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.05} />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: primaryColor, opacity: 0.4 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#141414', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#e4e3e0'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  name="Projected"
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#visualImpactGradient)" 
                  strokeWidth={2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  name="Current"
                  stroke={primaryColor} 
                  fillOpacity={0.1} 
                  fill={primaryColor}
                  strokeWidth={1} 
                  strokeDasharray="5 5"
                />
                <Brush 
                  dataKey="label" 
                  height={30} 
                  stroke={primaryColor} 
                  fill={isDark ? "#020617" : "#E4E3E0"}
                  className="font-mono text-[8px]"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
