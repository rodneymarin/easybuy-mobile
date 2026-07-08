interface ThemeColors {
	background: string;
	cardBackground: string;
	text: string;
	textSecondary: string;
	border: string;
	surface: string;
	surfaceText: string;
	primary: string;
	destructive: string;
	destructiveBorder: string;
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
	surfaceText: '#333',
	primary: '#4A5DF9',
	destructive: '#FFE0E0',
	destructiveBorder: '#E05555',
	tabBarInactive: '#8e8e93',
	panelBackground: '#fff',
	panelText: '#333',
	panelBorder: '#e0e0e0',
	placeholderText: '#999',
};

const dark: ThemeColors = {
	background: '#121212',
	cardBackground: '#1c1c1c',
	text: '#f5f5f5',
	textSecondary: '#aaa',
	border: '#333',
	surface: '#2c2c2e',
	surfaceText: '#ccc',
	primary: '#4A5DF9',
	destructive: '#4A1C1C',
	destructiveBorder: '#d95050',
	tabBarInactive: '#636366',
	panelBackground: '#1c1c1e',
	panelText: '#f5f5f5',
	panelBorder: '#38383a',
	placeholderText: '#666',
};

function darkenColor(hex: string, amount: number): string {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('');
  }
  const num = parseInt(normalized, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * amount));
  return `rgb(${r}, ${g}, ${b})`;
}

export { light, dark, darkenColor, type ThemeColors };
