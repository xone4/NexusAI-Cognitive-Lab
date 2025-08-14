import React from 'react';
import { nexusAIService } from '../services/nexusAIService';
import DashboardCard from './DashboardCard';
import { FireIcon } from './Icons';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Pick<ErrorBoundaryState, 'hasError' | 'error'> {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        const errorMessage = `UI Crash: ${error.toString()} \nComponent Stack: ${errorInfo.componentStack}`;
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        nexusAIService.log('ERROR', errorMessage);
    }

    render() {
        if (this.state.hasError) {
            return (
                <DashboardCard title="Interface Anomaly" icon={<FireIcon className="text-red-500" />}>
                    <div className="text-center p-4">
                        <h3 className="text-xl font-semibold text-red-400">An unexpected error occurred.</h3>
                        <p className="text-nexus-text-muted mt-2 max-w-xl mx-auto">
                            This interface module has encountered a problem. Reloading the application or navigating to another view usually resolves this. The event has been logged for review.
                        </p>
                        
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-red-500/20 text-red-400 font-bold py-2 px-6 rounded-md border border-red-500/50
                                       hover:bg-red-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            Reload Application
                        </button>

                        <details className="mt-6 bg-nexus-dark/50 p-3 rounded-md text-left text-xs font-mono text-nexus-text-muted">
                            <summary className="cursor-pointer text-nexus-primary font-semibold">Technical Details</summary>
                            <pre className="mt-2 whitespace-pre-wrap break-all">
                                <strong className="text-nexus-text">Error:</strong> {this.state.error?.toString()}
                                <br />
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    </div>
                </DashboardCard>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
