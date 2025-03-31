
import { TerminalStore } from '@/pages/Admin';

/**
 * Helper function to add log entries to the terminal
 * This centralizes terminal logging and handles the singleton pattern correctly
 */
export const logToTerminal = (message: string): void => {
  // Get the singleton instance and then call addLine on it
  if (TerminalStore && typeof TerminalStore.getInstance === 'function') {
    const instance = TerminalStore.getInstance();
    if (instance && typeof instance.addLine === 'function') {
      instance.addLine(message);
    } else {
      // Fallback for when we're not in the admin context or terminal isn't available
      console.log(`[Terminal Log] ${message}`);
    }
  } else {
    // Fallback for when TerminalStore is not available at all
    console.log(`[Terminal Log] ${message}`);
  }
};
