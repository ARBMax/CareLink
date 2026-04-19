import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Boxes, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Clock, 
  Users,
  ShieldCheck,
  Zap
} from "lucide-react";

interface UrgentNeed {
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  resourceRequired: string;
  description: string;
}

interface UrgentNeedsTrackerProps {
  needs: UrgentNeed[];
}

export function UrgentNeedsTracker({ needs }: UrgentNeedsTrackerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {needs.map((need, i) => {
        const isExpanded = expandedIndex === i;
        
        return (
          <motion.div
            key={`need-${need.priority}-${need.location}-${need.resourceRequired}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Card className={`group relative overflow-hidden transition-all duration-300 border-foreground/5 bg-foreground/5 ${isExpanded ? 'ring-1 ring-primary/20 bg-foreground/[0.08]' : 'hover:bg-foreground/[0.03]'}`}>
              {/* Priority Indicator vertical stripe */}
              <div className={`absolute top-0 left-0 w-1 h-full transition-opacity ${
                need.priority === 'Critical' ? 'bg-red-500 shadow-[2px_0_10px_rgba(239,68,68,0.4)]' :
                need.priority === 'High' ? 'bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.4)]' :
                'bg-primary opacity-30 group-hover:opacity-100'
              }`} />

              <CardContent className="p-0">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 flex items-start sm:items-center gap-4 min-w-0">
                    <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center mt-1 sm:mt-0 ${
                      need.priority === 'Critical' ? 'bg-red-500/10 text-red-500' :
                      need.priority === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1 flex-wrap sm:flex-nowrap">
                        <Badge 
                          variant="outline" 
                          className={`text-[8px] px-2 py-0 border-none font-bold uppercase shrink-0 ${
                            need.priority === 'Critical' ? 'bg-red-500/20 text-red-600' :
                            need.priority === 'High' ? 'bg-amber-500/20 text-amber-600' :
                            'bg-primary/20 text-primary'
                          }`}
                        >
                          {need.priority}
                        </Badge>
                        <div className="flex items-center gap-1.5 opacity-40 min-w-0">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="text-[9px] font-bold uppercase tracking-widest truncate">{need.location}</span>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold tracking-tight truncate flex items-center gap-2">
                        {need.resourceRequired}
                      </h4>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="h-8 pr-2 pl-3 text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-foreground/5 transition-all shrink-0 self-start sm:self-center"
                  >
                    {isExpanded ? "Close" : "View Details"}
                    {isExpanded ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />}
                  </Button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      key="expanded-details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-foreground/5 bg-foreground/[0.02]"
                    >
                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 flex items-center gap-2 font-mono">
                            <Zap className="h-3 w-3" />
                            Incident Description
                          </p>
                          <p className="text-sm font-serif italic leading-relaxed opacity-80 pl-4 border-l-2 border-primary/20">
                            "{need.description}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-xl bg-foreground/5 space-y-1">
                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                              <Boxes className="h-3 w-3" />
                              Required Asset
                            </p>
                            <p className="text-[10px] font-bold truncate">{need.resourceRequired}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-foreground/5 space-y-1">
                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              Exact Location
                            </p>
                            <p className="text-[10px] font-bold truncate">{need.location}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-foreground/5 space-y-1 col-span-2 md:col-span-1">
                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                              <ShieldCheck className="h-3 w-3" />
                              Intelligence Confidence
                            </p>
                            <p className="text-[10px] font-bold text-emerald-500">STABLE_FEED</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-foreground/5">
                           <Button size="sm" className="h-8 rounded-lg text-[9px] uppercase tracking-widest font-bold">
                             Allocate Resource
                           </Button>
                           <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] uppercase tracking-widest font-bold border-foreground/10">
                             Contact Ground Team
                           </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
