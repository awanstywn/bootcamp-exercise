/**
 * @file fallback.ts
 * @description Local fallback mock database. Contains initial records for services,
 * testimonials, and blog posts. Ensures the application can run in a "backendless fallback"
 * mode when Backendless configurations are absent or if network requests fail.
 */

import type { Blog, Service, Testimonial } from '@/types';

// ─── Fallback Services (Products catalog fallback database) ───────────────
export const FALLBACK_SERVICES: Service[] = [
  {
    objectId: 'svc-1',
    title: 'Payments',
    description:
      'Accept payments online, in person, or around the world with a payments solution built for any business — from scaling startups to global enterprises.',
    price: '2.9% + 30¢ per transaction',
    icon: 'credit-card',
    featured: true,
    testimonialQuote:
      'PayStream Payments allowed us to go live in 14 countries in under a week. The documentation is phenomenal.',
    testimonialAuthor: 'Alex Rivera, CTO at ShopWave',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    objectId: 'svc-2',
    title: 'Billing',
    description:
      'Build and scale your recurring business model. Billing supports everything from simple subscriptions to usage-based pricing and sales-negotiated contracts.',
    price: '0.5% of recurring revenue',
    icon: 'repeat',
    featured: true,
    testimonialQuote:
      'Switching to PayStream Billing cut our involuntary churn by 30% in the first quarter.',
    testimonialAuthor: 'Mei Tanaka, VP Finance at CloudSync',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    objectId: 'svc-3',
    title: 'Connect',
    description:
      'Set up multi-party payments and payouts for your platform or marketplace. Pay out sellers, contractors, or service providers worldwide.',
    price: 'Custom pricing',
    icon: 'git-merge',
    featured: false,
    testimonialQuote:
      'Connect handles payouts to over 50,000 freelancers on our platform without us lifting a finger.',
    testimonialAuthor: 'Jordan Blake, CEO at TaskForge',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    objectId: 'svc-4',
    title: 'Radar',
    description:
      'Fight fraud with machine learning. Radar uses ML trained on data from millions of global businesses to detect and block fraud in real time.',
    price: '$0.05 per screened transaction',
    icon: 'shield',
    featured: true,
    testimonialQuote:
      'Radar reduced our fraud rate to nearly zero and saved us $2M in chargebacks last year.',
    testimonialAuthor: 'Priya Sharma, Head of Risk at FinBridge',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    objectId: 'svc-5',
    title: 'Atlas',
    description:
      'Start a company from anywhere in the world. Atlas helps founders incorporate a US company, set up a bank account, and start accepting payments fast.',
    price: '$500 one-time fee',
    icon: 'globe',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    objectId: 'svc-6',
    title: 'Terminal',
    description:
      'Build delightful in-person payment experiences. Terminal provides SDKs, pre-certified card readers, and cloud-based device management for platforms.',
    price: 'Contact sales',
    icon: 'smartphone',
    featured: false,
    testimonialQuote:
      'We rolled out in-store payments across 200 locations using Terminal in just three weeks.',
    testimonialAuthor: 'Lena Kowalski, COO at BrewChain',
    thumbnail: 'https://images.unsplash.com/photo-1556740749-887f6717d5e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
];

// ─── Fallback Testimonials ────────────────────────────────────────────────
export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    objectId: 'tst-1',
    quote:
      'PayStream has completely transformed the way we handle payments. Our checkout conversion rate increased by 40% within the first month.',
    authorName: 'Sarah Chen',
    authorRole: 'VP of Engineering',
    authorCompany: 'RocketCommerce',
    authorPhoto: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    objectId: 'tst-2',
    quote:
      'The API design is best-in-class. Our developers were able to integrate PayStream in under a day, and the documentation made it almost effortless.',
    authorName: 'Marcus Thompson',
    authorRole: 'CTO',
    authorCompany: 'DataPulse',
    authorPhoto: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    objectId: 'tst-3',
    quote:
      'We moved from three separate payment providers to PayStream and cut our infrastructure costs by 60%. The unified dashboard alone was worth the switch.',
    authorName: 'Aisha Patel',
    authorRole: 'Head of Payments',
    authorCompany: 'NomadMarket',
    authorPhoto: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    objectId: 'tst-4',
    quote:
      'PayStream Radar blocked thousands of fraudulent transactions in our first week, without adding any friction for real customers. It paid for itself instantly.',
    authorName: 'Daniel Ortiz',
    authorRole: 'CEO',
    authorCompany: 'SecurePay Global',
    authorPhoto: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    objectId: 'tst-5',
    quote:
      'We needed a payment partner that could scale with us from seed stage to IPO. PayStream has been that partner every step of the way.',
    authorName: 'Emily Zhao',
    authorRole: 'Founder',
    authorCompany: 'LunaFinance',
    authorPhoto: 'https://randomuser.me/api/portraits/women/32.jpg'
  },
  {
    objectId: 'tst-6',
    quote:
      'The global coverage is unmatched. We now accept 135+ currencies across 195 countries — something that would have taken years to build ourselves.',
    authorName: 'Raj Krishnan',
    authorRole: 'Director of Payments',
    authorCompany: 'TravelStack',
    authorPhoto: 'https://randomuser.me/api/portraits/men/75.jpg'
  },
];

// ─── Fallback Blog Posts ──────────────────────────────────────────────────
export const FALLBACK_BLOGS: Blog[] = [
  {
    objectId: 'blog-1',
    title: 'Introducing PayStream Billing 2.0',
    content: `## A new era for subscription billing\n\nToday we're launching PayStream Billing 2.0 — our most ambitious upgrade to the recurring revenue platform that powers thousands of SaaS companies worldwide.\n\n### What's new\n\n- **Usage-based pricing**: Meter any dimension and bill customers based on actual consumption.\n- **Revenue recognition**: Automatically generate ASC 606-compliant reports.\n- **Multi-currency subscriptions**: Let your customers pay in their local currency while you settle in yours.\n- **Smart retries**: ML-powered dunning that recovers up to 30% more failed payments.\n\n### Why it matters\n\nSubscription businesses lose an average of 9% of revenue to involuntary churn from failed payments. Billing 2.0 attacks this problem head-on with intelligent retry logic trained on billions of transactions.\n\nGet started today by upgrading your Billing integration — it's fully backward-compatible.`,
    excerpt:
      'Billing 2.0 brings usage-based pricing, smart retries, and multi-currency subscriptions to every business.',
    authorName: 'Emily Zhao',
    tags: 'product, billing, subscriptions',
    published: true,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    objectId: 'blog-2',
    title: 'How We Scaled to 99.999% Uptime',
    content: `## Building reliability at PayStream scale\n\nWhen businesses trust you with their revenue, downtime is not an option. Here's how we achieved five-nines uptime.\n\n### Our architecture\n\n1. **Multi-region active-active**: Every API request is served by at least three geographically distributed data centers.\n2. **Zero-downtime deploys**: We ship code 200+ times per day with no user-visible interruptions.\n3. **Chaos engineering**: We regularly inject failures into production to test our resilience.\n\n### Lessons learned\n\n- Automate everything. Manual runbooks are single points of failure.\n- Invest in observability early. You can't fix what you can't see.\n- Design for partial failure. Graceful degradation beats total outage every time.\n\nWe'll be open-sourcing our internal load balancer next month — stay tuned.`,
    excerpt:
      'A deep dive into the infrastructure practices that keep PayStream running with five-nines availability.',
    authorName: 'Marcus Thompson',
    tags: 'engineering, infrastructure, reliability',
    published: true,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    objectId: 'blog-3',
    title: 'Fighting Payment Fraud with Machine Learning',
    content: `## How Radar protects millions of businesses\n\nOnline fraud costs businesses over $40B annually. PayStream Radar uses machine learning trained on data from millions of companies to stop fraud before it happens.\n\n### How it works\n\n- **Behavioral signals**: We analyze hundreds of signals per transaction — device fingerprint, IP geolocation, purchase velocity, and more.\n- **Adaptive models**: Our ML models retrain continuously on the latest fraud patterns.\n- **Custom rules**: Businesses can layer their own rules on top of our ML for fine-grained control.\n\n### Results\n\nRadar blocks an average of 95% of fraudulent transactions while maintaining a false positive rate under 0.1%. That means your real customers never experience unnecessary friction.`,
    excerpt:
      'How PayStream Radar uses ML to block 95% of fraud while keeping false positives under 0.1%.',
    authorName: 'Priya Sharma',
    tags: 'security, machine-learning, fraud',
    published: true,
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
  {
    objectId: 'blog-4',
    title: 'Global Expansion Made Simple with Atlas',
    content: `## Launch your company anywhere\n\nExpanding internationally used to take months of legal paperwork. With PayStream Atlas, you can incorporate a US company and start accepting payments in days.\n\n### What Atlas provides\n\n- Delaware C-Corp incorporation\n- Employer Identification Number (EIN)\n- US bank account via partner banks\n- Stock issuance for founders\n- Registered agent service\n\n### Who it's for\n\nAtlas is ideal for international founders who want access to the US market, US investors, and the world's most mature payments ecosystem.`,
    excerpt:
      'PayStream Atlas helps founders incorporate a US company and start accepting payments in days, not months.',
    authorName: 'Jordan Blake',
    tags: 'product, atlas, global',
    published: true,
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    objectId: 'blog-5',
    title: 'Building Accessible Payment Forms',
    content: `## Payments should work for everyone\n\nAccessibility isn't optional — it's a legal and moral imperative. Here's how we build payment forms that work for all users.\n\n### Key principles\n\n1. **Keyboard navigation**: Every form element must be reachable and operable without a mouse.\n2. **Screen reader support**: Use proper ARIA labels and live regions for validation feedback.\n3. **Color contrast**: Meet WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for large text).\n4. **Error handling**: Announce errors to assistive technology using role="alert".\n\n### Our toolkit\n\nWe've released an open-source library of accessible payment UI components. Check it out on GitHub.`,
    excerpt:
      'How we build payment forms that are WCAG-compliant and usable by everyone.',
    authorName: 'Aisha Patel',
    tags: 'engineering, accessibility, design',
    published: true,
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 18,
  },
  {
    objectId: 'blog-6',
    title: 'The State of Online Payments in 2026',
    content: `## Trends shaping the future of commerce\n\nThe payments landscape is evolving faster than ever. Here are the five biggest trends we're seeing heading into 2026.\n\n### 1. Embedded finance\nPayments are disappearing into the products themselves. Consumers want to pay without leaving the app.\n\n### 2. Real-time everything\nInstant payouts and real-time settlement are becoming table stakes.\n\n### 3. AI-driven personalization\nDynamic pricing, smart checkout flows, and personalized payment methods are all powered by AI.\n\n### 4. Cross-border simplification\nRegulatory harmonization and better FX infrastructure are making global commerce frictionless.\n\n### 5. Crypto rails\nStablecoins are emerging as a viable settlement layer for B2B payments.`,
    excerpt:
      'Five trends defining the future of payments — from embedded finance to crypto settlement rails.',
    authorName: 'Daniel Ortiz',
    tags: 'industry, trends, payments',
    published: true,
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
];
