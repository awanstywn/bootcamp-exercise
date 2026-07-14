/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import SEOHead from '../components/SEOHead';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <SEOHead title="Privacy Policy" />
      <h1 className="text-4xl font-bold font-serif text-slate-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 text-lg mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">1. Information We Collect</h2>
          <p>
            When you use BlogApp, we collect certain information to provide and improve our services. This includes your name, email address when you register, and any content you choose to publish on the platform. We also collect basic analytics such as page views to determine popular posts.
          </p>
        </section>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your registration and manage your account</li>
            <li>Respond to your comments and questions</li>
            <li>Send you technical notices and support messages</li>
          </ul>
        </section>

        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">3. Data Security</h2>
          <p>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your passwords are cryptographically hashed and we use secure cookies for authentication.
          </p>
        </section>
        
        <section className="mb-10 space-y-4 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@blogapp.com.
          </p>
        </section>
      </div>
    </div>
  );
}
