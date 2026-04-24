import React, { memo } from "react";
import { UrgentNeedsTracker } from "./UrgentNeedsTracker";
import { AnalysisReport } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Target, TrendingUp, BarChart3, Globe as GlobeIcon, Search, ArrowUpRight, Activity, Users, MapPin, HandHelping, Boxes, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { GlobeDistress } from "./GlobeDistress";

interface ReportViewProps {
  report: AnalysisReport;
}

export const ReportView = memo(function ReportView({ report }: ReportViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-red-500/20 bg-white/40 dark:bg-red-500/5 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[2px_0_10px_rgba(239,68,68,0.3)]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 dark:text-red-400">
              CareLink Humanitarian Intelligence Brief
            </CardTitle>
            <Badge variant={report.confidenceScore > 80 ? "default" : "secondary"} className="font-mono text-[10px] px-3 py-0.5 rounded-full">
              RELIABILITY: {report.confidenceScore}%
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif italic leading-snug text-foreground max-w-3xl">
              "{report.executiveSummary}"
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prominent 3D Globe - always rendered so user sees the globe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GlobeDistress report={report} isAnalyzing={false} />
      </motion.div>

      {/* Urgent Needs Feed */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">
                <AlertCircle className="h-3 w-3 text-red-500" />
                Urgent Needs Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UrgentNeedsTracker needs={report.urgentNeeds} />
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Potential Impact Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed opacity-90 italic border-l-2 border-emerald-500/20 pl-4 py-1">
                  {report.potentialImpact.projection}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {report.volunteerOptimization && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">
                    <HandHelping className="h-3 w-3 text-primary" />
                    CareLink Resource Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Potential Matches</span>
                      <span className="text-xl font-mono font-bold text-primary">{report.volunteerOptimization.volunteerMatchCount}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-60 font-bold">Recommended NGOs</p>
                      <div className="flex flex-wrap gap-2">
                        {report.volunteerOptimization.suggestedNGOs.map((ngo, idx) => (
                          <Badge key={`ngo-${ngo}-${idx}`} variant="secondary" className="text-[9px] opacity-70 bg-foreground/5 border-none">{ngo}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Resource Gaps & Visual Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="md:col-span-2"
        >
          <Card className="border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">
                <BarChart3 className="h-3 w-3 text-primary" />
                {report.chartTitle || "Resource Allocation Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.chartData && report.chartData.length > 0 && (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report.chartData.map((d, i) => ({ ...d, label: d.label ? `${d.label} (${i})` : `P-${i}` }))} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="label" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.7 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(37, 99, 235, 0.03)' }}
                        contentStyle={{ 
                          backgroundColor: '#020617', 
                          border: 'none', 
                          borderRadius: '8px',
                          fontSize: '10px',
                          color: '#E4E3E0'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        <LabelList 
                          dataKey="value" 
                          position="top" 
                          style={{ fontSize: '10px', fill: 'currentColor', opacity: 0.8 }} 
                          offset={10} 
                        />
                        {report.chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--color-primary)' : 'var(--color-neutral-accent)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <Card className="h-full border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">
                <Info className="h-3 w-3 text-primary" />
                Intelligence & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-1">Demographics</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{report.marketIntelligence?.demographicInsights}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Regional Trends</p>
                  <div className="space-y-1.5">
                    {report.marketIntelligence?.regionalTrends.map((trend, i) => (
                      <div key={`trend-${i}`} className="flex items-center gap-2 p-2 rounded-md bg-foreground/5">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] opacity-80">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Operational Deck Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full border-none bg-[#020617] text-[#E4E3E0] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] -mr-16 -mt-16" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] opacity-90 font-bold">
                <Target className="h-3 w-3" />
                Operational Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {report.actionPlan.map((action, i) => (
                  <div key={`action-${i}`} className="flex items-start gap-4 rounded-xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <CheckCircle2 className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium leading-snug opacity-90">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
        >
          <Card className="h-full border-foreground/5 bg-white/40 dark:bg-foreground/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold outline-none">
                <Users className="h-3 w-3 text-primary" />
                Stakeholder Perspectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Field Coordinator", view: report.stakeholderViews?.coordinator, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/10" },
                  { label: "Operation Director", view: report.stakeholderViews?.fieldDirector, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
                  { label: "Donor Relations", view: report.stakeholderViews?.donorRep, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" }
                ].map((sh, idx) => (
                  <div key={`sh-${sh.label}-${idx}`} className={`p-4 rounded-xl ${sh.bg} border ${sh.border} space-y-2`}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${sh.color}`}>{sh.label}</p>
                    <p className="text-[11px] leading-relaxed opacity-90 italic">"{sh.view}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});

