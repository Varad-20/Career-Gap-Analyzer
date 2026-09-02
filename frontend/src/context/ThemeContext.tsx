import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    try {
        localStorage.setItem('theme', theme);
    } catch (_) {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Read what the anti-FOUC script already applied
        if (typeof document !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        try {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') return stored;
        } catch (_) {}
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Sync on mount in case the inline script ran before hydration
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        applyTheme(t);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            applyTheme(next);
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
