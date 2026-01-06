export enum PipelineStage {
  PROSPECT = 'PROSPECT',
  OUTREACH = 'OUTREACH',
  ENGAGED = 'ENGAGED',
  DISCOVERY = 'DISCOVERY',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
}

export interface LeadScore {
  fit: number;
  need: number;
  timing: number;
  readiness: number;
  composite: number;
  rationale: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: 'HVAC' | 'Plumbing' | 'Electrical' | 'Roofing' | 'Pest Control' | 'Other';
  revenueRange: string;
  stage: PipelineStage;
  score?: LeadScore;
  lastContact?: string;
  notes?: string;
  aiAnalysis?: string;
}

export interface Alert {
  id: string;
  type: 'HOT_PROSPECT' | 'STALLED' | 'SEASONAL' | 'COMPETITOR' | 'UPSELL' | 'REFERRAL' | 'CONTENT';
  message: string;
  companyId?: string;
  timestamp: string;
}

export interface MetricData {
  name: string;
  value: number;
  fullMark?: number;
}