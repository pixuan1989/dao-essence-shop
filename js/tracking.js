/**
 * DaoEssence Analytics Tracking SDK
 * Lightweight, privacy-first, anonymized event tracking.
 * 
 * Usage:
 *   <script src="/js/tracking.js"></script>
 *   DaoTrack.pageView('bazi-calculator');
 *   DaoTrack.toolSubmit('bazi', { gender: 'M', age_range: '26-30', day_master_element: 'Wood', favorable_elements: ['Water','Metal'] });
 *   DaoTrack.toolResult('bazi');
 *   DaoTrack.toolRetry('bazi');
 *   DaoTrack.payIntent('bazi-result-cta');
 *   DaoTrack.ctaClick('blog-bazi-report');
 */

(function() {
    'use strict';

    var ENDPOINT = '/api/stats';
    var queue = [];
    var sending = false;

    // Deduplicate: only track page_view once per page load
    var _trackedPages = {};
    // Deduplicate: only track tool_submit once per tool per page load
    var _trackedSubmissions = {};
    // Rate limit: max 1 event per type per 3 seconds
    var _lastSent = {};

    function send(event, data) {
        // Rate limit check
        var now = Date.now();
        var rateKey = event + ':' + (data.tool || data.page || data.source || '');
        if (_lastSent[rateKey] && now - _lastSent[rateKey] < 3000) {
            return;
        }
        _lastSent[rateKey] = now;

        queue.push({ event: event, data: data });
        flush();
    }

    function flush() {
        if (sending || queue.length === 0) return;
        sending = true;

        // Batch: send all queued events at once
        var batch = queue.splice(0, queue.length);

        // Use sendBeacon for reliability (works even if page unloads)
        var payload = JSON.stringify(batch);

        if (navigator.sendBeacon) {
            try {
                var blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(ENDPOINT, blob);
                sending = false;
                return;
            } catch (e) {
                // Fallback to fetch
            }
        }

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).then(function() {
            sending = false;
            if (queue.length > 0) flush();
        }).catch(function() {
            // Silent fail — analytics should never break the page
            sending = false;
        });
    }

    /**
     * Calculate age range from birth year
     */
    function getAgeRange(birthYear) {
        var currentYear = new Date().getFullYear();
        var age = currentYear - birthYear;
        if (age < 18) return '<18';
        if (age < 26) return '18-25';
        if (age < 31) return '26-30';
        if (age < 36) return '31-35';
        if (age < 41) return '36-40';
        if (age < 51) return '41-50';
        return '50+';
    }

    /**
     * Track page view (deduplicated per page per session)
     */
    function pageView(page) {
        if (_trackedPages[page]) return;
        _trackedPages[page] = true;
        send('page_view', { page: page });
    }

    /**
     * Track tool form submission (with anonymized profile data)
     */
    function toolSubmit(tool, opts) {
        if (_trackedSubmissions[tool]) return;
        _trackedSubmissions[tool] = true;

        var data = { tool: tool };

        if (opts) {
            if (opts.gender) data.gender = opts.gender;
            if (opts.birthYear) data.age_range = getAgeRange(opts.birthYear);
            else if (opts.age_range) data.age_range = opts.age_range;
            if (opts.day_master_element) data.day_master_element = opts.day_master_element;
            if (opts.favorable_elements) data.favorable_elements = opts.favorable_elements;
        }

        send('tool_submit', data);
    }

    /**
     * Track tool result display
     */
    function toolResult(tool) {
        send('tool_result', { tool: tool });
    }

    /**
     * Track retry/change info
     */
    function toolRetry(tool) {
        send('tool_retry', { tool: tool });
    }

    /**
     * Track payment intent (user clicked pay button)
     */
    function payIntent(source) {
        send('pay_intent', { source: source });
    }

    /**
     * Track CTA click (blog article CTA)
     */
    function ctaClick(source) {
        send('cta_click', { source: source });
    }

    // Expose
    window.DaoTrack = {
        pageView: pageView,
        toolSubmit: toolSubmit,
        toolResult: toolResult,
        toolRetry: toolRetry,
        payIntent: payIntent,
        ctaClick: ctaClick,
        getAgeRange: getAgeRange
    };
})();
