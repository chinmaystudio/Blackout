import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Blackout ErrorBoundary] Intercepted runtime exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0a0a0a',
            color: '#39ff14',
            fontFamily: 'monospace',
            padding: '2rem',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div style={{ border: '1px solid #39ff14', padding: '2rem', maxWidth: '600px', borderRadius: '4px' }}>
            <h2 style={{ letterSpacing: '0.15em', margin: 0 }}>BLACKOUT // SYSTEM RECOVERY</h2>
            <p style={{ color: '#aaa', margin: '1rem 0' }}>
              A rendering anomaly was intercepted and neutralized.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#39ff14',
                color: '#000',
                border: 'none',
                padding: '0.6rem 1.8rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontFamily: 'inherit',
                letterSpacing: '0.1em',
              }}
            >
              REBOOT ARCHIVE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
