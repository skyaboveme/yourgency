import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, ArrowRight, BrainCircuit } from 'lucide-react';
import { generateLeadScore, generateDeepAnalysis } from '../services/geminiService';
import { LeadScore } from '../types';

const Prospecting: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('HVAC');
  const [availableIndustries, setAvailableIndustries] = useState<string[]>(['HVAC', 'Plumbing', 'Electrical', 'Pest Control', 'Roofing']);
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [score, setScore] = useState<LeadScore | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null);

  // New Fields
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  React.useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.industries && Array.isArray(data.industries) && data.industries.length > 0) {
          setAvailableIndustries(data.industries);
          if (!data.industries.includes(industry)) {
            setIndustry(data.industries[0]);
          }
        }
      })
      .catch(err => console.log('Using default industries:', err));
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setScore(null);
    setDeepAnalysis(null);

    const result = await generateLeadScore(companyName, industry, observations);
    setScore(result);
    setIsLoading(false);
  };

  const handleDeepAnalyze = async () => {
    if (!companyName || !observations) return;
    setIsThinking(true);
    const analysis = await generateDeepAnalysis(companyName, industry, observations);
    setDeepAnalysis(analysis);
    setIsThinking(false);
  };

  const handleAddPipeline = async () => {
    if (!score) return;

    try {
      const prospect = {
        id: crypto.randomUUID(),
        companyName,
        contactName: contactName || 'Unknown',
        email: email || '',
        phone: phone || '',
        website: website || '',
        industry,
        stage: 'prospect',
        revenueRange: 'Unknown',
        score: score,
        notes: observations,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospect)
      });

      if (res.ok) {
        alert('Prospect added to pipeline!');
        // Reset form or just leave it? Let's leave it for now so they can see what they added.
      } else {
        alert('Failed to add prospect. Please try again.');
      }
    } catch (error) {
      console.error('Error adding prospect:', error);
      alert('Error adding prospect.');
    }
  };

  const getScoreColor = (value: number) => {
    if (value >= 8) return 'bg-green-500';
    if (value >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompositeColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Prospect Intelligence</h2>
        <p className="text-gray-500">Analyze a potential client to determine fit and strategy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Acme Heating & Cooling"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. acmehvac.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {availableIndustries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations / URL / Notes
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32"
                placeholder="Paste URL or describe: 'Website from 2015, no reviews on Google, owner seems active on Facebook but no ads running...'"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isThinking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Analyze Prospect</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col min-h-[500px]">
          {!score && !isLoading && !isThinking && !deepAnalysis && (
            <div className="text-center text-gray-400 my-auto">
              <Search className="mx-auto mb-3 opacity-50" size={48} />
              <p>Enter prospect details to generate a Yourgency Score.</p>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-gray-500 my-auto">
              <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={48} />
              <p>Yourgency is researching {companyName || 'the prospect'}...</p>
            </div>
          )}

          {score && !deepAnalysis && !isThinking && (
            <div className="space-y-6 animate-fade-in h-full flex flex-col">
              <div className="text-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Composite Lead Score</span>
                <div className={`text-6xl font-black my-2 ${getCompositeColor(score.composite)}`}>
                  {score.composite}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${score.composite >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {score.composite >= 80 ? 'HOT LEAD' : score.composite >= 60 ? 'WARM LEAD' : 'COLD LEAD'}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Fit', value: score.fit },
                  { label: 'Need', value: score.need },
                  { label: 'Timing', value: score.timing },
                  { label: 'Readiness', value: score.readiness }
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>{metric.label}</span>
                      <span>{metric.value}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreColor(metric.value)}`}
                        style={{ width: `${metric.value * 10}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700 italic">
                "{score.rationale}"
              </div>

              <div className="mt-auto space-y-3 pt-4">
                <button
                  onClick={handleDeepAnalyze}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <BrainCircuit size={18} />
                  <span>Deep Strategic Analysis (Thinking Mode)</span>
                </button>
                <button
                  onClick={handleAddPipeline}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 transition-all">
                  <span>Add to Pipeline</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {isThinking && (
            <div className="text-center text-gray-500 my-auto animate-pulse">
              <BrainCircuit className="animate-bounce mx-auto mb-3 text-indigo-600" size={48} />
              <p className="font-semibold text-lg text-indigo-900">Deep Thinking...</p>
              <p className="text-sm mt-2">Formulating strategy. This may take a moment.</p>
            </div>
          )}

          {deepAnalysis && (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-4 text-indigo-800">
                <BrainCircuit size={24} />
                <h3 className="font-bold text-lg">Strategic Analysis Report</h3>
              </div>
              <div className="flex-1 overflow-y-auto bg-white p-4 rounded-lg border border-gray-200 shadow-inner text-sm leading-relaxed whitespace-pre-wrap text-gray-800 h-[400px]">
                {deepAnalysis}
              </div>
              <button
                onClick={() => setDeepAnalysis(null)}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
              >
                Back to Score
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prospecting;