import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { api } from '../lib/axios';

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/settings').then(res => {
      setSettings(res.data);
      setIsLoading(false);
    }).catch(err => {
      // eslint-disable-next-line no-console
console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead title="About Us - Our Mission & Team" />
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
            {settings.aboutHeroTitle || 'Empowering developers to build the future of the web.'}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {settings.aboutHeroSubtitle || 'We are a community-driven platform dedicated to sharing high-quality, actionable insights on software engineering, design, and technology.'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif text-slate-900">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              {settings.aboutMissionText1 || 'Technology moves fast. Too fast for any single person to keep up with alone. Our mission is to cut through the noise and provide a curated space where experienced professionals and eager learners can exchange real-world knowledge.'}
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              {settings.aboutMissionText2 || 'Whether you\'re debugging a complex microservices architecture or just starting your first React project, we believe that open knowledge sharing is the key to pushing the entire industry forward.'}
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="space-y-8">
              <div>
                <div className="text-4xl font-black text-indigo-600 mb-2">{settings.aboutStat1Value || '1M+'}</div>
                <div className="text-sm font-bold tracking-wider text-slate-500 uppercase">{settings.aboutStat1Label || 'Monthly Readers'}</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-600 mb-2">{settings.aboutStat2Value || '500+'}</div>
                <div className="text-sm font-bold tracking-wider text-slate-500 uppercase">{settings.aboutStat2Label || 'Expert Contributors'}</div>
              </div>
              <div>
                <div className="text-4xl font-black text-indigo-600 mb-2">{settings.aboutStat3Value || '10k+'}</div>
                <div className="text-sm font-bold tracking-wider text-slate-500 uppercase">{settings.aboutStat3Label || 'Articles Published'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Write for us CTA */}
      <section className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold font-serif text-slate-900">{settings.aboutCtaTitle || 'Join Our Community of Writers'}</h2>
          <p className="text-lg text-slate-600">
            {settings.aboutCtaText || 'Have a story to share? A technical deep-dive? We are always looking for passionate voices to join our growing roster of authors.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/authors" 
              className="px-6 py-3 border-2 border-slate-200 text-slate-900 font-medium rounded-lg hover:border-slate-900 transition-colors"
            >
              Meet Our Authors
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Become an Author
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
