import { ExecutionContext, KVNamespace } from '@cloudflare/workers-types';

interface Env {
    CONFIG: KVNamespace;
    ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // API Handling
        if (url.pathname.startsWith('/api/config')) {
            // CORS headers
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            if (request.method === 'OPTIONS') {
                return new Response(null, { headers: corsHeaders });
            }

            try {
                if (request.method === 'GET') {
                    const config = await env.CONFIG.get('settings', { type: 'json' });
                    return new Response(JSON.stringify(config || {
                        industries: ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Pest Control', 'Other'],
                        systemInstruction: '' // Default empty, client falls back to constants if needed, or we fetch from constants
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                if (request.method === 'POST') {
                    const body = await request.json();
                    await env.CONFIG.put('settings', JSON.stringify(body));
                    return new Response(JSON.stringify({ success: true }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            } catch (error) {
                return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: corsHeaders });
            }

            return new Response('Method not allowed', { status: 405, headers: corsHeaders });
        }

        // Static Asset Serving (default behavior)
        return env.ASSETS.fetch(request);
    },
};
