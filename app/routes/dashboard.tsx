import type { Route } from "./+types/dashboard";
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Wallet, Send, Coins, Settings } from 'lucide-react';
import { useFocusOnRouteChange } from '../hooks/useFocusOnRouteChange';
import { useAccessibilityAnnouncer } from '../hooks/useAccessibilityAnnouncer';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { apiService } from '../services/api';
import MessageModal from '../components/MessageModal';
import CopyButton from '../components/CopyButton';
import VoiceCommandButton from '../components/VoiceCommandButton';
import type { BalanceResponse, TransactionResponse, FaucetResponse, SendFormData } from '../types';
import { WALLET_CONFIG } from '../types';




export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


const Dashboard: React.FC = () => {
  const mainContentRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [isLoadingFaucet, setIsLoadingFaucet] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messageModal, setMessageModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const { settings, triggerHapticFeedback, announceToScreenReader } = useAccessibility();

  // Focus management and accessibility announcements
  useFocusOnRouteChange({ mainContentRef, pageTitle: 'Dashboard' });
  useAccessibilityAnnouncer({ 
    pageTitle: 'Dashboard', 
    pageDescription: 'View your wallet balance, send SUI, and access faucet' 
  });

  // Load balance on component mount
  useEffect(() => {
    loadBalance();
  }, []);

  // Handle voice command for balance check
  useEffect(() => {
    if (isListening) {
      loadBalance();
      setIsListening(false);
    }
  }, [isListening]);

  const loadBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response: BalanceResponse = await apiService.getBalance();
      setBalance(response.balance);
      announceToScreenReader(`Current balance is ${response.balance} SUI`);
      triggerHapticFeedback('success');
    } catch (error) {
      console.error('Failed to load balance:', error);
      announceToScreenReader('Failed to load balance');
      triggerHapticFeedback('error');
      showMessage('error', 'Error', 'Failed to load wallet balance. Please try again.');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientAddress.trim() || !amount.trim()) {
      showMessage('warning', 'Validation Error', 'Please fill in all fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showMessage('warning', 'Validation Error', 'Please enter a valid amount.');
      return;
    }

    try {
      setIsLoadingTransaction(true);
      const formData: SendFormData = {
        recipientAddress: recipientAddress.trim(),
        amount: amount.trim()
      };

      const response: TransactionResponse = await apiService.sendTransaction(formData);
      
      if (response.success) {
        showMessage('success', 'Transaction Successful', response.message);
        setRecipientAddress('');
        setAmount('');
        loadBalance(); // Refresh balance
        announceToScreenReader('Transaction completed successfully');
        triggerHapticFeedback('success');
      } else {
        showMessage('error', 'Transaction Failed', response.error || 'Unknown error occurred');
        announceToScreenReader('Transaction failed');
        triggerHapticFeedback('error');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      showMessage('error', 'Transaction Failed', 'Failed to send transaction. Please try again.');
      announceToScreenReader('Transaction failed');
      triggerHapticFeedback('error');
    } finally {
      setIsLoadingTransaction(false);
    }
  };

  const handleFaucetRequest = async () => {
    try {
      setIsLoadingFaucet(true);
      const response: FaucetResponse = await apiService.requestFaucet();
      
      if (response.success) {
        showMessage('success', 'Faucet Request Successful', response.message);
        loadBalance(); // Refresh balance
        announceToScreenReader('Successfully received SUI from faucet');
        triggerHapticFeedback('success');
      } else {
        showMessage('error', 'Faucet Request Failed', response.error || 'Unknown error occurred');
        announceToScreenReader('Faucet request failed');
        triggerHapticFeedback('error');
      }
    } catch (error) {
      console.error('Faucet request failed:', error);
      showMessage('error', 'Faucet Request Failed', 'Failed to request SUI from faucet. Please try again.');
      announceToScreenReader('Faucet request failed');
      triggerHapticFeedback('error');
    } finally {
      setIsLoadingFaucet(false);
    }
  };

  const showMessage = (type: 'success' | 'error' | 'warning' | 'info' | 'loading', title: string, message: string) => {
    setMessageModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeMessage = () => {
    setMessageModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-background-DEFAULT">
      <header className="bg-background-card shadow-sm border-b border-border-DEFAULT">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-text-DEFAULT">Sui Digital Wallet</h1>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary bg-opacity-10 rounded-xl hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </header>

      <main ref={mainContentRef} className="max-w-4xl mx-auto px-4 py-8" tabIndex={-1}>
        {/* Balance Section */}
        <section className="mb-8">
          <div className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-DEFAULT">Wallet Balance</h2>
              <VoiceCommandButton
                isListening={isListening}
                onToggle={() => setIsListening(!isListening)}
                disabled={!settings.voiceCommandsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-light mb-1">Current Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-text-DEFAULT">
                    {isLoadingBalance ? '...' : balance}
                  </span>
                  <span className="text-lg text-text-light">SUI</span>
                </div>
              </div>
              
              <button
                onClick={loadBalance}
                disabled={isLoadingBalance}
                className="px-4 py-2 text-sm font-medium text-primary bg-primary bg-opacity-10 rounded-xl hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                aria-label="Refresh balance"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Wallet Address Section */}
        <section className="mb-8">
          <div className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <h2 className="text-xl font-semibold text-text-DEFAULT mb-4">Your Wallet Address</h2>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <code className="text-sm text-text-DEFAULT font-mono break-all">
                {WALLET_CONFIG.address}
              </code>
              <CopyButton
                text={WALLET_CONFIG.address}
                label="wallet address"
                onCopy={() => triggerHapticFeedback('success')}
              />
            </div>
          </div>
        </section>

        {/* Send Transaction Section */}
        <section className="mb-8">
          <div className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <h2 className="text-xl font-semibold text-text-DEFAULT mb-4">Send SUI</h2>
            
            <form onSubmit={handleSendTransaction} className="space-y-4">
              <div>
                <label htmlFor="recipient-address" className="block text-sm font-medium text-text-DEFAULT mb-2">
                  Recipient Address
                </label>
                <input
                  id="recipient-address"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-border-DEFAULT rounded-xl focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-all duration-200"
                  placeholder="Enter recipient wallet address"
                  required
                  aria-describedby="recipient-address-help"
                />
                <p id="recipient-address-help" className="mt-1 text-sm text-text-light">
                  Enter the complete Sui wallet address
                </p>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-text-DEFAULT mb-2">
                  Amount (SUI)
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-border-DEFAULT rounded-xl focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                  aria-describedby="amount-help"
                />
                <p id="amount-help" className="mt-1 text-sm text-text-light">
                  Enter the amount of SUI to send
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoadingTransaction}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white bg-primary rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isLoadingTransaction ? 'Sending...' : 'Send SUI'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Faucet Section */}
        <section>
          <div className="bg-background-card rounded-2xl p-6 shadow-lg border border-border-DEFAULT">
            <h2 className="text-xl font-semibold text-text-DEFAULT mb-4">Get Test SUI</h2>
            <p className="text-sm text-text-light mb-4">
              Request test SUI from the faucet to try out the wallet features.
            </p>
            
            <button
              onClick={handleFaucetRequest}
              disabled={isLoadingFaucet}
              className="flex items-center gap-2 px-6 py-3 text-white bg-secondary rounded-xl hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-4 h-4" />
              <span>{isLoadingFaucet ? 'Requesting...' : 'Request Faucet SUI'}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessage}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        showCloseButton={messageModal.type !== 'loading'}
      />
    </div>
  );
};

export default Dashboard; 