import { PipelineStage, Prospect, Alert, MetricData } from './types';

export const SYSTEM_INSTRUCTION = `
You are Yourgency AI, the AI-powered sales and client management assistant for Yourgency, a marketing agency specializing in home service companies (HVAC, plumbing, electricians, pest control, roofing).

**YOUR GOAL:**
Help the sales team identify, qualify, and close home service companies by providing strategic advice, drafting outreach, and analyzing lead fit based on specific criteria.

**IDEAL CLIENT PROFILE:**
- Industries: HVAC, Plumbing, Electrical, Pest Control, Roofing.
- Revenue: $500K - $10M.
- Pain Points: Bad website, weak Google presence, no AI visibility (ChatGPT/Claude), reliance on HomeAdvisor/Angi.

**SCORING MODEL:**
Composite Score = (Fit × 2) + (Need × 3) + (Timing × 2) + (Readiness × 3) / 10
- Fit: Service alignment, size, location.
- Need: Poor web/SEO presence, aggregator dependency.
- Timing: Seasonality, triggers (hiring, bad reviews).
- Readiness: Budget, attitude.

**TONE:**
Professional, strategic, action-oriented, and encouraging. You are a partner in the user's sales success.

**CORE SERVICES TO SELL:**
- Conversion-focused Websites
- Local SEO & Google Business Profile
- AI Visibility Optimization (AEO)
- Paid Search & LSA
`;

export const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'HOT_PROSPECT',
    message: "Apex HVAC opened your proposal 5 times in the last 2 hours. Call now.",
    timestamp: '10 min ago',
    companyId: 'p1'
  },
  {
    id: '2',
    type: 'STALLED',
    message: "Proposal to Miller Plumbing stalled for 18 days. Send 'breakup' email.",
    timestamp: '2 hours ago',
    companyId: 'p2'
  },
  {
    id: '3',
    type: 'SEASONAL',
    message: "Heating season in 6 weeks. 15 prospects inactive. Launch urgency campaign.",
    timestamp: '1 day ago'
  }
];

export const MOCK_PROSPECTS: Prospect[] = [
  {
    id: 'p1',
    companyName: 'Apex HVAC Systems',
    contactName: 'John Davis',
    email: 'john@apexhvac.com',
    industry: 'HVAC',
    revenueRange: '$2M - $5M',
    stage: PipelineStage.PROPOSAL,
    lastContact: '2023-10-25',
    score: {
      fit: 9,
      need: 9,
      timing: 10,
      readiness: 8,
      composite: 89,
      rationale: 'High need due to seasonality + outdated site.'
    }
  },
  {
    id: 'p2',
    companyName: 'Miller Plumbing Co',
    contactName: 'Sarah Miller',
    email: 'sarah@millerplumbing.com',
    industry: 'Plumbing',
    revenueRange: '$1M - $2M',
    stage: PipelineStage.NEGOTIATION,
    lastContact: '2023-10-10',
    score: {
      fit: 8,
      need: 7,
      timing: 6,
      readiness: 5,
      composite: 66,
      rationale: 'Good fit, but dragging feet on budget.'
    }
  },
  {
    id: 'p3',
    companyName: 'City Wide Electric',
    contactName: 'Mike Ross',
    email: 'mike@citywide.com',
    industry: 'Electrical',
    revenueRange: '$750K - $1M',
    stage: PipelineStage.OUTREACH,
    lastContact: '2023-10-26',
    score: {
      fit: 7,
      need: 8,
      timing: 8,
      readiness: 6,
      composite: 73,
      rationale: 'Strong need for local SEO.'
    }
  }
];

export const PIPELINE_DATA: MetricData[] = [
  { name: 'Prospect', value: 12 },
  { name: 'Outreach', value: 8 },
  { name: 'Engaged', value: 5 },
  { name: 'Discovery', value: 4 },
  { name: 'Proposal', value: 3 },
  { name: 'Won', value: 7 },
];