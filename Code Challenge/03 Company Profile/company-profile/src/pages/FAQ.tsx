/**
 * @file FAQ.tsx
 * @description FAQ page rendering customer support queries, security specs,
 * pricing transparency notes, and navigation redirection buttons to support staff.
 */

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// Frequently Asked Questions array list
const faqs = [
  {
    question: 'How quickly can I integrate PayStream?',
    answer: 'Most developers can get a basic integration running in under an afternoon using our pre-built Checkout components. Custom API integrations typically take a few days depending on the complexity of your business logic.',
  },
  {
    question: 'What countries and currencies are supported?',
    answer: 'PayStream supports processing payments in 135+ currencies and enables payouts to bank accounts in over 45 countries. We are constantly expanding our global reach.',
  },
  {
    question: 'How do you handle security and compliance?',
    answer: 'Security is our top priority. PayStream is a certified PCI Service Provider Level 1. All card numbers are encrypted at rest with AES-256. We handle the heavy lifting of compliance so you don\'t have to.',
  },
  {
    question: 'Are there any setup fees or hidden charges?',
    answer: 'No. PayStream uses a simple, transparent pay-as-you-go pricing model. There are no setup fees, monthly fees, or hidden costs. You only pay for what you use.',
  },
  {
    question: 'Can I test PayStream before going live?',
    answer: 'Yes! When you create an account, you instantly get access to a full-featured sandbox environment. You can simulate test payments, webhooks, and edge cases before ever touching real money.',
  },
];

/**
 * FAQ Page Component.
 */
const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>FAQ — PayStream</title>
        <meta name="description" content="Frequently asked questions about PayStream's payment infrastructure." />
      </Helmet>

      {/* Hero Header */}
      <section className="bg-dark-900 text-white py-20 lg:py-28 text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about the product and billing.
          </p>
        </div>
      </section>

      {/* Accordion List Container */}
      <section className="py-20 bg-dark-50 min-h-[50vh]">
        <div className="container-custom max-w-3xl">
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-dark-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Contact Support Trigger box */}
          <div className="mt-16 text-center bg-primary-50 rounded-2xl p-8 border border-primary-100">
            <h3 className="text-xl font-bold text-dark-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <Link to="/contact" className="btn-primary">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;

