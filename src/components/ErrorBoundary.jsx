import { Component } from "react";

/**
 * Catches render-time errors anywhere in the public app and shows a branded
 * fallback instead of white-screening. Keep this dependency-free (no router
 * hooks) so it can wrap the whole tree safely.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Surface in dev; in prod this is where an error reporter (Sentry, etc.) hooks in.
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center px-6 text-center">
          <p className="section-tag">Something broke</p>
          <h1 className="font-heading text-6xl sm:text-7xl text-white leading-none mb-4">
            OUR <span className="text-[#2EC4B6]">BAD.</span>
          </h1>
          <p className="text-zinc-400 text-base max-w-md mx-auto mb-8">
            An unexpected error stopped this page from loading. Reload to try again.
          </p>
          <button onClick={this.handleReload} className="btn-primary text-sm">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
