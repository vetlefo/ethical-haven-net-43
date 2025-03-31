
import { TerminalStore } from '@/pages/Admin';

/**
 * Helper function to add log entries to the terminal
 * This centralizes terminal logging and handles the singleton pattern correctly
 */
export const logToTerminal = (message: string): void => {
  // Get the singleton instance and then call addLine on it
  TerminalStore.getInstance().addLine(message);
};
