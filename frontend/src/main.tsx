import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught React Error:', error, errorInfo);
    }

    private handleReset = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0b0d11] text-[#f5f3ef] flex flex-col items-center justify-center p-6 text-center">
                    <div className="max-w-md w-full bg-[#12151c] border border-red-500/30 p-8 rounded-3xl shadow-2xl space-y-4">
                        <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                            ⚠️
                        </div>
                        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                        <p className="text-sm text-gray-400">
                            {this.state.error?.message || 'A client-side error occurred.'}
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg"
                        >
                            Reset Session & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: document.documentElement.classList.contains('dark')
                                    ? '#141720'
                                    : '#fffdfa',
                                color: document.documentElement.classList.contains('dark')
                                    ? '#f0ede8'
                                    : '#0b0d11',
                                border: document.documentElement.classList.contains('dark')
                                    ? '1px solid rgba(40,47,65,0.9)'
                                    : '1px solid rgba(220,214,200,0.8)',
                                borderRadius: '12px',
                                boxShadow: document.documentElement.classList.contains('dark')
                                    ? '0 8px 32px rgba(0,0,0,0.4)'
                                    : '0 8px 32px rgba(15,23,42,0.08)',
                            },
                            success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
                            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                        }}
                    />
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>
)
