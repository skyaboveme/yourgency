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

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

export interface Activity {
  id: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
  type: ActivityType;
  direction?: 'inbound' | 'outbound';
  status?: 'planned' | 'completed';
  subject?: string;
  content: string;
  date: string;
  user_name?: string; // Joined field
}

export interface LeadScore {
  fit: number;
  need: number;
  timing: number;
  readiness: number;
  composite: number;
  rationale: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for creation
  role: 'admin' | 'user';
  lastLogin?: string; // timestamp
}

export interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  industry: string;
  revenueRange: string;
  stage: PipelineStage;
  score?: LeadScore;
  lastContact?: string;
  notes?: string;
  aiAnalysis?: string;
  activities?: Activity[];
  assignedTo?: string; // User ID
  assignedToName?: string; // Display Name (joined)
}

export interface Alert {
  id: string;
  type: 'HOT_PROSPECT' | 'STALLED' | 'SEASONAL' | 'COMPETITOR' | 'UPSELL' | 'REFERRAL' | 'CONTENT';
  message: string;
  companyId?: string;
  timestamp: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website?: string;
  revenueRange?: string;
  techStack?: string[]; // parsed from JSON
  created_at?: string;
}

export interface Contact {
  id: string;
  accountId: string;
  accountName?: string; // join
  name: string;
  email: string;
  phone?: string;
  role?: string;
  notes?: string;
}

export interface Opportunity {
  id: string;
  accountId: string;
  accountName?: string; // join
  primaryContactId?: string;
  contactName?: string; // join
  name: string; // "Acme Q1 Deal"
  stage: PipelineStage;
  value: number;
  closeDate?: string;
  probability?: number;
  notes?: string;
  assignedTo?: string;
  assignedToName?: string;

  // Legacy/UI Compatibility
  industry?: string;
  score?: LeadScore; // Derived/Attached
}

export interface MetricData {
  name: string;
  value: number;
  fullMark?: number;
}