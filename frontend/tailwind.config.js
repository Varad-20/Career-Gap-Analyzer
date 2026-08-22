/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Rich Warm Ivory Base Colors
                ivory: {
                    50: '#0b0d11',    // Highest contrast text (deep charcoal)
                    100: '#181d27',   // Primary text
                    200: '#2d3545',   // Secondary text
                    300: '#4a5568',   // Muted body text
                    400: '#6c788d',   // Subtitle text
                    500: '#94a0b4',   // Border/placeholder
                    600: '#eae6dc',   // Warm Ivory border
                    700: '#f5f2eb',   // Warm Ivory card background
                    800: '#faf8f5',   // Warm Ivory page background
                    900: '#fffdfa',   // Pure Ivory card element
                },
                // Charcoal Dark Contrast Accent Colors
                charcoal: {
                    950: '#faf8f5',   // Warm Ivory page background
                    900: '#fffdfa',   // Warm Ivory card background
                    800: '#f5f2eb',   // Secondary Ivory fill
                    700: '#eae6dc',   // Input border/fill
                    600: '#dcd6c8',   // Border
                    500: '#4a5568',   // Label
                    400: '#2d3545',   // Muted text
                    300: '#181d27',   // Body text
                    50: '#0b0d11',    // Title text
                },
                // Muted Shade Blue Accent
                'shade-blue': {
                    400: '#3b82f6',
                    500: '#2563eb',
                    600: '#1d4ed8',
                    700: '#1e40af',
                    900: '#1e3a8a',
                },
                // Muted Shade Red Accent
                'shade-red': {
                    400: '#ef4444',
                    500: '#dc2626',
                    600: '#b91c1c',
                    700: '#991b1b',
                    900: '#7f1d1d',
                },
                // Legacy compatibility mappings
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#3b82f6',
                    500: '#2563eb',
                    600: '#1d4ed8',
                    700: '#1e40af',
                    800: '#1e3a8a',
                    900: '#172554',
                },
                accent: {
                    400: '#ef4444',
                    500: '#dc2626',
                    600: '#b91c1c',
                },
                dark: {
                    900: '#fffdfa',
                    800: '#faf8f5',
                    700: '#f5f2eb',
                    600: '#eae6dc',
                    500: '#dcd6c8',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'hero-gradient': 'radial-gradient(ellipse at 50% -20%, #f5f2eb 0%, #faf8f5 80%)',
                'card-gradient': 'linear-gradient(135deg, rgba(255, 253, 250, 0.9) 0%, rgba(245, 242, 235, 0.7) 100%)',
                'liquid-blue': 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.05) 100%)',
                'liquid-red': 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.05) 100%)',
                'liquid-ivory': 'linear-gradient(135deg, rgba(250, 248, 245, 0.7) 0%, rgba(245, 242, 235, 0.5) 100%)',
                'button-gradient': 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            },
            backdropBlur: {
                xs: '2px',
                '2xl': '40px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'liquid-morph': 'liquidMorph 12s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
};
