// style_metrics.js — Filter: captures Core Web Vitals and style performance.
// Reads: main (DOM element)
// Writes: metricsWired (boolean)

export class StyleMetrics {
  async call(payload) {
    const metrics = {};

    // ── Paint Timing (FCP, LCP) ──
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      try {
        const paintEntries = performance.getEntriesByType('paint');
        for (const entry of paintEntries) {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = Math.round(entry.startTime);
          }
        }
      } catch { /* not supported */ }

      // Largest Contentful Paint
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) {
            metrics.lcp = Math.round(last.startTime);
            console.log(`[cup-metrics] LCP: ${metrics.lcp}ms`);
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* not supported */ }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          metrics.cls = Math.round(clsValue * 1000) / 1000;
        }).observe({ type: 'layout-shift', buffered: true });
      } catch { /* not supported */ }

      // Interaction to Next Paint (INP approximation)
      try {
        let worstInp = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const duration = entry.duration;
            if (duration > worstInp) {
              worstInp = duration;
              metrics.inp = Math.round(worstInp);
            }
          }
        }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      } catch { /* not supported */ }
    }

    // ── CSS Resource Timing ──
    try {
      const cssEntries = performance.getEntriesByType('resource')
        .filter(e => e.name.endsWith('.css'));
      metrics.cssTransferSize = cssEntries.reduce((sum, e) => sum + (e.transferSize || 0), 0);
      metrics.cssCount = cssEntries.length;
    } catch { /* not supported */ }

    // ── Theme Switch Benchmark ──
    const measureThemeSwitch = () => {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';

      performance.mark('theme-switch-start');
      root.setAttribute('data-theme', next);

      // Force style recalc
      getComputedStyle(root).getPropertyValue('--cup-color-surface');

      performance.mark('theme-switch-end');
      performance.measure('theme-switch', 'theme-switch-start', 'theme-switch-end');

      const measure = performance.getEntriesByName('theme-switch').pop();
      const duration = measure ? Math.round(measure.duration * 100) / 100 : 0;

      // Switch back
      root.setAttribute('data-theme', current);

      return duration;
    };

    // ── Build metrics display section ──
    const main = payload.get('main');
    if (main) {
      const section = document.createElement('section');
      section.className = 'pg-section';
      section.id = 'metrics';
      section.innerHTML = `
        <h2 class="pg-section-title">Style Metrics</h2>
        <p class="pg-section-tag">Core Web Vitals &amp; CSS Performance</p>
        <div class="pg-demo">
          <div class="pg-demo-grid" id="metrics-grid">
            <div class="cup-card">
              <div class="cup-card___header">Paint Timing</div>
              <div class="cup-card___body" id="metrics-paint" style="font-family:var(--cup-font-family-mono);font-size:var(--cup-font-size-sm);">
                Collecting…
              </div>
            </div>
            <div class="cup-card">
              <div class="cup-card___header">Layout Stability</div>
              <div class="cup-card___body" id="metrics-layout" style="font-family:var(--cup-font-family-mono);font-size:var(--cup-font-size-sm);">
                Collecting…
              </div>
            </div>
            <div class="cup-card">
              <div class="cup-card___header">CSS Budget</div>
              <div class="cup-card___body" id="metrics-css" style="font-family:var(--cup-font-family-mono);font-size:var(--cup-font-size-sm);">
                Collecting…
              </div>
            </div>
            <div class="cup-card">
              <div class="cup-card___header">Theme Switch</div>
              <div class="cup-card___body" id="metrics-theme" style="font-family:var(--cup-font-family-mono);font-size:var(--cup-font-size-sm);">
                <button class="cup-button cup-button--secondary cup-button--sm" id="metrics-theme-btn">Measure</button>
                <p id="metrics-theme-result" style="margin-top:var(--cup-space-sm);"></p>
              </div>
            </div>
          </div>
        </div>
      `;
      main.appendChild(section);

      // Populate after a short delay to let observers collect
      setTimeout(() => {
        const paintEl = document.getElementById('metrics-paint');
        const layoutEl = document.getElementById('metrics-layout');
        const cssEl = document.getElementById('metrics-css');
        if (paintEl) {
          const lines = [];
          if (metrics.fcp != null) lines.push(`FCP: ${metrics.fcp}ms`);
          if (metrics.lcp != null) lines.push(`LCP: ${metrics.lcp}ms`);
          if (metrics.inp != null) lines.push(`INP: ${metrics.inp}ms`);
          paintEl.textContent = lines.length ? lines.join('\n') : 'No paint data yet';
        }
        if (layoutEl) {
          layoutEl.textContent = metrics.cls != null
            ? `CLS: ${metrics.cls}${metrics.cls < 0.1 ? ' ✓ Good' : metrics.cls < 0.25 ? ' ~ Needs Improvement' : ' ✗ Poor'}`
            : 'No layout shift data';
        }
        if (cssEl) {
          const kb = metrics.cssTransferSize
            ? (metrics.cssTransferSize / 1024).toFixed(1)
            : '?';
          cssEl.textContent = `${metrics.cssCount || 0} stylesheets\n${kb} KB transferred`;
        }
      }, 2000);

      // Wire theme benchmark button
      const btn = document.getElementById('metrics-theme-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const duration = measureThemeSwitch();
          const result = document.getElementById('metrics-theme-result');
          if (result) {
            result.textContent = `Recalc: ${duration}ms${duration < 1 ? ' ✓ Fast' : duration < 5 ? ' ~ OK' : ' ✗ Slow'}`;
          }
        });
      }
    }

    // Log summary
    console.log('[cup-metrics] initial:', {
      fcp: metrics.fcp,
      cssFiles: metrics.cssCount,
      cssBytes: metrics.cssTransferSize,
    });

    return payload.insert('metricsWired', true);
  }
}
