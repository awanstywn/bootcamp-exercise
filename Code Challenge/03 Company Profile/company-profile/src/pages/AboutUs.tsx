/**
 * @file AboutUs.tsx
 * @description Corporate introduction page. Showcases company milestones, core values,
 * and a dynamic preview of the leadership team fetched via randomuser.me API.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import type { TeamMember, RandomUserResponse } from '@/types';

// Milestone entries summarizing the historical timeline of the company
const milestones = [
  { year: '2015', event: 'PayStream founded in San Francisco with a mission to simplify online payments.' },
  { year: '2016', event: 'Launched the PayStream API — 500 developers signed up on day one.' },
  { year: '2017', event: 'Expanded to Europe and Asia Pacific; crossed $1B in payment volume.' },
  { year: '2019', event: 'Launched PayStream Radar — ML-powered fraud detection with zero false positives.' },
  { year: '2021', event: 'Introduced PayStream Connect for global marketplace platforms.' },
  { year: '2023', event: 'Processing $840B+ annually across 195 countries and 135 currencies.' },
];

// Core corporate pillars
const values = [
  { title: 'User Obsession',       desc: 'We start from the customer and work backwards in every decision we make.' },
  { title: 'Technical Excellence', desc: 'We hold ourselves to the highest engineering standards, always.' },
  { title: 'Global Mindset',       desc: 'We build for the world — not just one timezone, language, or market.' },
  { title: 'Move Fast',            desc: 'We ship, learn, iterate. Speed without shortcuts.' },
];

// Hardcoded roles mapping sequentially to dynamic mock profiles
const LEAD_ROLES = ['CEO & Founder', 'CTO', 'Head of Product', 'VP of Engineering'];

/**
 * AboutUs Page Component.
 */
const AboutUs = () => {
  // State variables for storing active leadership members and network resolves
  const [leadership, setLeadership] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exactly 4 profiles dynamically from randomuser.me to populate the leadership panel
  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const res = await fetch('https://randomuser.me/api/?results=4&nat=us,gb');
        if (res.ok) {
          const data: RandomUserResponse = await res.json();
          setLeadership(data.results);
        }
      } catch (err) {
        console.error('Failed to load leadership team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadership();
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us — PayStream</title>
        <meta name="description" content="Learn about PayStream's founding story, milestones, team culture, and the values that guide us." />
      </Helmet>

      {/* Page Hero - Brand overview statements */}
      <section className="bg-dark-900 text-white py-20 text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About PayStream</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-12">
            We're building the economic infrastructure for the internet.
            Starting with payments — and not stopping there.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="PayStream Team collaborating" 
            className="rounded-2xl shadow-2xl w-full object-cover h-[300px] sm:h-[400px] lg:h-[500px]" 
          />
        </div>
      </section>

      {/* Company History Timeline */}
      <section className="py-20" aria-labelledby="history-heading">
        <div className="container-custom">
          <h2 id="history-heading" className="section-title text-center mb-12">Our Journey</h2>
          <ol className="relative border-l-2 border-primary-500 pl-8 space-y-10 max-w-2xl mx-auto" role="list">
            {milestones.map(m => (
              <li key={m.year} className="relative">
                {/* Visual timeline bullet */}
                <div
                  className="absolute -left-10 top-0 w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow"
                  aria-hidden="true"
                />
                <time className="text-primary-500 font-bold text-sm block" dateTime={m.year}>
                  {m.year}
                </time>
                <p className="text-dark-700 mt-1">{m.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Culture & Core Values */}
      <section className="py-20 bg-dark-100" aria-labelledby="values-heading">
        <div className="container-custom">
          <h2 id="values-heading" className="section-title text-center mb-4">Our Values</h2>
          <p className="section-subtitle text-center mx-auto mb-12">
            The principles that guide how we work, build, and treat each other.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <article key={v.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-dark-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Profile Previews */}
      <section className="py-20 bg-white" aria-labelledby="team-intro-heading">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="team-intro-heading" className="section-title mb-4">Meet the People Behind PayStream</h2>
            <p className="text-gray-500">
              Our leadership team brings together decades of experience from the world's most innovative technology companies, united by a passion for making payments work better for everyone.
            </p>
          </div>

          {/* Renders when the API resolves */}
          {!loading && leadership.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {leadership.map((member, idx) => (
                <article
                  key={member.login.uuid}
                  className="bg-dark-50 rounded-xl p-6 border border-gray-100 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={member.picture.large}
                    alt={`Profile photo of ${member.name.first} ${member.name.last}`}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-primary-100"
                    loading="lazy"
                    width={80}
                    height={80}
                  />
                  <h3 className="font-semibold text-dark-900">
                    {member.name.first} {member.name.last}
                  </h3>
                  <p className="text-primary-500 text-xs font-semibold mt-1">
                    {LEAD_ROLES[idx % LEAD_ROLES.length]}
                  </p>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {member.name.first} leads our efforts to build scalable and robust financial infrastructure for millions of businesses worldwide.
                  </p>
                </article>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/teams" className="btn-primary">Meet the full team</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;

