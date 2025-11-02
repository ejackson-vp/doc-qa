/**
 * Concurrency limiter to control the number of parallel operations
 * across all users for document processing and generation.
 */

type QueuedTask = {
  fn: () => Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
};

class ConcurrencyLimiter {
  private name: string;
  private maxConcurrent: number;
  private activeCount: number = 0;
  private queue: QueuedTask[] = [];

  constructor(name: string, maxConcurrent: number) {
    this.name = name;
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Get current stats about the limiter
   */
  getStats() {
    return {
      name: this.name,
      maxConcurrent: this.maxConcurrent,
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      availableSlots: this.maxConcurrent - this.activeCount
    };
  }

  /**
   * Execute a task with concurrency limiting.
   * If the limit is reached, the task will be queued.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    // If we're under the limit, execute immediately
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      console.log(`[${this.name}] Task started immediately. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
      try {
        const result = await fn();
        return result;
      } finally {
        this.activeCount--;
        console.log(`[${this.name}] Task completed. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
        this.processQueue();
      }
    }

    // Otherwise, queue the task
    console.log(`[${this.name}] Task queued. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length + 1}`);
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        resolve: () => {},
        reject
      });
    });
  }

  /**
   * Process the next item in the queue if slots are available
   */
  private processQueue() {
    if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    console.log(`[${this.name}] Task started from queue. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
    
    task.fn()
      .finally(() => {
        this.activeCount--;
        console.log(`[${this.name}] Queued task completed. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
        this.processQueue();
      });
  }

  /**
   * Update the max concurrent limit (useful for dynamic configuration)
   */
  setMaxConcurrent(newMax: number) {
    if (newMax < 1) {
      throw new Error('Max concurrent must be at least 1');
    }
    this.maxConcurrent = newMax;
    // Try to process queued items if limit was increased
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      this.processQueue();
    }
  }
}

// Get the max concurrent limits from environment variables
const MAX_CONCURRENT_INGESTIONS = parseInt(
  process.env.MAX_CONCURRENT_INGESTIONS || '3',
  10
);

const MAX_CONCURRENT_GENERATIONS = parseInt(
  process.env.MAX_CONCURRENT_GENERATIONS || '5',
  10
);

// Use globalThis to persist the limiters across hot reloads in development
// and ensure singleton behavior
declare global {
  var ingestLimiterInstance: ConcurrencyLimiter | undefined;
  var generateLimiterInstance: ConcurrencyLimiter | undefined;
}

// Initialize or reuse existing instances
if (!globalThis.ingestLimiterInstance) {
  globalThis.ingestLimiterInstance = new ConcurrencyLimiter('Ingest', MAX_CONCURRENT_INGESTIONS);
  console.log(`Document ingestion limiter initialized with max ${MAX_CONCURRENT_INGESTIONS} concurrent operations`);
} else {
  globalThis.ingestLimiterInstance.setMaxConcurrent(MAX_CONCURRENT_INGESTIONS);
}

if (!globalThis.generateLimiterInstance) {
  globalThis.generateLimiterInstance = new ConcurrencyLimiter('Generate', MAX_CONCURRENT_GENERATIONS);
  console.log(`Answer generation limiter initialized with max ${MAX_CONCURRENT_GENERATIONS} concurrent operations`);
} else {
  globalThis.generateLimiterInstance.setMaxConcurrent(MAX_CONCURRENT_GENERATIONS);
}

export const ingestLimiter = globalThis.ingestLimiterInstance;
export const generateLimiter = globalThis.generateLimiterInstance;

