export type ColorPalette = {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryText: string;
  border: string;
  danger: string;
  success: string;
};

export const lightColors: ColorPalette = {
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  primary: '#2563eb',
  primaryText: '#ffffff',
  border: '#e5e7eb',
  danger: '#dc2626',
  success: '#16a34a',
};

export const darkColors: ColorPalette = {
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  border: '#374151',
  danger: '#ef4444',
  success: '#22c55e',
};
