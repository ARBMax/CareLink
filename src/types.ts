export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface StrategicLever {
  name: string;
  description: string;
  min: number;
  max: number;
  current: number;
  unit: string;
}

export interface AnalysisReport {
  executiveSummary: string;
  urgentNeeds: {
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    location: string;
    lat?: number;
    lng?: number;
    resourceRequired: string;
    description: string;
  }[];
  resourceGaps: string[];
  potentialImpact: {
    projection: string;
    metrics: Array<{ label: string; current: number; projected: number }>;
    timeline: Array<{ period: string; expectedOutcome: string }>;
  };
  actionPlan: string[];
  confidenceScore: number;
  volunteerOptimization?: {
    suggestedNGOs: string[];
    volunteerMatchCount: number;
    skillsIdentified: string[];
  };
  stakeholderViews?: {
    coordinator?: string;
    fieldDirector?: string;
    donorRep?: string;
  };
  chartData?: ChartDataPoint[];
  chartTitle?: string;
  marketIntelligence?: {
    regionalTrends: string[];
    demographicInsights: string;
  };
  strategicLevers?: StrategicLever[];
}

export interface AnalysisSynthesis {
  comparisonSummary: string;
  divergencePoints: string[];
  commonTrends: string[];
  unifiedActionPlan: string[];
  combinedRiskScore: number;
}

export interface DataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface RawData {
  content: string;
  format: 'json' | 'csv' | 'text';
}
