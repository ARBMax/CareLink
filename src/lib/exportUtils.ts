import { AnalysisReport } from "../types";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import pptxgen from "pptxgenjs";
import { saveAs } from "file-saver";

export async function exportToExcel(report: AnalysisReport) {
  const workbook = new ExcelJS.Workbook();
  const dataSheet = workbook.addWorksheet("Impact Data");
  const needsSheet = workbook.addWorksheet("Urgent Needs Tracker");

  // Impact Data Sheet
  dataSheet.columns = [
    { header: "Metric / Impact Category", key: "label", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];

  if (report.chartData && report.chartData.length > 0) {
    report.chartData.forEach((data) => {
      dataSheet.addRow({ label: data.label, value: data.value });
    });
  }

  // Urgent Needs Tracker Sheet
  needsSheet.columns = [
    { header: "Priority", key: "priority", width: 15 },
    { header: "Location", key: "location", width: 25 },
    { header: "Resource Required", key: "resource", width: 30 },
    { header: "Context / Description", key: "description", width: 50 },
  ];

  report.urgentNeeds.forEach((need) => {
    const row = needsSheet.addRow({
      priority: need.priority,
      location: need.location,
      resource: need.resourceRequired,
      description: need.description
    });
    
    // Conditional styling for priority
    const priorityCell = row.getCell('priority');
    if (need.priority === 'Critical') {
      priorityCell.font = { color: { argb: 'FFFF0000' }, bold: true };
    } else if (need.priority === 'High') {
      priorityCell.font = { color: { argb: 'FFFF8C00' }, bold: true };
    }
  });

  // Header Styling
  [dataSheet, needsSheet].forEach(sheet => {
    sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `CareLink_Needs_Tracker_${Date.now()}.xlsx`);
}

export async function exportToWord(report: AnalysisReport) {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: "CareLink: Humanitarian Impact Report",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "Executive Summary",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun(report.executiveSummary)],
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: "Confidence Score: " + report.confidenceScore + "%",
      spacing: { before: 200, after: 400 },
    }),
    new Paragraph({
      text: "Urgent Community Needs",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    ...report.urgentNeeds.map(need => new Paragraph({
      children: [
        new TextRun({ text: `[${need.priority}] `, bold: true, color: need.priority === 'Critical' ? 'FF0000' : '333333' }),
        new TextRun({ text: `${need.location}: `, italics: true }),
        new TextRun(need.resourceRequired),
      ],
      spacing: { after: 100 },
    })),
    new Paragraph({
      text: "Resource Gaps & Resource Flow",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 100 },
    }),
    ...report.resourceGaps.map(gap => new Paragraph({
      text: "• " + gap,
      spacing: { after: 100 },
    })),
    new Paragraph({
      text: "Projected Social Impact",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 100 },
    }),
    new Paragraph({
      children: [new TextRun(report.potentialImpact.projection)],
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: "Operational Action Plan",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
    ...report.actionPlan.map(action => new Paragraph({
      text: "✓ " + action,
      spacing: { after: 100 },
    })),
  ];

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `CareLink_Stakeholder_Report_${Date.now()}.docx`);
}

export async function exportToPPT(report: AnalysisReport) {
  const pptx = new pptxgen();

  // Title Slide
  let slide = pptx.addSlide();
  slide.background = { color: "FFFFFF" };
  slide.addText("CareLink", { x: 0.5, y: 1.5, w: "90%", h: 1, fontSize: 44, color: "2563EB", align: "center", bold: true });
  slide.addText("HUMANITARIAN IMPACT & RESOURCE EFFICIENCY", { x: 0.5, y: 2.5, w: "90%", h: 0.5, fontSize: 18, color: "666666", align: "center", italic: true });

  // Resource Gaps vs Potential Impact
  slide = pptx.addSlide();
  slide.addText("RESOURCE GAPS & SOCIAL POTENTIAL", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 24, color: "2563EB", bold: true });
  
  slide.addText("CURRENT GAPS:", { x: 0.5, y: 1.2, w: "45%", h: 0.3, fontSize: 14, color: "000B26", bold: true });
  slide.addText(report.resourceGaps.join("\n"), { x: 0.5, y: 1.6, w: "45%", h: 2, fontSize: 14, color: "333333" });

  slide.addText("PROJECTED IMPACT:", { x: 5.0, y: 1.2, w: "45%", h: 0.3, fontSize: 14, color: "10B981", bold: true });
  slide.addText(report.potentialImpact.projection, { x: 5.0, y: 1.6, w: "45%", h: 2, fontSize: 14, color: "333333" });

  // Volunteer Optimization
  if (report.volunteerOptimization) {
    slide = pptx.addSlide();
    slide.addText("VOLUNTEER & NGO OPTIMIZATION", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 24, color: "2563EB", bold: true });
    slide.addText(`Total Potential Matches: ${report.volunteerOptimization.volunteerMatchCount}`, { x: 0.5, y: 1.5, w: "90%", h: 0.5, fontSize: 18, color: "333333", bold: true });
    slide.addText(`Target NGOs: ${report.volunteerOptimization.suggestedNGOs.join(", ")}`, { x: 0.5, y: 2.2, w: "90%", h: 0.5, fontSize: 16, color: "666666" });
    slide.addText(`Critical Skills Identified: ${report.volunteerOptimization.skillsIdentified.join(", ")}`, { x: 0.5, y: 3.0, w: "90%", h: 0.5, fontSize: 16, color: "666666" });
  }

  pptx.writeFile({ fileName: `CareLink_Asset_Pack_${Date.now()}.pptx` });
}
