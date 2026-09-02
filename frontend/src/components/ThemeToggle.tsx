import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
    /** 'icon' = bare icon button (default), 'full' = icon + label pill */
    variant?: 'icon' | 'full';
    className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    if (variant === 'full') {
        return (
            <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`theme-toggle w-auto px-3 gap-1.5 ${className}`}
            >
                <span
                    className="theme-toggle-icon"
                    style={{
                        transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(180deg) scale(0.9)',
                        display: 'flex',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {isDark ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </span>
                <span className="text-xs font-semibold select-none">
                    {isDark ? 'Light' : 'Dark'}
                </span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`theme-toggle ${className}`}
        >
            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(0deg) scale(1)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {isDark ? (
                    <Sun
                        className="w-4 h-4"
                        style={{
                            animation: 'themeIconSpin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                    />
                ) : (
                    <Moon
                        className="w-4 h-4"
                        style={{
                            animation: 'themeIconSpin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                    />
                )}
            </span>
        </button>
    );
}
