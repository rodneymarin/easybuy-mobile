interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  surface: string;
  surfaceText: string;
  primary: string;
  tabBarInactive: string;
  panelBackground: string;
  panelText: string;
  panelBorder: string;
  placeholderText: string;
}

const light: ThemeColors = {
  background: '#fff',
  cardBackground: '#fff',
  text: '#000',
  textSecondary: '#666',
  border: '#e0e0e0',
  surface: '#f0f0f0',
  surfaceText: '#555',
  primary: '#6C63FF',
  tabBarInactive: '#8e8e93',
  panelBackground: '#fff',
  panelText: '#333',
  panelBorder: '#e0e0e0',
  placeholderText: '#999',
};

const dark: ThemeColors = {
  background: '#121212',
  cardBackground: '#1c1c1e',
  text: '#f5f5f5',
  textSecondary: '#aaa',
  border: '#333',
  surface: '#2c2c2e',
  surfaceText: '#ccc',
  primary: '#6C6CE6',
  tabBarInactive: '#636366',
  panelBackground: '#1c1c1e',
  panelText: '#f5f5f5',
  panelBorder: '#38383a',
  placeholderText: '#666',
};

export { light, dark, type ThemeColors };
