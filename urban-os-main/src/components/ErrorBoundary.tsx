import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Digital Twin Caught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6 bg-[#1a1e24] text-white font-mono select-none">
          <div className="max-w-lg w-full bg-white text-black border-2 border-black p-5 hard-shadow space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 text-[#dc0000] font-bold text-sm uppercase">
              <span className="w-3 h-3 bg-[#dc0000]"></span>
              <span>{this.props.fallbackTitle || '3D ENGINE RECOVERY SYSTEM'}</span>
            </div>

            <p className="text-xs text-[#333333] leading-relaxed">
              An unexpected render anomaly was safely contained. The system prevented an application crash.
            </p>

            <div className="bg-[#f5f5f5] border border-black p-2.5 text-[11px] overflow-x-auto max-h-36 text-[#b91c1c]">
              <strong>Diagnostics:</strong> {this.state.error?.message || 'Unknown error'}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[#dc0000] text-white border border-black py-2 font-bold text-xs uppercase hover:bg-[#b91c1c] cursor-pointer"
              >
                Reload &amp; Reset Scene
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 bg-white text-black border border-black py-2 font-bold text-xs uppercase hover:bg-[#f0f0f0] cursor-pointer"
              >
                Dismiss &amp; Continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
