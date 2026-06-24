/**
 * @file TermsOfService.tsx
 * @description Terms of Service agreement view. Outlines general API licensing rules,
 * payment service obligations, account liabilities, and legal limitations of liability.
 */

import { Helmet } from 'react-helmet-async';

/**
 * TermsOfService Page Component.
 */
const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service — PayStream</title>
        <meta name="description" content="Read PayStream's Terms of Service governing the use of our payment infrastructure APIs." />
      </Helmet>

      <div className="py-20 lg:py-32">
        <div className="container-custom max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-900 mb-6">Terms of Service</h1>
            <p className="text-gray-500 text-lg">Last updated: June 24, 2026</p>
          </div>

          {/* Terms specifications using Tailwind prose typography layout */}
          <div className="prose prose-lg max-w-none prose-a:text-primary-500 prose-headings:text-dark-900 text-gray-600">
            <p>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the PayStream API and website (the "Service") operated by PayStream, Inc. ("us", "we", or "our").
            </p>

            <h2>1. Agreement to Terms</h2>
            <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

            <h2>2. Accounts</h2>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            <p>You are responsible for safeguarding the password and API keys that you use to access the Service and for any activities or actions under your account.</p>

            <h2>3. API Usage</h2>
            <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the PayStream API in accordance with our documentation. You agree not to:</p>
            <ul>
              <li>Use the API in any manner that exceeds reasonable request volumes or constitutes excessive or abusive usage.</li>
              <li>Reverse engineer or extract source code from our API or SDKs.</li>
              <li>Use the Service for any illegal or unauthorized purpose, including processing transactions for prohibited business categories.</li>
            </ul>

            <h2>4. Fees and Payment</h2>
            <p>You agree to pay all fees assessed by us to you for providing the Payment Services. We reserve the right to revise our Fees at any time, subject to a thirty (30) day notice period to you.</p>

            <h2>5. Termination</h2>
            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

            <h2>6. Limitation of Liability</h2>
            <p>In no event shall PayStream, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;

