/**
 * @file ContentPage.tsx
 * @description Page Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for ContentPage operations.
 * 
 * @relations
 * Interacts with: react, react-router-dom, ../lib/apiClient, ../lib/routes, ../components/ui/Spinner.
 * 
 * @howItWorks
 * Renders the main page view, fetches necessary data, and composes smaller child components to build the UI. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../lib/apiClient";
import { API_ROUTES } from "../lib/routes";
import { Spinner } from "../components/ui/Spinner";

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await apiClient.get(API_ROUTES.PAGES.GET(slug!));
        setPage(res.data.data);
      } catch (err) {
        console.error("Failed to fetch page", err);
        setError("Page not found");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-[50vh] flex justify-center items-center"><Spinner /></div>;
  }

  if (error || !page) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-display font-bold">404 - Page Not Found</h1>
        <p className="text-gray-500">The content you are looking for does not exist.</p>
        <Link to="/" className="text-indigo-600 hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-display font-bold mb-8 text-gray-900">{page.title}</h1>
      {/* 
        Using dangerouslySetInnerHTML because we want to support basic HTML
        content from the database (like <p>, <strong>, <br>).
        In a production app with user-submitted content, this should be sanitized.
      */}
      <div 
        className="prose prose-lg max-w-none prose-indigo"
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </div>
  );
}
