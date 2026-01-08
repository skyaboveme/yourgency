import { ExecutionContext, KVNamespace, D1Database } from '@cloudflare/workers-types';
import { Prospect, PipelineStage, User } from '../types';

export interface Env {
    CONFIG: KVNamespace;
    DB: D1Database;
    ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // API Routing
        if (url.pathname.startsWith('/api/')) {
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            if (request.method === 'OPTIONS') {
                return new Response(null, { headers: corsHeaders });
            }

            // GET /api/config (Industries)
            if (url.pathname === '/api/config' && request.method === 'GET') {
                const defaults = {
                    industries: [
                        'Plumbing', 'HVAC', 'Landscaping', 'Roofing', 'Electrician',
                        'Tourism/Travel', 'Real Estate', 'Legal'
                    ],
                    systemInstruction: "You are an AI sales assistant..."
                };

                let settings = await env.CONFIG.get('settings', { type: 'json' }) as any;
                if (!settings) settings = defaults;

                return new Response(JSON.stringify(settings), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // POST /api/config (Save Settings)
            if (url.pathname === '/api/config' && request.method === 'POST') {
                try {
                    const data = await request.json();
                    await env.CONFIG.put('settings', JSON.stringify(data));
                    return new Response(JSON.stringify({ success: true }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // POST /api/login
            if (url.pathname === '/api/login' && request.method === 'POST') {
                try {
                    const { email, password } = await request.json() as any;

                    // 1. Check against DB
                    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first() as User | null;

                    if (!user) {
                        return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: corsHeaders });
                    }

                    // 2. Validate Password (Simple check for MVP or migration)
                    // If no password set in DB (legacy), allow Login with default or fail?
                    // Strategy: If user exists but no password, we might need a reset flow.
                    // For now, we assume migration sets a default or we check plain text.

                    if (user.password !== password) {
                        return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: corsHeaders });
                    }

                    // 3. Update Last Login
                    await env.DB.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id).run();

                    // 4. Return User (without password)
                    const { password: _, ...safeUser } = user;

                    return new Response(JSON.stringify(safeUser), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // GET /api/users
            if (url.pathname === '/api/users' && request.method === 'GET') {
                try {
                    const { results } = await env.DB.prepare(
                        "SELECT id, name, email, role, last_login, created_at FROM users ORDER BY created_at DESC"
                    ).all();
                    return new Response(JSON.stringify(results), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    // Provide fallback or empty list if table doesn't exist yet to prevent crash
                    return new Response(JSON.stringify([]), { headers: corsHeaders, status: 200 });
                }
            }

            // POST /api/users
            if (url.pathname === '/api/users' && request.method === 'POST') {
                try {
                    const data = await request.json() as User;
                    const id = crypto.randomUUID();
                    // Default password for new users if not provided: "password123" (Change on first login recommended)
                    const initialPassword = data.password || "password123";

                    await env.DB.prepare(
                        "INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)"
                    ).bind(id, data.name, data.email, data.role || 'user', initialPassword).run();

                    return new Response(JSON.stringify({ success: true, id }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // GET /api/prospects
            if (url.pathname === '/api/prospects' && request.method === 'GET') {
                try {
                    // Join with users to get assignedToName
                    // Note: LEFT JOIN in case assigned_to is null or user deleted
                    const { results } = await env.DB.prepare(`
            SELECT p.*, u.name as assigned_to_name 
            FROM prospects p 
            LEFT JOIN users u ON p.assigned_to = u.id 
            ORDER BY p.created_at DESC
          `).all();

                    const prospects = results.map(row => ({
                        id: row.id,
                        companyName: row.company_name,
                        contactName: row.contact_name,
                        email: row.email,
                        phone: row.phone,
                        website: row.website,
                        industry: row.industry,
                        stage: row.stage,
                        revenueRange: row.revenue_range,
                        score: row.score_details ? JSON.parse(row.score_details as string) : undefined,
                        notes: row.notes,
                        assignedTo: row.assigned_to,
                        assignedToName: row.assigned_to_name
                    }));

                    return new Response(JSON.stringify(prospects), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // POST /api/prospects
            if (url.pathname === '/api/prospects' && request.method === 'POST') {
                try {
                    const data = await request.json() as Prospect;
                    const scoreStr = data.score ? JSON.stringify(data.score) : null;

                    await env.DB.prepare(
                        `INSERT INTO prospects (id, company_name, contact_name, email, phone, website, industry, stage, revenue_range, score_composite, score_details, notes, assigned_to) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    ).bind(
                        data.id, data.companyName, data.contactName, data.email, data.phone, data.website,
                        data.industry, data.stage, data.revenueRange,
                        data.score?.composite || 0, scoreStr, data.notes, data.assignedTo
                    ).run();

                    return new Response(JSON.stringify({ success: true }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // PUT /api/prospects (Bulk Update / Sync)
            if (url.pathname === '/api/prospects' && request.method === 'PUT') {
                try {
                    const list = await request.json() as Prospect[];

                    const stmt = env.DB.prepare(`
               INSERT INTO prospects (id, company_name, contact_name, email, phone, website, industry, stage, revenue_range, score_composite, score_details, notes, assigned_to)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET
               stage=excluded.stage,
               contact_name=excluded.contact_name,
               email=excluded.email,
               phone=excluded.phone,
               website=excluded.website,
               revenue_range=excluded.revenue_range,
               notes=excluded.notes,
               assigned_to=excluded.assigned_to
            `);

                    const batch = list.map(data => {
                        const scoreStr = data.score ? JSON.stringify(data.score) : null;
                        return stmt.bind(
                            data.id, data.companyName, data.contactName, data.email, data.phone, data.website,
                            data.industry, data.stage, data.revenueRange,
                            data.score?.composite || 0, scoreStr, data.notes, data.assignedTo
                        );
                    });

                    await env.DB.batch(batch);

                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

                } catch (err) {
                    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders });
                }
            }

            // ... (previous endpoints kept above)

            // GET /api/accounts
            if (url.pathname === '/api/accounts' && request.method === 'GET') {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM accounts ORDER BY name ASC").all();
                    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // POST /api/accounts
            if (url.pathname === '/api/accounts' && request.method === 'POST') {
                try {
                    const data = await request.json() as any;
                    const id = crypto.randomUUID();
                    await env.DB.prepare(
                        "INSERT INTO accounts (id, name, industry, website, revenue_range, tech_stack) VALUES (?, ?, ?, ?, ?, ?)"
                    ).bind(id, data.name, data.industry, data.website, data.revenueRange, JSON.stringify(data.techStack || [])).run();
                    return new Response(JSON.stringify({ success: true, id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // GET /api/contacts
            if (url.pathname === '/api/contacts' && request.method === 'GET') {
                try {
                    const { results } = await env.DB.prepare(`
                        SELECT c.*, a.name as account_name 
                        FROM contacts c 
                        LEFT JOIN accounts a ON c.account_id = a.id
                        ORDER BY c.created_at DESC
                    `).all();
                    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // POST /api/contacts
            if (url.pathname === '/api/contacts' && request.method === 'POST') {
                try {
                    const data = await request.json() as any;
                    const id = crypto.randomUUID();
                    await env.DB.prepare(
                        "INSERT INTO contacts (id, account_id, name, email, phone, role, notes) VALUES (?, ?, ?, ?, ?, ?, ?)"
                    ).bind(id, data.accountId, data.name, data.email, data.phone, data.role, data.notes).run();
                    return new Response(JSON.stringify({ success: true, id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // GET /api/opportunities
            if (url.pathname === '/api/opportunities' && request.method === 'GET') {
                try {
                    const { results } = await env.DB.prepare(`
                        SELECT o.*, a.name as account_name, c.name as contact_name, u.name as assigned_to_name
                        FROM opportunities o
                        LEFT JOIN accounts a ON o.account_id = a.id
                        LEFT JOIN contacts c ON o.primary_contact_id = c.id
                        LEFT JOIN users u ON o.assigned_to = u.id
                        ORDER BY o.created_at DESC
                    `).all();

                    const opportunities = results.map(row => ({
                        id: row.id,
                        accountId: row.account_id,
                        accountName: row.account_name,
                        primaryContactId: row.primary_contact_id,
                        contactName: row.contact_name,
                        name: row.name,
                        stage: row.stage,
                        value: row.value,
                        closeDate: row.close_date,
                        probability: row.probability,
                        notes: row.notes,
                        assignedTo: row.assigned_to,
                        assignedToName: row.assigned_to_name,
                        // Mappings for older UI components
                        companyName: row.account_name,
                        industry: 'Unknown',
                        revenueRange: 'Unknown'
                    }));

                    return new Response(JSON.stringify(opportunities), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // POST /api/opportunities
            if (url.pathname === '/api/opportunities' && request.method === 'POST') {
                try {
                    const data = await request.json() as any;
                    const id = crypto.randomUUID();
                    await env.DB.prepare(
                        "INSERT INTO opportunities (id, account_id, primary_contact_id, name, stage, value, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                    ).bind(id, data.accountId, data.primaryContactId, data.name, data.stage || 'PROSPECT', data.value || 0, data.notes, data.assignedTo).run();
                    return new Response(JSON.stringify({ success: true, id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // PUT /api/opportunities (Bulk Update / Sync)
            if (url.pathname === '/api/opportunities' && request.method === 'PUT') {
                try {
                    const list = await request.json() as any[];
                    // Allow bulk upsert or updates. 
                    // Note: This matches the 'prospects' behavior.

                    const stmt = env.DB.prepare(`
                        INSERT INTO opportunities (id, account_id, primary_contact_id, name, stage, value, notes, assigned_to)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                        stage=excluded.stage,
                        value=excluded.value,
                        notes=excluded.notes,
                        assigned_to=excluded.assigned_to
                    `);

                    const batch = list.map(data => {
                        // Fallbacks for mandatory fields if missing in update payload
                        return stmt.bind(
                            data.id,
                            data.accountId || 'unknown', // Warning: Needs valid account_id
                            data.primaryContactId,
                            data.name || 'Untitled Deal',
                            data.stage,
                            data.value || 0,
                            data.notes,
                            data.assignedTo
                        );
                    });

                    // Filter out invalid ones if strict? For now, let D1 handle constraints (foreign key might fail if accountId invalid)
                    // Actually, if simply updating stage, we need original accountId. 
                    // To avoid complexity, we assume the frontend sends the FULL object back (which it does in Pipeline.tsx).

                    await env.DB.batch(batch);
                    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            // POST /api/migrate
            if (url.pathname === '/api/migrate' && request.method === 'POST') {
                try {
                    // 1. Seed Admin User if not exists
                    const adminEmail = 'skyabove@gmail.com';
                    const adminExists = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(adminEmail).first();

                    if (!adminExists) {
                        await env.DB.prepare(
                            "INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)"
                        ).bind(crypto.randomUUID(), 'Alexander', adminEmail, 'admin', 'Looploop99$$@').run();
                        console.log("Seeded admin user");
                    }

                    // 2. Fetch all legacy prospects
                    const { results: prospects } = await env.DB.prepare("SELECT * FROM prospects").all();
                    if (!prospects || prospects.length === 0) {
                        return new Response(JSON.stringify({ message: "Admin seeded, no prospects to migrate" }), { headers: corsHeaders });
                    }

                    const batch = [];

                    for (const p of prospects) {
                        const accountId = crypto.randomUUID();
                        const contactId = crypto.randomUUID();
                        const oppId = crypto.randomUUID();

                        // 1. Create Account
                        batch.push(env.DB.prepare(
                            "INSERT INTO accounts (id, name, industry, website, revenue_range) VALUES (?, ?, ?, ?, ?)"
                        ).bind(accountId, p.company_name, p.industry, p.website, p.revenue_range));

                        // 2. Create Contact
                        batch.push(env.DB.prepare(
                            "INSERT INTO contacts (id, account_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?, ?)"
                        ).bind(contactId, accountId, p.contact_name, p.email, p.phone, "Primary Contact"));

                        // 3. Create Opportunity (Deal)
                        batch.push(env.DB.prepare(
                            "INSERT INTO opportunities (id, account_id, primary_contact_id, name, stage, value, notes, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                        ).bind(
                            oppId, accountId, contactId,
                            `${p.company_name} Deal`, // Name: "Acme Corp Deal"
                            p.stage,
                            0, // Value (unknown in old model)
                            p.notes,
                            p.assigned_to
                        ));
                    }

                    if (batch.length > 0) {
                        await env.DB.batch(batch);
                    }

                    return new Response(JSON.stringify({ success: true, migrated: prospects.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

                } catch (err) { return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: corsHeaders }); }
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        // Static Assets
        return env.ASSETS.fetch(request);
    }
};
