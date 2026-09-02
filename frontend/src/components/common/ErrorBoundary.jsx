import React from 'react';
import { HiExclamation, HiRefresh, HiHome } from 'react-icons/hi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            background: 'var(--bg-app, #07080C)',
            color: 'var(--text-primary, #FFFFFF)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            position: 'relative',
          }}
        >
          <div
            style={{
              maxWidth: '580px',
              width: '100%',
              background: 'var(--bg-card, #111827)',
              border: '1px solid var(--border-color, #1E293B)',
              borderRadius: '24px',
              padding: '40px 32px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                margin: '0 auto 18px',
                boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
              }}
            >
              <HiExclamation />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary, #FFF)', margin: '0 0 8px 0' }}>
              Something Went Wrong
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted, #94A3B8)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              An unexpected application error occurred while rendering this view. Your session and saved data are safe.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <HiRefresh /> Reload Application
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <HiHome /> Go to Homepage
              </button>
            </div>

            {/* Developer Error Drawer */}
            <div style={{ marginTop: 20, textAlign: 'left', borderTop: '1px solid var(--border-color, #1E293B)', paddingTop: 14 }}>
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary, #6366F1)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {this.state.showDetails ? '▲ Hide Error Diagnostic Stack' : '▼ Show Error Diagnostic Stack'}
              </button>

              {this.state.showDetails && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color, #1E293B)',
                    fontSize: '0.75rem',
                    color: '#EF4444',
                    fontFamily: 'monospace',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <strong>{this.state.error?.toString()}</strong>
                  <br />
                  {this.state.errorInfo?.componentStack}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
