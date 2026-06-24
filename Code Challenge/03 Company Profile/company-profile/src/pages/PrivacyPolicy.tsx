/**
 * @file PrivacyPolicy.tsx
 * @description Privacy Policy compliance documentation view. Renders standard
 * corporate terms, information handling procedures, encryption disclosures,
 * and contact email actions.
 */

import { Helmet } from 'react-helmet-async';

/**
 * PrivacyPolicy Page Component.
 */
const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — PayStream</title>
        <meta name="description" content="PayStream's Privacy Policy describes how we collect, use, and protect your personal information." />
      </Helmet>
      
      <div className="py-20 lg:py-32">
        <div className="container-custom max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-dark-900 mb-6">Privacy Policy</h1>
            <p className="text-gray-500 text-lg">Last updated: June 24, 2026</p>
          </div>

          {/* Policy specifications using Tailwind prose typography layout */}
          <div className="prose prose-lg max-w-none prose-a:text-primary-500 prose-headings:text-dark-900 text-gray-600">
            <p>
              At PayStream, we take your privacy seriously. This Privacy Policy describes how PayStream, Inc. and its affiliates ("PayStream," "we," "our," or "us") collect, use, and share information in connection with your use of our websites (including www.paystream.com), services, and applications (collectively, the "Services").
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us. For example, we collect information when you create an account, participate in any interactive features of the Services, fill out a form, request customer support, or otherwise communicate with us.</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password, postal address, phone number, and other profile information.</li>
              <li><strong>Financial Information:</strong> Bank account details, payment card information, and transaction history needed to process payments.</li>
              <li><strong>Identity Verification:</strong> Government-issued ID, tax ID, or other documentation required for KYC/AML compliance.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our Services, including to:</p>
            <ul>
              <li>Process transactions and send related information, including confirmations and receipts.</li>
              <li>Verify your identity and prevent fraud or other unauthorized or illegal activity.</li>
              <li>Send technical notices, updates, security alerts, and support and administrative messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We may share personal information as follows or as otherwise described in this Privacy Policy:</p>
            <ul>
              <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
              <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.</li>
              <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of PayStream or others.</li>
            </ul>

            <h2>4. Security</h2>
            <p>PayStream takes reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All payment data is encrypted using AES-256 and transmitted via TLS.</p>

            <h2>5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@paystream.com">privacy@paystream.com</a>.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

