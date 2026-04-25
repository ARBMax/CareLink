import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Upload, 
  Globe, 
  MapPin, 
  FileText, 
  Terminal, 
  Activity, 
  Zap, 
  Plus, 
  Trash2, 
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio,
  Loader2,
  Clock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";

interface IngestionCenterProps {
  onDataSubmit: (data: string) => void;
  onGlobalScan: (isBackground?: boolean, region?: string, keywords?: string[]) => void;
  isAnalyzing: boolean;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onLoadPresets: (type: 'crisis' | 'logistics' | 'refugee') => void;
  onCancelTask?: () => void;
  cooldownTimer: number | null;
}

export function IngestionCenter({ 
  onDataSubmit, 
  onGlobalScan, 
  isAnalyzing, 
  isMonitoring, 
  onToggleMonitoring,
  isStreaming,
  onToggleStreaming,
  onLoadPresets,
  onCancelTask,
  cooldownTimer
}: IngestionCenterProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [fieldReport, setFieldReport] = useState({
    location: '',
    description: '',
    peopleAffected: ''
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedData = `
FIELD REPORT SUMMARY
--------------------
LOCATION: ${fieldReport.location}
POPULATION AFFECTED: ${fieldReport.peopleAffected}
STATED NEED: ${fieldReport.description}
    `;
    onDataSubmit(formattedData.trim());
    setFieldReport({ location: '', description: '', peopleAffected: '' });
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onDataSubmit(event.target?.result as string);
      };
      reader.readAsText(files[0]);
    }
  }, [onDataSubmit]);

  const presets = [
    { id: 'crisis' as const, label: 'Medical Shortage', icon: Activity, color: 'text-red-500' },
    { id: 'logistics' as const, label: 'Flood Logistics', icon: Database, color: 'text-blue-500' },
    { id: 'refugee' as const, label: 'Refugee Camps', icon: Globe, color: 'text-emerald-500' }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="border-foreground/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-foreground/5 bg-foreground/[0.01]">
              <div className="flex flex-col gap-3">
                <div>
                  <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black opacity-70">Intelligence Ingestion Bridge</CardTitle>
                  <CardDescription className="text-[11px] font-serif italic opacity-80 mt-1">Connect field reports, regional databases, or live surveillance feeds.</CardDescription>
                </div>
                <TabsList className="bg-foreground/5 p-1 h-9 rounded-xl self-start">
                  <TabsTrigger value="upload" className="text-[9px] uppercase tracking-widest px-4 rounded-lg">Upload</TabsTrigger>
                  <TabsTrigger value="field" className="text-[9px] uppercase tracking-widest px-4 rounded-lg">Reporter</TabsTrigger>
                  <TabsTrigger value="directory" className="text-[9px] uppercase tracking-widest px-4 rounded-lg">Directory</TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <TabsContent value="upload" className="m-0 outline-none">
                  <motion.div
                    key="tab-upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative aspect-[16/5] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-foreground/10 hover:border-primary/40 hover:bg-foreground/[0.02]'
                      }`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            onDataSubmit(ev.target?.result as string);
                            e.target.value = ''; // Reset to allow re-uploading same file
                          };
                          reader.onerror = () => {
                            console.error("File reading failed");
                            e.target.value = '';
                          };
                          reader.readAsText(file);
                        }
                      }} />
                      <div className="p-4 rounded-full bg-foreground/5 group-hover:scale-110 transition-transform mb-4 relative">
                        {isAnalyzing ? (
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6 opacity-70 group-hover:opacity-100 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 group-hover:opacity-100 transition-opacity">
                        {isAnalyzing ? "Analyzing Field Intel..." : "Upload scattered paper surveys & scanned field reports"}
                      </p>
                      {isAnalyzing && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); onCancelTask?.(); }}
                          className="text-[9px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/5 h-7 mt-2"
                        >
                          Abort Protocol
                        </Button>
                      )}
                      <p className="text-[9px] opacity-50 uppercase tracking-widest mt-2 font-mono">SUPPORTED: .CSV / .JSON / .TXT</p>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="field" className="m-0 outline-none">
                  <motion.form
                    key="tab-field"
                    onSubmit={handleFieldSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest opacity-70 font-bold ml-1">Report Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 opacity-60" />
                          <input 
                            placeholder="Lat/Long or Region Name" 
                            className="w-full pl-10 h-10 rounded-xl bg-foreground/5 border-none text-xs focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                            value={fieldReport.location}
                            onChange={e => setFieldReport(prev => ({ ...prev, location: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest opacity-70 font-bold ml-1">Field Observations</label>
                        <textarea 
                          placeholder="Describe the detected gap or urgent requirement..."
                          className="w-full h-[106px] rounded-xl bg-foreground/5 border-none text-xs p-3 resize-none focus:ring-0 placeholder:opacity-60"
                          value={fieldReport.description}
                          onChange={e => setFieldReport(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!fieldReport.location || !fieldReport.description}
                        className="w-full h-10 rounded-xl bg-primary text-black font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                      >
                        Launch Field Synthesis
                        <Zap className="ml-2 h-3.5 w-3.5 fill-black" />
                      </Button>
                    </div>
                  </motion.form>
                </TabsContent>

                <TabsContent value="directory" className="m-0 outline-none">
                  <motion.div
                    key="tab-directory"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Active Humanitarian Entities</h3>
                      <Badge variant="outline" className="text-[8px] opacity-70 uppercase">Global Coverage</Badge>
                    </div>
                    
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-6">
                        {[
                          { country: "Afghanistan", ngos: ["WFP", "UNICEF", "MSF", "Save the Children", "IRC", "NRC", "CARE"] },
                          { country: "Ukraine", ngos: ["Red Cross", "People in Need", "World Central Kitchen", "UNHCR", "IOM", "Direct Relief"] },
                          { country: "Sudan", ngos: ["Sudanese Red Crescent", "MSF", "WFP", "Goal", "Relief International", "Mercy Corps"] },
                          { country: "Gaza / Palestine", ngos: ["UNRWA", "PCRF", "PMRS", "ANERA", "Anera", "MAP", "PUI"] },
                          { country: "Haiti", ngos: ["Haiti Relief", "Hope for Haiti", "Partners In Health", "WFP", "IOM", "CEPR"] },
                          { country: "Lebanon", ngos: ["Lebanese Red Cross", "Amel Association", "Anera", "IRC", "Medair", "Basmeh & Zeitooneh"] },
                          { country: "Venezuela", ngos: ["Fe y Alegría", "Cáritas Venezuela", "Action Against Hunger", "WFP", "IOM"] },
                          { country: "Mali & Burkina Faso", ngos: ["NRC", "DRC", "Solidarités International", "Plan International", "Humanity & Inclusion"] },
                          { country: "Nigeria", ngos: ["NEEM Foundation", "Plan International", "IRC", "Christian Aid", "SCI"] },
                          { country: "Bangladesh", ngos: ["BRAC", "ICRC", "Friendship", "BDRCS", "WFP", "UNHCR"] },
                          { country: "Yemen", ngos: ["WHO", "FAO", "Action Against Hunger", "Islamic Relief", "Oxfam", "Solidarités International"] },
                          { country: "South Sudan", ngos: ["Cordaid", "ZOA", "World Vision", "Medair", "Samaritan's Purse", "Plan International"] },
                          { country: "Syria", ngos: ["White Helmets", "SAMS", "Hand in Hand for Aid", "GIZ", "Chemonics", "Concern Worldwide"] },
                          { country: "DR Congo", ngos: ["ALIMA", "War Child", "Première Urgence", "Catholic Relief Services", "ACTED"] }
                        ].map((region) => (
                          <div key={region.country} className="space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-3 w-3 text-primary opacity-80" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{region.country}</span>
                              <div className="flex-1 h-[1px] bg-primary/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {region.ngos.map((ngo) => (
                                <div key={ngo} className="p-3 rounded-xl bg-foreground/5 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group flex items-center justify-between">
                                  <span className="text-[10px] font-medium opacity-70 group-hover:opacity-100">{ngo}</span>
                                  <Shield className="h-2.5 w-2.5 opacity-50 group-hover:opacity-80 text-primary" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                </TabsContent>

              </AnimatePresence>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Card className="border-foreground/5 bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl h-full shadow-2xl">
          <CardHeader className="bg-foreground/[0.01] border-b border-foreground/5">
            <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black opacity-70">Impact Scenarios</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPresets(preset.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-foreground/5 bg-foreground/[0.01] hover:bg-foreground/[0.05] hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg bg-foreground/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
                      <preset.icon className={`h-4 w-4 ${preset.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tight opacity-70 group-hover:opacity-100">{preset.label}</span>
                  </div>
                  <Plus className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:text-primary" />
                </button>
              ))}
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-foreground/5 border border-dashed border-foreground/10">
               <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  <Database className="h-3.5 w-3.5" />
                  Synthesis Health
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Signal Strength</span>
                    <span className="text-[9px] font-mono font-black text-emerald-500">OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase tracking-widest opacity-60 font-bold">Buffer Depth</span>
                    <span className="text-[9px] font-mono opacity-80">12,000 chars</span>
                  </div>
                  <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary" 
                      initial={{ width: 0 }} 
                      animate={{ width: '85%' }} 
                      transition={{ duration: 1.5, ease: 'easeOut' }} 
                    />
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
