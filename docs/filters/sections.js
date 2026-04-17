// sections.js — Component section registry (pure data).
// Each entry defines: id, title, tag, desc, demo HTML, source code snippet.

export const sections = [
  // ── Nano ──
  {
    id: 'label', title: 'Label', tag: '<cup-label>',
    desc: 'Form input label with optional required indicator. Accessible via for attribute.',
    demo: `<div class="pg-demo-row">
        <cup-label for="x">Name</cup-label>
        <cup-label for="y" required>Email (required)</cup-label>
      </div>`,
    code: `<cup-label for="name">Name</cup-label>\n<cup-label for="email" required>Email</cup-label>`,
  },
  {
    id: 'input', title: 'Input', tag: '<cup-input>',
    desc: 'Text input with placeholder, prefilled values, and disabled states.',
    demo: `<div class="pg-demo-grid">
        <cup-input placeholder="Type here..."></cup-input>
        <cup-input value="Pre-filled"></cup-input>
        <cup-input placeholder="Disabled" disabled></cup-input>
      </div>`,
    code: `<cup-input placeholder="Type here..."></cup-input>\n<cup-input value="Pre-filled"></cup-input>\n<cup-input disabled></cup-input>`,
  },
  {
    id: 'hint', title: 'Hint', tag: '<cup-hint>',
    desc: 'Helper text displayed below a form field to guide user input.',
    demo: `<cup-hint>This is helper text below a field.</cup-hint>`,
    code: `<cup-hint>Helper text here.</cup-hint>`,
  },
  {
    id: 'error', title: 'Error', tag: '<cup-error>',
    desc: 'Validation error message displayed below a form field.',
    demo: `<cup-error>This field is required.</cup-error>`,
    code: `<cup-error>This field is required.</cup-error>`,
  },
  {
    id: 'icon', title: 'Icon', tag: '<cup-icon>',
    desc: 'Accessible SVG icon wrapper with size variants and aria-label support.',
    demo: `<div class="pg-demo-row">
        <cup-icon label="Check"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg></cup-icon>
        <cup-icon size="lg" label="Warning"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/></svg></cup-icon>
      </div>`,
    code: `<cup-icon label="Check">\n  <svg viewBox="0 0 24 24">...</svg>\n</cup-icon>`,
  },
  {
    id: 'skeleton', title: 'Skeleton', tag: '<cup-skeleton>',
    desc: 'Loading placeholder with text, circle, and rectangle variants.',
    demo: `<div class="pg-demo-row">
        <cup-skeleton variant="text" width="200px"></cup-skeleton>
        <cup-skeleton variant="circle"></cup-skeleton>
        <cup-skeleton variant="rect" width="120px" height="60px"></cup-skeleton>
      </div>`,
    code: `<cup-skeleton variant="text" width="200px"></cup-skeleton>\n<cup-skeleton variant="circle"></cup-skeleton>\n<cup-skeleton variant="rect" width="120px" height="60px"></cup-skeleton>`,
  },
  {
    id: 'divider', title: 'Divider', tag: '<cup-divider>',
    desc: 'Visual separator between content sections.',
    demo: `<p>Content above</p><cup-divider></cup-divider><p>Content below</p>`,
    code: `<cup-divider></cup-divider>`,
  },

  // ── Micro — Fields ──
  {
    id: 'field', title: 'Field', tag: '<cup-field>',
    desc: 'Composed form field with label, input, hint, and error in one component.',
    demo: `<div class="pg-demo-grid">
        <cup-field label="Username" placeholder="Enter username" hint="Your unique handle"></cup-field>
        <cup-field label="Email" type="email" required placeholder="you@example.com"></cup-field>
        <cup-field label="With Error" error="Invalid value" value="oops"></cup-field>
        <cup-field label="Disabled" disabled value="Cannot edit"></cup-field>
      </div>`,
    code: `<cup-field label="Username" placeholder="Enter username" hint="Your unique handle"></cup-field>\n<cup-field label="Email" type="email" required></cup-field>`,
  },
  {
    id: 'select', title: 'Select', tag: '<cup-select>',
    desc: 'Dropdown selection with JSON-based options and disabled state.',
    demo: `<div class="pg-demo-grid">
        <cup-select label="Country" placeholder="Choose one" options='[{"value":"us","label":"United States"},{"value":"uk","label":"United Kingdom"},{"value":"de","label":"Germany"}]'></cup-select>
        <cup-select label="Disabled" disabled options='[{"value":"a","label":"Locked"}]'></cup-select>
      </div>`,
    code: `<cup-select label="Country" placeholder="Choose one"\n  options='[{"value":"us","label":"United States"}]'></cup-select>`,
  },
  {
    id: 'textarea', title: 'Textarea', tag: '<cup-textarea>',
    desc: 'Multi-line text input with character limit and hint support.',
    demo: `<div class="pg-demo-grid">
        <cup-textarea label="Bio" placeholder="Tell us about yourself" maxlength="200" hint="Keep it brief"></cup-textarea>
        <cup-textarea label="Disabled" disabled value="Read only content"></cup-textarea>
      </div>`,
    code: `<cup-textarea label="Bio" placeholder="Tell us..." maxlength="200" hint="Keep it brief"></cup-textarea>`,
  },
  {
    id: 'number', title: 'Number', tag: '<cup-number>',
    desc: 'Numeric input with min, max, and step constraints.',
    demo: `<div class="pg-demo-grid">
        <cup-number label="Quantity" min="1" max="100" step="1" value="1"></cup-number>
        <cup-number label="Price" step="0.01" value="9.99" hint="In dollars"></cup-number>
      </div>`,
    code: `<cup-number label="Quantity" min="1" max="100" step="1" value="1"></cup-number>`,
  },
  {
    id: 'slider', title: 'Slider', tag: '<cup-slider>',
    desc: 'Range slider with live value display, step precision, and disabled state.',
    demo: `<div class="pg-demo-grid">
        <cup-slider label="Volume" min="0" max="100" value="50" show-value></cup-slider>
        <cup-slider label="Opacity" min="0" max="1" step="0.1" value="0.8" show-value hint="0 to 1"></cup-slider>
        <cup-slider label="Disabled" min="0" max="100" value="30" disabled></cup-slider>
      </div>`,
    code: `<cup-slider label="Volume" min="0" max="100" value="50" show-value></cup-slider>\n<cup-slider label="Opacity" min="0" max="1" step="0.1" value="0.8" show-value></cup-slider>`,
  },
  {
    id: 'password', title: 'Password', tag: '<cup-password>',
    desc: 'Password input with show/hide toggle, minlength validation, and hint.',
    demo: `<cup-password label="Password" required hint="At least 8 characters" minlength="8"></cup-password>`,
    code: `<cup-password label="Password" required hint="At least 8 characters" minlength="8"></cup-password>`,
  },
  {
    id: 'date', title: 'Date', tag: '<cup-date>',
    desc: 'Date picker with min/max range constraints and required validation.',
    demo: `<div class="pg-demo-grid">
        <cup-date label="Start Date" required hint="When do you begin?"></cup-date>
        <cup-date label="End Date" min="2025-01-01" max="2027-12-31"></cup-date>
      </div>`,
    code: `<cup-date label="Start Date" required hint="When do you begin?"></cup-date>`,
  },
  {
    id: 'file', title: 'File', tag: '<cup-file>',
    desc: 'File upload with accept filters, multiple selection, and preview.',
    demo: `<div class="pg-demo-grid">
        <cup-file label="Upload Resume" accept=".pdf,.doc,.docx" hint="PDF or Word"></cup-file>
        <cup-file label="Photos" accept="image/*" multiple></cup-file>
      </div>`,
    code: `<cup-file label="Upload Resume" accept=".pdf,.doc,.docx" hint="PDF or Word"></cup-file>`,
  },
  {
    id: 'checkbox', title: 'Checkbox', tag: '<cup-checkbox>',
    desc: 'Checkbox input with label, pre-checked, and disabled states.',
    demo: `<div class="pg-demo-row">
        <cup-checkbox label="I agree to the terms"></cup-checkbox>
        <cup-checkbox label="Already checked" checked></cup-checkbox>
        <cup-checkbox label="Disabled" disabled></cup-checkbox>
      </div>`,
    code: `<cup-checkbox label="I agree to the terms"></cup-checkbox>\n<cup-checkbox label="Pre-checked" checked></cup-checkbox>`,
  },
  {
    id: 'radio', title: 'Radio Group', tag: '<cup-radio-group>',
    desc: 'Radio button group with JSON-based options and default selection.',
    demo: `<cup-radio-group label="Plan" options='[{"value":"free","label":"Free"},{"value":"pro","label":"Pro ($9/mo)"},{"value":"team","label":"Team ($29/mo)"}]' value="pro"></cup-radio-group>`,
    code: `<cup-radio-group label="Plan"\n  options='[{"value":"free","label":"Free"},{"value":"pro","label":"Pro"}]'\n  value="pro"></cup-radio-group>`,
  },

  // ── Micro — Actions ──
  {
    id: 'button', title: 'Button', tag: '<cup-button>',
    desc: 'Button with primary, secondary, ghost, and danger variants. Supports sizes, rounded, loading, and disabled states.',
    demo: `<p class="pg-variant-label">Variants</p>
      <div class="pg-demo-row">
        <cup-button variant="primary">Primary</cup-button>
        <cup-button variant="secondary">Secondary</cup-button>
        <cup-button variant="ghost">Ghost</cup-button>
        <cup-button variant="danger">Danger</cup-button>
      </div>
      <p class="pg-variant-label">Sizes</p>
      <div class="pg-demo-row">
        <cup-button variant="primary" size="sm">Small</cup-button>
        <cup-button variant="primary">Default</cup-button>
        <cup-button variant="primary" size="lg">Large</cup-button>
      </div>
      <p class="pg-variant-label">Rounded</p>
      <div class="pg-demo-row">
        <cup-button variant="primary" rounded>Rounded</cup-button>
        <cup-button variant="secondary" rounded>Rounded</cup-button>
        <cup-button variant="danger" rounded size="sm">Small Pill</cup-button>
        <cup-button variant="primary" round>\u2713</cup-button>
        <cup-button variant="danger" round>\u2715</cup-button>
      </div>
      <p class="pg-variant-label">States</p>
      <div class="pg-demo-row">
        <cup-button variant="primary" loading>Loading</cup-button>
        <cup-button variant="primary" disabled>Disabled</cup-button>
      </div>`,
    code: `<cup-button variant="primary">Primary</cup-button>\n<cup-button variant="secondary">Secondary</cup-button>\n<cup-button variant="ghost">Ghost</cup-button>\n<cup-button variant="danger">Danger</cup-button>\n\n<!-- sizes -->\n<cup-button variant="primary" size="sm">Small</cup-button>\n<cup-button variant="primary" size="lg">Large</cup-button>\n\n<!-- rounded -->\n<cup-button variant="primary" rounded>Rounded</cup-button>\n<cup-button variant="primary" round>\u2713</cup-button>\n\n<!-- states -->\n<cup-button variant="primary" loading>Loading</cup-button>\n<cup-button variant="primary" disabled>Disabled</cup-button>`,
  },
  {
    id: 'toggle', title: 'Toggle', tag: '<cup-toggle>',
    desc: 'On/off switch with label, pressed state, and disabled support.',
    demo: `<div class="pg-demo-row">
        <cup-toggle label="Notifications"></cup-toggle>
        <cup-toggle label="Dark Mode" pressed></cup-toggle>
        <cup-toggle label="Locked" disabled></cup-toggle>
      </div>`,
    code: `<cup-toggle label="Notifications"></cup-toggle>\n<cup-toggle label="Dark Mode" pressed></cup-toggle>`,
  },
  {
    id: 'badge', title: 'Badge', tag: '<cup-badge>',
    desc: 'Status indicator with success, error, warning, and info variants.',
    demo: `<div class="pg-demo-row">
        <cup-badge variant="default">Default</cup-badge>
        <cup-badge variant="success">Active</cup-badge>
        <cup-badge variant="error">Failed</cup-badge>
        <cup-badge variant="warning">Pending</cup-badge>
        <cup-badge variant="info">New</cup-badge>
      </div>`,
    code: `<cup-badge variant="success">Active</cup-badge>\n<cup-badge variant="error">Failed</cup-badge>`,
  },
  {
    id: 'chip', title: 'Chip', tag: '<cup-chip>',
    desc: 'Tag chip with optional remove button for filter and selection UIs.',
    demo: `<div class="pg-demo-row" id="chip-demo">
        <cup-chip label="JavaScript"></cup-chip>
        <cup-chip label="Python" removable></cup-chip>
        <cup-chip label="TypeScript" removable></cup-chip>
        <cup-chip label="Rust" removable></cup-chip>
      </div>`,
    code: `<cup-chip label="JavaScript"></cup-chip>\n<cup-chip label="Python" removable></cup-chip>`,
  },

  // ── Effects ──
  {
    id: 'stepper', title: 'Stepper', tag: '<cup-stepper>',
    desc: 'Multi-step progress indicator with linear mode and programmatic navigation.',
    demo: `<div class="pg-demo-grid" style="gap:var(--cup-space-xl);">
        <div>
          <p class="pg-variant-label">Default</p>
          <cup-stepper steps='["Personal Info","Resume","Cover Letter","Review"]' active="1"></cup-stepper>
        </div>
        <div>
          <p class="pg-variant-label">Linear (can only advance forward)</p>
          <cup-stepper steps='["Account","Profile","Confirm"]' active="0" linear></cup-stepper>
        </div>
        <div>
          <p class="pg-variant-label">Completed</p>
          <cup-stepper steps='["Upload","Process","Done"]' active="2"></cup-stepper>
        </div>
      </div>
      <div class="pg-demo-row" style="margin-top:var(--cup-space-md);">
        <button class="cup-button cup-button--secondary cup-button--sm" id="stepper-prev-btn">← Prev</button>
        <button class="cup-button cup-button--primary cup-button--sm" id="stepper-next-btn">Next →</button>
      </div>
      <script type="module">
        const stepper = document.querySelector('cup-stepper:not([linear])');
        document.getElementById('stepper-prev-btn')?.addEventListener('click', () => stepper?.prev());
        document.getElementById('stepper-next-btn')?.addEventListener('click', () => stepper?.next());
      </script>`,
    code: `<cup-stepper\n  steps='["Personal Info","Resume","Cover Letter","Review"]'\n  active="1">\n</cup-stepper>\n\n<!-- Linear mode -->\n<cup-stepper steps='["Step 1","Step 2","Step 3"]' active="0" linear></cup-stepper>\n\n<!-- Programmatic control -->\nconst stepper = document.querySelector('cup-stepper');\nstepper.next();  // advance\nstepper.prev();  // go back`,
  },
  {
    id: 'progress', title: 'Progress', tag: '<cup-progress>',
    desc: 'Progress bar with determinate, indeterminate, and variant-colored modes.',
    demo: `<div class="pg-demo-grid" style="gap:var(--cup-space-lg);">
        <cup-progress label="Upload" value="65" max="100"></cup-progress>
        <cup-progress label="Processing" value="30" max="100" variant="info"></cup-progress>
        <cup-progress label="Complete" value="100" max="100" variant="success"></cup-progress>
        <cup-progress label="Error" value="45" max="100" variant="error"></cup-progress>
        <cup-progress label="Warning" value="80" max="100" variant="warning"></cup-progress>
        <div>
          <p class="pg-variant-label">Sizes</p>
          <div style="display:flex;flex-direction:column;gap:var(--cup-space-sm);">
            <cup-progress value="50" max="100" size="sm"></cup-progress>
            <cup-progress value="50" max="100"></cup-progress>
            <cup-progress value="50" max="100" size="lg"></cup-progress>
          </div>
        </div>
        <cup-progress label="Loading..." indeterminate></cup-progress>
      </div>
      <div class="pg-demo-row" style="margin-top:var(--cup-space-md);">
        <button class="cup-button cup-button--secondary cup-button--sm" id="progress-demo-btn">Animate to 100%</button>
      </div>
      <script type="module">
        document.getElementById('progress-demo-btn')?.addEventListener('click', () => {
          const bar = document.querySelector('cup-progress[label="Upload"]');
          if (!bar) return;
          let v = 0;
          bar.setAttribute('value', '0');
          const iv = setInterval(() => {
            v += 5;
            bar.setAttribute('value', String(Math.min(v, 100)));
            if (v >= 100) clearInterval(iv);
          }, 80);
        });
      </script>`,
    code: `<cup-progress label="Upload" value="65" max="100"></cup-progress>\n<cup-progress variant="success" value="100" max="100"></cup-progress>\n<cup-progress indeterminate label="Loading..."></cup-progress>\n\n<!-- Sizes -->\n<cup-progress value="50" size="sm"></cup-progress>\n<cup-progress value="50" size="lg"></cup-progress>\n\n<!-- Programmatic -->\nconst bar = document.querySelector('cup-progress');\nbar.setAttribute('value', '75');`,
  },
  {
    id: 'toast', title: 'Toast', tag: '<cup-toast>',
    desc: 'Notification toast with auto-dismissal, variants, and programmatic API.',
    demo: `<div class="pg-demo-row" style="flex-direction:column;gap:var(--cup-space-sm);">
        <cup-toast variant="info" duration="0">This is an informational message</cup-toast>
        <cup-toast variant="success" duration="0">Operation completed successfully</cup-toast>
        <cup-toast variant="warning" duration="0">This action cannot be undone</cup-toast>
        <cup-toast variant="error" duration="0">Something went wrong</cup-toast>
      </div>
      <div class="pg-demo-row" style="margin-top:var(--cup-space-md);">
        <button class="cup-button cup-button--primary cup-button--sm" id="toast-demo-btn">Show Toast</button>
      </div>
      <script type="module">
        document.getElementById('toast-demo-btn')?.addEventListener('click', () => {
          const variants = ['info','success','warning','error'];
          const messages = ['New notification received','File saved','Are you sure?','Connection lost'];
          const i = Math.floor(Math.random() * 4);
          import('../components/cup-toast.js').then(m => m.CupToast.show(messages[i], { variant: variants[i] }));
        });
      </script>`,
    code: `<!-- Declarative -->\n<cup-toast variant="success" duration="5000">Saved!</cup-toast>\n\n<!-- Programmatic -->\nimport { CupToast } from 'cup-ui/components/cup-toast.js';\nCupToast.show('Hello!', { variant: 'info', duration: 3000 });`,
  },

  // ── Effects ──
  {
    id: 'effects', title: 'Effects', tag: 'data-effect',
    desc: 'CSS animation effects via data attributes: fade-in, slide-up, scale-in, and trace.',
    demo: `<div class="pg-demo-grid" id="effects-demo">
        <div class="cup-card" data-effect="fade-in">
          <div class="cup-card___header">Fade In</div>
          <div class="cup-card___body">data-effect="fade-in"</div>
        </div>
        <div class="cup-card" data-effect="slide-up">
          <div class="cup-card___header">Slide Up</div>
          <div class="cup-card___body">data-effect="slide-up"</div>
        </div>
        <div class="cup-card" data-effect="scale-in">
          <div class="cup-card___header">Scale In</div>
          <div class="cup-card___body">data-effect="scale-in"</div>
        </div>
        <div class="cup-card" data-effect="trace">
          <div class="cup-card___header">Trace</div>
          <div class="cup-card___body">data-effect="trace"</div>
        </div>
        <div class="cup-card" data-effect="trace" style="--cup-trace-color:var(--cup-color-success)">
          <div class="cup-card___header">Trace (green)</div>
          <div class="cup-card___body">--cup-trace-color: success</div>
        </div>
        <div class="cup-card" data-effect="trace" style="--cup-trace-color:var(--cup-color-error)" data-trace-bold>
          <div class="cup-card___header">Trace (red, bold)</div>
          <div class="cup-card___body">--cup-trace-color + bold</div>
        </div>
        <div class="cup-card" data-effect="enchant">
          <div class="cup-card___header">Enchant</div>
          <div class="cup-card___body">data-effect="enchant"</div>
        </div>
        <div class="cup-card" data-effect="enchant" style="--cup-enchant-color:#4fc3f7">
          <div class="cup-card___header">Enchant (blue)</div>
          <div class="cup-card___body">--cup-enchant-color: blue</div>
        </div>
        <div class="cup-card" data-effect="enchant" style="--cup-enchant-color:#ffa726;--cup-enchant-speed:1.5s">
          <div class="cup-card___header">Enchant (gold, fast)</div>
          <div class="cup-card___body">gold + 1.5s speed</div>
        </div>
      </div>
      <div style="display:flex;gap:var(--cup-space-sm);flex-wrap:wrap;margin-top:var(--cup-space-md);">
        <button class="cup-button cup-button--secondary cup-button--sm" id="effect-replay-btn">Replay All</button>
        <button class="cup-button cup-button--secondary cup-button--sm" id="effect-pulse-btn">Pulse</button>
        <button class="cup-button cup-button--secondary cup-button--sm" id="effect-shake-btn">Shake</button>
      </div>`,
    code: `<div data-effect="fade-in">Fade In</div>\n<div data-effect="slide-up">Slide Up</div>\n<div data-effect="scale-in">Scale In</div>\n\n<!-- Border trace (attention-grabber) -->\n<div data-effect="trace">Default trace</div>\n<div data-effect="trace" style="--cup-trace-color:#66bb6a">Green trace</div>\n<div data-effect="trace" data-trace-bold>Bold trace</div>\n\n<!-- Enchant glow (Minecraft-style shimmer) -->\n<div data-effect="enchant">Purple enchant</div>\n<div data-effect="enchant" style="--cup-enchant-color:#4fc3f7">Blue enchant</div>\n<div data-effect="enchant" style="--cup-enchant-speed:1.5s">Fast enchant</div>\n\n<!-- Speed/delay modifiers -->\n<div data-effect="fade-in" data-effect-speed="slow">Slow fade</div>\n<div data-effect="slide-up" data-effect-delay="200">Delayed slide</div>`,
  },
];
