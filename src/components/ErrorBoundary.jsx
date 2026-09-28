import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sand flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-line rounded-2xl p-8 max-w-md shadow-xl">
            <span className="text-4xl mb-3 block">⚠️</span>
            <h2 className="font-display font-extrabold text-xl text-ink-950 mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-ink-600 mb-6">
              {this.state.error?.message || "An unexpected rendering error occurred. Please reload to recover your session."}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-paper hover:bg-slate-100 text-ink-800 border border-line"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
