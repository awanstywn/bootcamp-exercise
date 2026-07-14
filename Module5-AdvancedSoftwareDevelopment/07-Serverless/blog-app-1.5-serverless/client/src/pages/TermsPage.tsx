/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import SEOHead from '../components/SEOHead';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <SEOHead title="Terms of Service" />
      <h1 className="text-4xl font-bold font-serif text-slate-900 mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 text-lg mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using BlogApp, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">3. Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </p>
        </section>
        
        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">4. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of BlogApp and its licensors.
          </p>
        </section>
      </div>
    </div>
  );
}
