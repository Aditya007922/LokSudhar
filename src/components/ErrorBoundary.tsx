import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected portal error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-300 p-6">
            <h1 className="text-xl font-bold text-[#123B70] mb-2">
              LokSudhar Portal Service Interrupted
            </h1>
            <p className="text-sm text-slate-700 mb-4">
              An unexpected error occurred while processing your request. Please reload the page to restore normal service.
            </p>
            <div className="bg-slate-100 border border-slate-200 p-3 text-xs font-mono text-slate-700 mb-4 break-words">
              {this.state.errorMessage}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#123B70] text-white text-sm font-medium hover:bg-[#0E2F5A] cursor-pointer"
            >
              Reload Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
