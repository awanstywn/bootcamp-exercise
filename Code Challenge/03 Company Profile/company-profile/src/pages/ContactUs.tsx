/**
 * @file ContactUs.tsx
 * @description Contact page hosting corporate geolocations, email addresses,
 * and an interactive form supporting async mock submit delays and success indicators.
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

/**
 * ContactUs Page Component.
 */
const ContactUs = () => {
  // State hook managing form posting indicators ('idle' | 'submitting' | 'success')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  /**
   * Submit form handler. Prevents standard page refreshes, sets loading indicators,
   * and triggers success state after a mock timeout delay of 1.5 seconds.
   * @param e FormEvent reference
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — PayStream</title>
        <meta name="description" content="Get in touch with the PayStream team for support, sales, or partnership inquiries." />
      </Helmet>

      {/* Hero Page Title */}
      <section className="bg-dark-900 text-white py-20 lg:py-28 text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Contact our team</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Whether you have questions about our API, pricing, or need technical support, our team is ready to help.
          </p>
        </div>
      </section>

      {/* Main Form & details layouts */}
      <section className="py-20 bg-dark-50">
        <div className="container-custom grid lg:grid-cols-2 gap-16">
          
          {/* Contact Details Column */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-dark-900 mb-6">How can we help?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Please fill out the form, and we'll route your request to the appropriate team.
                For urgent technical issues, please check our status page or use the developer dashboard.
              </p>
            </div>

            <div className="space-y-8">
              {/* Sales contacts */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 text-lg">Sales & Partnerships</h3>
                  <p className="text-gray-500 text-sm mt-1">Talk to our team about custom pricing and volume discounts.</p>
                  <a href="mailto:sales@paystream.com" className="text-primary-500 text-sm font-semibold mt-2 inline-block">sales@paystream.com</a>
                </div>
              </div>

              {/* Developer/Tech supports */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 text-lg">Technical Support</h3>
                  <p className="text-gray-500 text-sm mt-1">Get help with API integrations and account issues.</p>
                  <a href="mailto:support@paystream.com" className="text-primary-500 text-sm font-semibold mt-2 inline-block">support@paystream.com</a>
                </div>
              </div>

              {/* Office corporate coordinates */}
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 text-lg">Headquarters</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                    123 Innovation Drive<br />
                    Suite 400<br />
                    San Francisco, CA 94103
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form container card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {status === 'success' ? (
              // Success block rendered after validation and submit timer completes
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-dark-900 mb-2">Message sent!</h3>
                <p className="text-gray-500">Thanks for reaching out. A member of our team will get back to you within 24 hours.</p>
                <button onClick={() => setStatus('idle')} className="btn-outline mt-8">Send another message</button>
              </div>
            ) : (
              // Standard Form Input Fields layout
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input type="text" id="firstName" required className="form-input" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input type="text" id="lastName" required className="form-input" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
                  <input type="email" id="email" required className="form-input" />
                </div>

                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select id="topic" className="form-input bg-white" required>
                    <option value="">Select a topic...</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnerships</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea id="message" rows={4} required className="form-input resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full flex justify-center disabled:opacity-70">
                  {status === 'submitting' ? 'Sending...' : 'Send message'}
                </button>
                <p className="text-xs text-center text-gray-400 mt-4">
                  By submitting this form, you agree to our <a href="#/privacy" className="underline hover:text-primary-500">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>

        </div>
      </section>
    </>
  );
};

export default ContactUs;

