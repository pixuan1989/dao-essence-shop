/**
 * POST /api/track
 * Receives analytics events from frontend, aggregates into Redis by day.
 * 
 * Event types:
 *   page_view    - page load
 *   tool_submit  - tool form submitted (with anonymized user data)
 *   tool_result  - tool result displayed
 *   tool_retry   - user clicked retry/change info
 *   pay_intent   - user clicked a CTA/pay button
 *   cta_click    - blog CTA button clicked
 *
 * Body: { event: string, data: object }
 * data.tool: bazi | favorable-element | five-elements | soulmate | almanac | blog
 */

import { redisGet, redisSet } from '../shared/redis.js';

function todayKey() {
    const d = new Date();
    return `stats:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function handler(req, res) {
    // Only POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { event, data = {} } = req.body;

        if (!event) {
            return res.status(400).json({ error: 'Missing event' });
        }

        const key = todayKey();
        let dayData = await redisGet(key) || {
            date: key.replace('stats:', ''),
            page_views: {},
            tool_submissions: {},
            tool_results: {},
            tool_retries: {},
            pay_intents: {},
            cta_clicks: {},
            // Aggregated user profiles (anonymized)
            profiles: {
                gender: {},
                age_range: {},
                day_master_element: {},
                favorable_elements: {}
            }
        };

        // Record event
        switch (event) {
            case 'page_view': {
                const page = data.page || 'unknown';
                dayData.page_views[page] = (dayData.page_views[page] || 0) + 1;
                break;
            }
            case 'tool_submit': {
                const tool = data.tool || 'unknown';
                dayData.tool_submissions[tool] = (dayData.tool_submissions[tool] || 0) + 1;

                // Aggregate anonymized profile data
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
                // Ignore unknown events
                break;
        }

        await redisSet(key, dayData);
        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error('Track error:', err.message);
        return res.status(500).json({ error: 'Internal error' });
    }
}
