/**
 * @file Security.tsx
 * @description Corporate Security disclosure page. Details PCI DSS compliance status,
 * SOC audits, data encryption metrics, and security vulnerability reports.
 */

import { Helmet } from 'react-helmet-async';
import { Shield, Lock, FileCheck } from 'lucide-react';

/**
 * Security view page component.
 */
const Security = () => {
  return (
    <>
      <Helmet>
        <title>Security — PayStream</title>
        <meta name="description" content="Learn about PayStream's enterprise-grade security, compliance certifications, and data protection measures." />
      </Helmet>

      {/* Hero Header */}
      <section className="bg-dark-900 text-white py-20 lg:py-32 text-center">
        <div className="container-custom">
          <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Enterprise-grade security</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Security is at the core of everything we do. We invest heavily in securing our infrastructure in close partnership with world-class security experts.
          </p>
        </div>
      </section>

      {/* Security Specifications Catalog */}
      <section className="py-20 bg-dark-50">
        <div className="container-custom max-w-4xl space-y-16">
          
          {/* PCI compliance segment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-2">PCI DSS Level 1 Certification</h2>
                <p className="text-gray-600 leading-relaxed">
                  PayStream is a certified PCI Service Provider Level 1. This is the most stringent level of certification available in the payments industry. To accomplish this, we use the best-in-class security tools and practices to maintain a high level of security at PayStream.
                </p>
              </div>
            </div>
            {/* Audits specs grid list */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-gray-700">Annual On-Site Audits</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-gray-700">SOC 1 and SOC 2 Compliant</span>
              </div>
            </div>
          </div>

          {/* Data Protection segments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-4">Data Protection</h2>
                <div className="space-y-6 text-gray-600 leading-relaxed">
                  <p>
                    <strong>Encryption in transit:</strong> All data sent to or from PayStream is encrypted in transit using 256-bit encryption. Our API and application endpoints are TLS/SSL only and score an "A+" rating on Qualys SSL Labs' tests.
                  </p>
                  <p>
                    <strong>Encryption at rest:</strong> All sensitive data, including primary account numbers (PANs), are encrypted at rest using AES-256. Decryption keys are stored on separate machines. None of PayStream's internal servers and daemons can obtain plain text card numbers but can request that cards are sent to a service provider on a static IP block.
                  </p>
                  <p>
                    <strong>Vulnerability Disclosure:</strong> If you believe you have discovered a bug in PayStream's security, please get in touch at <a href="mailto:security@paystream.com" className="text-primary-500 font-medium">security@paystream.com</a>. Our security team investigates all reported issues.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Security;

