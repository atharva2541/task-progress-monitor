import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface OptimisticLockError extends Error {
  isOptimisticLockError: true;
  currentVersion: string;
  attemptedVersion: string;
}

export class ConcurrencyManager {
  // Check if error is due to concurrent modification
  static isOptimisticLockError(error: any): error is OptimisticLockError {
    return error && error.isOptimisticLockError === true;
  }

  // Create optimistic lock error
  static createOptimisticLockError(current: string, attempted: string): OptimisticLockError {
    const error = new Error('Resource was modified by another user') as OptimisticLockError;
    error.isOptimisticLockError = true;
    error.currentVersion = current;
    error.attemptedVersion = attempted;
    return error;
  }

  // Retry operation with exponential backoff
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry optimistic lock errors - they need user intervention
        if (this.isOptimisticLockError(error)) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Show user-friendly conflict resolution
  static showConflictResolution(entityName: string = 'item') {
    toast({
      title: "Concurrent Modification Detected",
      description: `This ${entityName} was modified by another user. Please refresh and try again.`,
      variant: "destructive"
    });
  }

  // Generate version identifier for optimistic locking
  static generateVersion(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

// Real-time subscription manager
export class RealtimeManager {
  private static subscriptions = new Map<string, any>();

  // Subscribe to table changes
  static subscribeToTable(
    tableName: string,
    callback: (payload: any) => void,
    filter?: { column: string; value: any }
  ) {
    const subscriptionKey = `${tableName}_${filter ? `${filter.column}:${filter.value}` : 'all'}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      return this.subscriptions.get(subscriptionKey);
    }

    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
        },
        callback
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, channel);
    return channel;
  }

  // Unsubscribe from table changes
  static unsubscribeFromTable(tableName: string, filter?: { column: string; value: any }) {
    const subscriptionKey = `${tableName}_${filter ? `${filter.column}:${filter.value}` : 'all'}`;
    const channel = this.subscriptions.get(subscriptionKey);
    
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(subscriptionKey);
    }
  }

  // Clean up all subscriptions
  static cleanup() {
    this.subscriptions.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}
