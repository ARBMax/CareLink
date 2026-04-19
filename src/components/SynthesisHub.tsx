import React, { useState, memo } from 'react';
import { AnalysisReport, AnalysisSynthesis } from '../types';
import { StoredReport } from '../services/persistenceService';
import { synthesizeReports } from '../services/geminiService';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRightLeft, Target, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';

interface SynthesisHubProps {
  selectedReports: StoredReport[];
  onClear: () => void;
}

export const SynthesisHub = memo(function SynthesisHub({ selectedReports, onClear }: SynthesisHubProps) {
  const [synthesis, setSynthesis] = useState<AnalysisSynthesis | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const result = await synthesizeReports(selectedReports);
      setSynthesis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest px-4 py-1">
            {selectedReports.length} Reports Selected
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClear} className="text-[10px] opacity-40">Clear</Button>
        </div>
        {!synthesis && (
          <Button 
            onClick={handleSynthesize} 
            disabled={isSynthesizing || selectedReports.length < 2}
            className="bg-primary text-primary-foreground hover:opacity-90 font-bold tracking-widest text-[10px] px-8"
          >
            {isSynthesizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Initialize Neural Synthesis
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isSynthesizing ? (
          <motion.div 
            key="synthesizing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center gap-6"
          >
            <div className="h-16 w-16 relative">
              <Loader2 className="h-full w-full animate-spin opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ArrowRightLeft className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.4em] opacity-40 animate-pulse uppercase">Merging Data Structures...</p>
          </motion.div>
        ) : synthesis ? (
          <motion.div 
            key="synthesis-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Card className="border-none bg-[#000B26] text-[#E4E3E0] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
               <CardHeader>
                 <CardTitle className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Synthesis Overview</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-xl font-serif italic max-w-2xl leading-relaxed">{synthesis.comparisonSummary}</p>
               </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    Points of Divergence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {synthesis.divergencePoints.map((point, i) => (
                      <li key={`divg-${i}`} className="text-xs leading-relaxed opacity-80 pl-4 border-l border-red-500/20">{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    Longitudinal Consistencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {synthesis.commonTrends.map((trend, i) => (
                      <li key={`trend-${i}`} className="text-xs leading-relaxed opacity-80 pl-4 border-l border-emerald-500/20">{trend}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-[#141414]/10 dark:border-white/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
                  <Target className="h-3 w-3 text-primary" />
                  Unified Strategic Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {synthesis.unifiedActionPlan.map((action, i) => (
                    <div key={`synth-action-${i}`} className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs font-medium leading-relaxed group hover:bg-primary/10 transition-colors">
                      <span className="opacity-40 mr-3">0{i+1}</span>
                      {action}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center opacity-20 text-[10px] uppercase tracking-[0.3em]"
          >
            Select reports from History and initialize synthesis hub.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
