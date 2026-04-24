import React, { useState, memo } from "react";
import { AnalysisReport } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileSpreadsheet, FileText, Presentation, Download, ShieldCheck, Zap, Eye } from "lucide-react";
import { exportToExcel, exportToWord, exportToPPT } from "../lib/exportUtils";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ExportCenterProps {
  report: AnalysisReport;
}

export const ExportCenter = memo(function ExportCenter({ report }: ExportCenterProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'excel' | 'word' | 'ppt' | null>(null);

  const handleExport = async (type: 'excel' | 'word' | 'ppt') => {
    setIsExporting(type);
    try {
      if (type === 'excel') await exportToExcel(report);
      if (type === 'word') await exportToWord(report);
      if (type === 'ppt') await exportToPPT(report);
    } catch (error) {
      console.error(`Export to ${type} failed:`, error);
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'excel',
      title: 'Excel Impact Tracker',
      description: 'Structured data for urgent need tracking and resource flow.',
      icon: FileSpreadsheet,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/5',
      borderColor: 'border-emerald-500/10',
      action: () => handleExport('excel'),
      format: '.XLSX'
    },
    {
      id: 'word',
      title: 'Word Impact Report',
      description: 'Formal community impact assessment for stakeholders.',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/10',
      action: () => handleExport('word'),
      format: '.DOCX'
    },
    {
      id: 'ppt',
      title: 'PowerPoint Deck',
      description: 'Visual resource allocation and impact outcome slides.',
      icon: Presentation,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/10',
      action: () => handleExport('ppt'),
      format: '.PPTX'
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Export Control Center</h2>
        <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
          Convert neural intelligence into standardized enterprise assets for cross-departmental distribution.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {exportOptions.map((option, i) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`h-full border ${option.borderColor} bg-white/40 dark:bg-[#020617]/40 backdrop-blur-xl flex flex-col transition-all hover:shadow-lg hover:-translate-y-1`}>
              <CardHeader className="pb-4">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${option.bgColor} border ${option.borderColor}`}>
                  <option.icon className={`h-7 w-7 ${option.color}`} />
                </div>
                <CardTitle className="text-xs font-bold uppercase tracking-widest">{option.title}</CardTitle>
                <CardDescription className="text-[11px] leading-relaxed opacity-60 mt-2">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-6 space-y-3">
                <Button 
                  onClick={option.action}
                  disabled={isExporting !== null}
                  className="w-full bg-foreground text-background hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.2em] font-bold py-6 rounded-xl group"
                >
                  {isExporting === option.id ? (
                    <Zap className="h-4 w-4 animate-pulse mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  )}
                  Generate {option.format}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setPreviewType(option.id as any)}
                  className="w-full border-foreground/10 hover:bg-foreground/5 transition-all uppercase text-[10px] tracking-[0.2em] font-bold py-6 rounded-xl group"
                >
                  <Eye className="h-4 w-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  Preview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-dashed border-foreground/10 bg-transparent">
        <CardContent className="py-10 flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
              <ShieldCheck className="h-3 w-3 text-primary" />
              Secure Protocol
            </div>
            <div className="h-1 w-1 rounded-full bg-foreground/10" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-40">
              <Zap className="h-3 w-3 text-primary" />
              Instant Synthesis
            </div>
          </div>
          <p className="text-[10px] max-w-lg opacity-30 uppercase leading-relaxed tracking-widest">
            All generated files are processed locally within the neural core. No sensitive data leaves the secure session environment during the synthesis process.
          </p>
        </CardContent>
      </Card>

      <Dialog open={previewType !== null} onOpenChange={(open) => !open && setPreviewType(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-foreground/10">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-xs font-bold opacity-50">
              {previewType === 'excel' && 'Excel Spreadsheet Preview'}
              {previewType === 'word' && 'Word Document Preview'}
              {previewType === 'ppt' && 'PowerPoint Deck Preview'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {previewType === 'excel' && (
              <div className="border border-foreground/10 rounded-lg overflow-hidden bg-white dark:bg-black">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#141414] text-[#E4E3E0] uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 font-bold">Label / Category</th>
                      <th className="px-6 py-3 font-bold">Value / Metric</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.chartData && report.chartData.length > 0 ? (
                      report.chartData.map((data, i) => (
                        <tr key={`chart-${data.label}-${i}`} className="border-b border-foreground/5 last:border-0">
                          <td className="px-6 py-4">{data.label}</td>
                          <td className="px-6 py-4 font-mono">{data.value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-center opacity-50">No metric data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {previewType === 'word' && (
              <div className="bg-white text-black p-12 rounded-lg shadow-xl max-w-3xl mx-auto space-y-8 font-serif">
                <h1 className="text-4xl font-bold border-b pb-4">CareLink: Humanitarian Impact Report</h1>
                
                <section>
                  <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
                  <p className="leading-relaxed">{report.executiveSummary}</p>
                </section>

                <section>
                  <p className="text-xl font-bold text-blue-600">Reliability Index: {report.confidenceScore}%</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Urgent Community Needs</h2>
                  <div className="space-y-4">
                    {report.urgentNeeds.map((need, i) => (
                      <div key={`need-${need.location}-${i}`} className="pl-4 border-l-4 border-red-500">
                        <p className="font-bold">{need.priority}: {need.location}</p>
                        <p className="text-sm italic">Required: {need.resourceRequired}</p>
                        <p className="text-xs">{need.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Resource Gaps</h2>
                  <ul className="list-disc pl-6 space-y-1">
                    {report.resourceGaps.map((gap, i) => (
                      <li key={`gap-${i}`}>{gap}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Potential Social Impact</h2>
                  <p className="leading-relaxed">{report.potentialImpact.projection}</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Field Logistics Action Plan</h2>
                  <ul className="space-y-2">
                    {report.actionPlan.map((action, i) => (
                      <li key={`action-${i}`} className="flex gap-2">
                        <span className="text-green-600 font-bold">{i + 1}.</span> {action}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}

            {previewType === 'ppt' && (
              <div className="space-y-8 max-w-3xl mx-auto">
                {/* Slide 1 */}
                <div className="aspect-video bg-[#020617] rounded-xl flex flex-col items-center justify-center text-center p-12 shadow-2xl border border-white/10">
                  <h1 className="text-5xl font-bold text-primary mb-4">CareLink</h1>
                  <h2 className="text-2xl text-[#E4E3E0] tracking-widest uppercase opacity-60">Humanitarian Impact & Resource Efficiency</h2>
                </div>

                {/* Slide 2 */}
                <div className="aspect-video bg-white rounded-xl flex flex-col p-12 shadow-2xl border border-gray-200 text-black">
                  <h2 className="text-3xl font-bold text-primary mb-8 uppercase tracking-tight">URGENT NEEDS FEED</h2>
                  <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {report.urgentNeeds.slice(0, 4).map((need, i) => (
                      <div key={`need-slide-${need.location}-${i}`} className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                        <p className="text-xs font-bold text-red-600 uppercase">{need.priority}</p>
                        <p className="text-sm font-bold">{need.location}</p>
                        <p className="text-[10px] opacity-60">{need.resourceRequired}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide 3 */}
                <div className="aspect-video bg-white rounded-xl flex flex-col p-12 shadow-2xl border border-gray-200 text-black">
                  <h2 className="text-3xl font-bold text-primary mb-8 uppercase tracking-tight">PROJECTED SOCIAL IMPACT</h2>
                  <p className="text-xl leading-relaxed italic border-l-4 border-emerald-500 pl-6 mb-8">{report.potentialImpact.projection}</p>
                  <div className="mt-auto">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Reliability Rating</p>
                    <p className="text-5xl font-bold text-blue-600">{report.confidenceScore}%</p>
                  </div>
                </div>

                {/* Slide 4 */}
                <div className="aspect-video bg-white rounded-xl flex flex-col p-12 shadow-2xl border border-gray-200 text-black">
                  <h2 className="text-3xl font-bold text-primary mb-8 uppercase tracking-tight">FIELD ACTION PLAN</h2>
                  <div className="space-y-4">
                    {report.actionPlan.map((action, i) => (
                      <div key={`action-slide-${i}`} className="flex items-start gap-4">
                        <div className="w-8 h-8 shrink-0 bg-primary text-white flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <p className="text-lg pt-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
