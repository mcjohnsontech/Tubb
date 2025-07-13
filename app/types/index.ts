// API Response Types
export interface BalanceResponse {
  balance: string;
  currency: string;
  walletAddress: string;
}

export interface TransactionResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  error?: string;
}

export interface FaucetResponse {
  success: boolean;
  amount: string;
  message: string;
  error?: string;
}

// Accessibility Types
export interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'small' | 'medium' | 'large' | 'extraLarge';
  voiceCommandsEnabled: boolean;
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
  triggerHapticFeedback: (type: 'success' | 'error' | 'warning' | 'tap') => void;
}

// Component Props Types
export interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  showCloseButton?: boolean;
}

export interface CopyButtonProps {
  text: string;
  label: string;
  onCopy?: () => void;
}

export interface VoiceCommandButtonProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

// Form Types
export interface SendFormData {
  recipientAddress: string;
  amount: string;
}

// Navigation Types
export interface RouteConfig {
  path: string;
  title: string;
  description: string;
}

// Voice Recognition Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

// Haptic Feedback Patterns
export const HAPTIC_PATTERNS = {
  success: [50],
  error: [200, 100, 200],
  warning: [100, 50, 100],
  tap: [50]
} as const;

// Text Scale Factors
export const TEXT_SCALE_FACTORS = {
  small: 0.9,
  medium: 1.0,
  large: 1.2,
  extraLarge: 1.4
} as const;

// Hardcoded Wallet Configuration
export const WALLET_CONFIG = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  network: 'Sui Testnet',
  currency: 'SUI'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  balance: '/api/balance',
  send: '/api/send',
  faucet: '/api/faucet'
} as const; 