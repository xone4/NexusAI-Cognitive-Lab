import React from 'react';
import { useTranslation } from 'react-i18next';
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
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo });
        const errorMessage = `UI Crash: ${error.toString()} \nComponent Stack: ${errorInfo.componentStack}`;
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        nexusAIService.log('ERROR', errorMessage);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
        }

        return this.props.children;
    }
}

const ErrorFallback: React.FC<Omit<ErrorBoundaryState, 'hasError'>> = ({ error, errorInfo }) => {
    const { t } = useTranslation();

    return (
        <DashboardCard title={t('errorBoundary.title')} icon={<FireIcon className="text-red-500" />}>
            <div className="text-center p-4">
                <h3 className="text-xl font-semibold text-red-400">{t('errorBoundary.heading')}</h3>
                <p className="text-nexus-text-muted mt-2 max-w-xl mx-auto">
                    {t('errorBoundary.message')}
                </p>
                
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-red-500/20 text-red-400 font-bold py-2 px-6 rounded-full border border-red-500/50
                               hover:bg-red-500/40 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    {t('errorBoundary.reload')}
                </button>

                <details className="mt-6 bg-nexus-dark/50 p-3 rounded-xl text-left text-xs font-mono text-nexus-text-muted">
                    <summary className="cursor-pointer text-nexus-primary font-semibold">{t('errorBoundary.details')}</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all">
                        <strong className="text-nexus-text">{t('errorBoundary.error')}:</strong> {error?.toString()}
                        <br />
                        {errorInfo?.componentStack}
                    </pre>
                </details>
            </div>
        </DashboardCard>
    );
};


export default ErrorBoundary;