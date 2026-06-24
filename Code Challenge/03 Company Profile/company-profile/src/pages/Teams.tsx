/**
 * @file Teams.tsx
 * @description Teams directory page. Dynamically fetches 12 mock staff profiles
 * from randomuser.me, mapping them to structural roles, locations, and email tags.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import type { TeamMember, RandomUserResponse } from '@/types';
import { MapPin, Mail } from 'lucide-react';

// Hardcoded roles mapping sequentially to dynamic user objects
const ROLES = [
  'Software Engineer', 'Product Manager', 'UX Designer',
  'Backend Engineer', 'DevOps Lead', 'Data Scientist',
  'Frontend Developer', 'QA Engineer', 'Marketing Lead', 'Customer Success',
  'Security Engineer', 'Platform Architect',
];

/**
 * Team Directory Page Component.
 */
const Teams = () => {
  // State hook variables for loading sequences and dynamic lists
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exactly 12 users on component mount to simulate team directory
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('https://randomuser.me/api/?results=12&nat=us,gb,au,ca,nz');
        if (!res.ok) throw new Error('API error');
        const data: RandomUserResponse = await res.json();
        setMembers(data.results);
      } catch {
        setError('Unable to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Team — PayStream</title>
        <meta name="description" content="Meet the talented engineers, designers, and innovators building PayStream." />
      </Helmet>

      {/* Hero Page header */}
      <section className="bg-dark-900 text-white py-20 text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Meet Our Team</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Talented people from 30+ countries, united by a passion for making payments just work.
          </p>
        </div>
      </section>

      {/* Team grid section */}
      <section className="py-20">
        <div className="container-custom">

          {/* Loading Skeleton Cards */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-label="Loading team members" aria-busy="true">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse text-center" aria-hidden="true">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Error visual state */}
          {error && (
            <p className="text-center text-red-500 py-12" role="alert">{error}</p>
          )}

          {/* Render team members catalog */}
          {!loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member, idx) => (
                <article
                  key={member.login.uuid}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={member.picture.large}
                    alt={`Profile photo of ${member.name.first} ${member.name.last}`}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-primary-100"
                    loading="lazy"
                    width={80}
                    height={80}
                  />
                  <h2 className="font-semibold text-dark-900">
                    {member.name.first} {member.name.last}
                  </h2>
                  {/* Select role sequentially by index to cover list array */}
                  <p className="text-primary-500 text-xs font-semibold mt-1">
                    {ROLES[idx % ROLES.length]}
                  </p>
                  
                  {/* Contact details */}
                  <div className="mt-3 space-y-1">
                    <p className="flex items-center justify-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      {member.location.city}, {member.location.country}
                    </p>
                    <p className="flex items-center justify-center gap-1 text-xs text-gray-400 truncate px-2">
                      <Mail className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{member.email}</span>
                    </p>
                  </div>
                  
                  {/* Explanatory bio statement */}
                  <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                    {member.name.first} is a {ROLES[idx % ROLES.length]} based in {member.location.city}. Passionate about building scalable payment infrastructure and developer tools.
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Teams;

