/**
 * @file AdminPagesList.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for AdminPagesList operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../../lib/apiClient, ../../lib/routes, lucide-react.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../lib/apiClient";
import { API_ROUTES } from "../../lib/routes";
import { FileText, Edit2 } from "lucide-react";
import { Spinner } from "../../components/ui/Spinner";

interface PageInfo {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await apiClient.get(API_ROUTES.ADMIN.PAGES);
        setPages(res.data.data);
      } catch (error) {
        console.error("Failed to fetch pages", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Content Pages</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="p-4 font-medium">Page Title</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium">Last Updated</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      No pages found.
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FileText size={20} />
                          </div>
                          <span className="font-medium text-gray-900">{page.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-sm">/{page.slug}</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <Link 
                          to={`/admin/pages/${page.slug}`}
                          className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
