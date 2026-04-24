/**
 * /api/stats — Unified analytics endpoint
 *   GET  /api/stats?range=7|30|90  — Query aggregated stats (admin dashboard)
 *   POST /api/stats                 — Receive analytics events from frontend
 *
 * Auth: simple Bearer token (DAOSTATS_SECRET env var) for GET only.
 *       POST is open (public tracking).
 */

import { redisGet, redisSet, redisKeys } from '../shared/redis.js';

// ==================== POST: Record analytics event ====================

function todayKey() {
    const d = new Date();
    return `stats:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function handleTrack(req, res) {
    try {
        const body = req.body;
        // Support both single event {event, data} and batch array [{event, data}, ...] from sendBeacon
        const events = Array.isArray(body) ? body : [body];

        const key = todayKey();
        let dayData = await redisGet(key) || {
            date: key.replace('stats:', ''),
            page_views: {},
            tool_submissions: {},
            tool_results: {},
            tool_retries: {},
            pay_intents: {},
            cta_clicks: {},
            profiles: {
                gender: {},
                age_range: {},
                day_master_element: {},
                favorable_elements: {}
            }
        };

        for (const { event, data = {} } of events) {
            if (!event) continue;

            switch (event) {
                case 'page_view': {
                    const page = data.page || 'unknown';
                    dayData.page_views[page] = (dayData.page_views[page] || 0) + 1;
                    break;
                }
                case 'tool_submit': {
                    const tool = data.tool || 'unknown';
                    dayData.tool_submissions[tool] = (dayData.tool_submissions[tool] || 0) + 1;
                    if (data.gender) {
                        dayData.profiles.gender[data.gender] = (dayData.profiles.gender[data.gender] || 0) + 1;
                    }
                    if (data.age_range) {
                        dayData.profiles.age_range[data.age_range] = (dayData.profiles.age_range[data.age_range] || 0) + 1;
                    }
                    if (data.day_master_element) {
                        dayData.profiles.day_master_element[data.day_master_element] = (dayData.profiles.day_master_element[data.day_master_element] || 0) + 1;
                    }
                    if (data.favorable_elements && Array.isArray(data.favorable_elements)) {
                        data.favorable_elements.forEach(el => {
                            dayData.profiles.favorable_elements[el] = (dayData.profiles.favorable_elements[el] || 0) + 1;
                        });
                    }
                    break;
                }
                case 'tool_result': {
                    const tool = data.tool || 'unknown';
                    dayData.tool_results[tool] = (dayData.tool_results[tool] || 0) + 1;
                    break;
                }
                case 'tool_retry': {
                    const tool = data.tool || 'unknown';
                    dayData.tool_retries[tool] = (dayData.tool_retries[tool] || 0) + 1;
                    break;
                }
                case 'pay_intent': {
                    const source = data.source || 'unknown';
                    dayData.pay_intents[source] = (dayData.pay_intents[source] || 0) + 1;
                    break;
                }
                case 'cta_click': {
                    const source = data.source || 'unknown';
                    dayData.cta_clicks[source] = (dayData.cta_clicks[source] || 0) + 1;
                    break;
                }
                default:
                    break;
            }
        }

        await redisSet(key, dayData);
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Track error:', err.message);
        return res.status(500).json({ error: 'Internal error' });
    }
}

// ==================== GET: Query aggregated stats ====================

function mergeCounters(days, key) {
    const merged = {};
    days.forEach(d => {
        const src = d[key] || {};
        Object.entries(src).forEach(([k, v]) => {
            merged[k] = (merged[k] || 0) + v;
        });
    });
    return merged;
}

function mergeProfiles(days) {
    const merged = {
        gender: {},
        age_range: {},
        day_master_element: {},
        favorable_elements: {}
    };
    days.forEach(d => {
        const src = d.profiles || {};
        ['gender', 'age_range', 'day_master_element', 'favorable_elements'].forEach(field => {
            const data = src[field] || {};
            Object.entries(data).forEach(([k, v]) => {
                merged[field][k] = (merged[field][k] || 0) + v;
            });
        });
    });
    return merged;
}

function sortEntries(obj) {
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function emptyResponse(range) {
    return {
        range,
        total_days: 0,
        page_views_total: 0,
        tool_submissions_total: 0,
        pay_intents_total: 0,
        total_checkouts: 0,
        page_views_by_page: [],
        tool_submissions_by_tool: [],
        tool_results_by_tool: [],
        tool_retries_by_tool: [],
        pay_intents_by_source: [],
        cta_clicks_by_source: [],
        profiles: { gender: [], age_range: [], day_master_element: [], favorable_elements: [] },
        daily_trend: []
    };
}

async function handleQuery(req, res) {
    // Simple auth check
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (token !== process.env.DAOSTATS_SECRET && process.env.DAOSTATS_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const range = parseInt(req.query.range) || 7;

        const allKeys = await redisKeys('stats:*');
        if (allKeys.length === 0) {
            return res.status(200).json(emptyResponse(range));
        }

        allKeys.sort().reverse();
        const recentKeys = allKeys.slice(0, range);

        const days = [];
        for (const key of recentKeys) {
            const data = await redisGet(key);
            if (data) days.push(data);
        }

        if (days.length === 0) {
            return res.status(200).json(emptyResponse(range));
        }

        const pageViews = mergeCounters(days, 'page_views');
        const toolSubs = mergeCounters(days, 'tool_submissions');
        const toolResults = mergeCounters(days, 'tool_results');
        const toolRetries = mergeCounters(days, 'tool_retries');
        const payIntents = mergeCounters(days, 'pay_intents');
        const ctaClicks = mergeCounters(days, 'cta_clicks');
        const profiles = mergeProfiles(days);

        const dailyTrend = days.map(d => ({
            date: d.date,
            page_views: Object.values(d.page_views || {}).reduce((a, b) => a + b, 0),
            tool_submissions: Object.values(d.tool_submissions || {}).reduce((a, b) => a + b, 0),
            pay_intents: Object.values(d.pay_intents || {}).reduce((a, b) => a + b, 0)
        })).reverse();

        const totalPV = Object.values(pageViews).reduce((a, b) => a + b, 0);
        const totalToolSubs = Object.values(toolSubs).reduce((a, b) => a + b, 0);
        const totalPayIntents = Object.values(payIntents).reduce((a, b) => a + b, 0);

        let totalCheckouts = 0;
        try {
            const intentIds = await redisGet('checkout_intent_ids') || [];
            totalCheckouts = intentIds.length;
        } catch (e) { /* ignore */ }

        return res.status(200).json({
            range,
            total_days: days.length,
            page_views_total: totalPV,
            tool_submissions_total: totalToolSubs,
            pay_intents_total: totalPayIntents,
            total_checkouts: totalCheckouts,
            page_views_by_page: sortEntries(pageViews),
            tool_submissions_by_tool: sortEntries(toolSubs),
            tool_results_by_tool: sortEntries(toolResults),
            tool_retries_by_tool: sortEntries(toolRetries),
            pay_intents_by_source: sortEntries(payIntents),
            cta_clicks_by_source: sortEntries(ctaClicks),
            profiles: {
                gender: sortEntries(profiles.gender),
                age_range: sortEntries(profiles.age_range),
                day_master_element: sortEntries(profiles.day_master_element),
                favorable_elements: sortEntries(profiles.favorable_elements)
            },
            daily_trend: dailyTrend
        });
    } catch (err) {
        console.error('Stats error:', err.message);
        return res.status(500).json({ error: 'Internal error' });
    }
}

// ==================== Main handler ====================

export default async function handler(req, res) {
    if (req.method === 'POST') {
        return handleTrack(req, res);
    }
    if (req.method === 'GET') {
        return handleQuery(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
