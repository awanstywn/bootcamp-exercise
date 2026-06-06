/**
 * @file AdminPageEdit.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminPageEdit operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../../lib/apiClient, ../../lib/routes, lucide-react.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { API_ROUTES } from "../../lib/routes";
import { ArrowLeft, Save } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";
import { Link } from "react-router-dom";

export default function AdminPageEdit() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await apiClient.get(API_ROUTES.ADMIN.PAGE_BY_SLUG(slug!));
        const data = res.data.data;
        setTitle(data.title);
        setContent(data.content);
      } catch (err: any) {
        console.error("Failed to fetch page", err);
        setError("Failed to load page content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await apiClient.put(API_ROUTES.ADMIN.PAGE_BY_SLUG(slug!), {
        title,
        content
      });
      navigate("/admin/pages");
    } catch (err: any) {
      console.error("Failed to update page", err);
      setError(err.response?.data?.message || "Failed to update page");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/pages" 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Page: {title}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Title
          </label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (HTML / Text)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            You can use standard HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, etc.
          </p>
          <textarea 
            required
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-y"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSaving ? <Spinner size="sm" /> : <Save size={18} />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
