/**
 * @file ErrorBoundary.tsx
 * @description A global React Error Boundary component designed to catch unexpected JavaScript errors anywhere in the child component tree and display a fallback UI instead of crashing the whole app.
 * @module Frontend/Components/ErrorBoundary
 */

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary
 * 
 * React class component that implements `getDerivedStateFromError` and `componentDidCatch` to intercept
 * rendering errors. If an error is caught, it renders a styled fallback screen with the error message and a reload button.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              An unexpected error occurred in the application. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="bg-gray-950 rounded-lg p-3 mb-6 overflow-auto">
                <code className="text-xs text-red-400 whitespace-pre-wrap font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw size={16} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
