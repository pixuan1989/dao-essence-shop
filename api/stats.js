/**
 * GET /api/stats?range=7|30|90
 * Aggregates daily stats from Redis and returns summary.
 * Auth: simple Bearer token (DAOSTATS_SECRET env var)
 */

import { redisGet, redisKeys } from '../shared/redis.js';

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

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple auth check
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (token !== process.env.DAOSTATS_SECRET && process.env.DAOSTATS_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const range = parseInt(req.query.range) || 7;

        // Get all stats keys
        const allKeys = await redisKeys('stats:*');
        if (allKeys.length === 0) {
            return res.status(200).json({
                range,
                total_days: 0,
                page_views_total: 0,
                tool_submissions_total: 0,
                pay_intents_total: 0,
                page_views_by_page: [],
                tool_submissions_by_tool: [],
                tool_results_by_tool: [],
                tool_retries_by_tool: [],
                pay_intents_by_source: [],
                cta_clicks_by_source: [],
                profiles: { gender: [], age_range: [], day_master_element: [], favorable_elements: [] },
                daily_trend: []
            });
        }

        // Sort keys by date descending
        allKeys.sort().reverse();

        // Take last N days (or all if fewer)
        const recentKeys = allKeys.slice(0, range);

        // Fetch all day data
        const days = [];
        for (const key of recentKeys) {
            const data = await redisGet(key);
            if (data) days.push(data);
        }

        if (days.length === 0) {
            return res.status(200).json({
                range,
                total_days: 0,
                page_views_total: 0,
                tool_submissions_total: 0,
                pay_intents_total: 0,
                page_views_by_page: [],
                tool_submissions_by_tool: [],
                tool_results_by_tool: [],
                tool_retries_by_tool: [],
                pay_intents_by_source: [],
                cta_clicks_by_source: [],
                profiles: { gender: [], age_range: [], day_master_element: [], favorable_elements: [] },
                daily_trend: []
            });
        }

        // Aggregate
        const pageViews = mergeCounters(days, 'page_views');
        const toolSubs = mergeCounters(days, 'tool_submissions');
        const toolResults = mergeCounters(days, 'tool_results');
        const toolRetries = mergeCounters(days, 'tool_retries');
        const payIntents = mergeCounters(days, 'pay_intents');
        const ctaClicks = mergeCounters(days, 'cta_clicks');
        const profiles = mergeProfiles(days);

        // Daily trend (page views + tool submissions per day)
        const dailyTrend = days.map(d => ({
            date: d.date,
            page_views: Object.values(d.page_views || {}).reduce((a, b) => a + b, 0),
            tool_submissions: Object.values(d.tool_submissions || {}).reduce((a, b) => a + b, 0),
            pay_intents: Object.values(d.pay_intents || {}).reduce((a, b) => a + b, 0)
        })).reverse(); // chronological order

        const totalPV = Object.values(pageViews).reduce((a, b) => a + b, 0);
        const totalToolSubs = Object.values(toolSubs).reduce((a, b) => a + b, 0);
        const totalPayIntents = Object.values(payIntents).reduce((a, b) => a + b, 0);

        // Get total Creem checkout intents from existing Redis data
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
