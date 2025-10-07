const theme = {
  colors: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    surface: '#F1F5F9',
    text: '#1E293B',
    muted: '#64748B',
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    success: '#10B981',
    successLight: '#34D399',
    danger: '#EF4444',
    dangerLight: '#F87171',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    border: '#E2E8F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.15)'
  },
  spacing: (n: number) => n * 8,
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8
    }
  }
};

export default theme;


