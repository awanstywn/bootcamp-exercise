/**
 * @fileoverview Admin Settings Page
 * @objective Provide a UI for configuring global site settings (e.g. Site Name, Registration rules).
 * @risk Currently a UI mock. In a real scenario, changing these settings affects the entire platform's behavior.
 * @relations Route: `/admin/settings`.
 * @logic
 * - Initializes mock settings state on mount.
 * - `handleSave`: Simulates an API delay before confirming a successful save via an alert.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../lib/axios';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/settings', settings);
      alert('Settings saved!');
    } catch (_error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4 font-serif">About Page - Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={settings.aboutHeroTitle || ''}
                onChange={(e) => handleChange('aboutHeroTitle', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
              <textarea
                value={settings.aboutHeroSubtitle || ''}
                onChange={(e) => handleChange('aboutHeroSubtitle', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4 font-serif">About Page - Mission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mission Paragraph 1</label>
              <textarea
                value={settings.aboutMissionText1 || ''}
                onChange={(e) => handleChange('aboutMissionText1', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mission Paragraph 2</label>
              <textarea
                value={settings.aboutMissionText2 || ''}
                onChange={(e) => handleChange('aboutMissionText2', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4 font-serif">About Page - Statistics</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 1 Value</label>
                <input
                  type="text"
                  value={settings.aboutStat1Value || ''}
                  onChange={(e) => handleChange('aboutStat1Value', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 1 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat1Label || ''}
                  onChange={(e) => handleChange('aboutStat1Label', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 2 Value</label>
                <input
                  type="text"
                  value={settings.aboutStat2Value || ''}
                  onChange={(e) => handleChange('aboutStat2Value', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 2 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat2Label || ''}
                  onChange={(e) => handleChange('aboutStat2Label', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 3 Value</label>
                <input
                  type="text"
                  value={settings.aboutStat3Value || ''}
                  onChange={(e) => handleChange('aboutStat3Value', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stat 3 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat3Label || ''}
                  onChange={(e) => handleChange('aboutStat3Label', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
