import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到未处理错误:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: 'var(--bg-base)' }}
        >
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mystic-gold/10 border border-mystic-gold/30 mb-6">
              <Sparkles className="w-10 h-10 text-mystic-gold/60" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-gold-gradient glow-text mb-3">
              迷雾暂时遮蔽了牌面
            </h1>
            <p className="font-body italic text-sm text-midnight-200/70 mb-2">
              页面遇到了一点意外。深呼吸，重新开始即可。
            </p>
            {this.state.error && (
              <p className="text-[11px] text-midnight-300/50 mb-6 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3">
              <button onClick={this.handleReset} className="btn-ghost text-xs">
                重试
              </button>
              <button onClick={this.handleReload} className="btn-mystic text-xs">
                回到首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
