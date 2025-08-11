const Queue = require('bull');
const path = require('path');
const fs = require('fs');
const Redis = require('ioredis');

// Redis connection configuration
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  }
};

// Create a single queue for all search jobs
const searchQueue = new Queue('search-queue', redisConfig);

// Process all search jobs
searchQueue.process(async (job) => {
  const { type, sessionId, uploadPath, files } = job.data;
  console.log(`Processing ${type} search job ${job.id}`);

  try {
    // Update job progress
    job.progress(10);

    // Different processing based on job type
    if (type === 'sequence') {
      // Here you would implement the actual sequence search logic
      // For example, running a BLAST search or similar

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job progress
      job.progress(50);

      // More processing...
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job progress
      job.progress(100);

      // Return results
      return {
        success: true,
        type,
        sessionId,
        message: 'Sequence search completed successfully',
        results: {
          // Sample results, replace with actual search results
          matches: [
            { id: 'BGC0001', similarity: 0.95 },
            { id: 'BGC0002', similarity: 0.87 }
          ]
        }
      };
    } else if (type === 'bgc') {
      // Here you would implement the actual BGC search logic
      // For example, comparing the uploaded BGC with the database

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job progress
      job.progress(50);

      // More processing...
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update job progress
      job.progress(100);

      // Return results
      return {
        success: true,
        type,
        sessionId,
        message: 'BGC search completed successfully',
        results: {
          // Sample results, replace with actual search results
          matches: [
            { id: 'GCF0001', similarity: 0.92 },
            { id: 'GCF0002', similarity: 0.85 }
          ]
        }
      };
    } else {
      throw new Error(`Unknown search type: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing ${type} search job ${job.id}:`, error);
    throw new Error(`${type} search failed: ${error.message}`);
  }
});

// Helper function to update Redis with the latest queue statistics
const updateQueueStatsInRedis = async (type = null) => {
  try {
    // Create a Redis connection
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    console.log(`[DEBUG] Updating queue stats in Redis for type: ${type || 'all'}`);

    // Get all jobs from the queue
    const allJobs = await searchQueue.getJobs(['waiting', 'active']);
    console.log(`[DEBUG] Total jobs retrieved from queue: ${allJobs.length}`);

    // Filter jobs by type if requested
    const filteredJobs = type 
      ? allJobs.filter(job => job.data.type === type)
      : allJobs;
    console.log(`[DEBUG] Filtered jobs for type ${type || 'all'}: ${filteredJobs.length}`);

    // Count jobs by state
    let activeJobs = 0;
    let waitingJobs = 0;
    let completedJobs = 0;
    let failedJobs = 0;
    let delayedJobs = 0;
    let pausedJobs = 0;

    // Get counts directly from Bull queue methods
    try {
      activeJobs = await searchQueue.getActiveCount();
      waitingJobs = await searchQueue.getWaitingCount();
      completedJobs = await searchQueue.getCompletedCount();
      failedJobs = await searchQueue.getFailedCount();
      delayedJobs = await searchQueue.getDelayedCount();
      pausedJobs = await searchQueue.getPausedCount();

      console.log(`[DEBUG] Queue counts from Bull: active=${activeJobs}, waiting=${waitingJobs}, completed=${completedJobs}, failed=${failedJobs}, delayed=${delayedJobs}, paused=${pausedJobs}`);
    } catch (countError) {
      console.error(`[DEBUG] Error getting counts from Bull: ${countError}`);

      // Fallback to manual counting if Bull methods fail
      console.log(`[DEBUG] Falling back to manual job state counting`);

      // Use Promise.all to get all job states in parallel
      const jobStates = await Promise.all(filteredJobs.map(async (job) => {
        const state = await job.getState();
        console.log(`[DEBUG] Job ${job.id} state: ${state}`);
        return state;
      }));

      // Count jobs by state
      jobStates.forEach(state => {
        if (state === 'active') activeJobs++;
        if (state === 'waiting') waitingJobs++;
        if (state === 'completed') completedJobs++;
        if (state === 'failed') failedJobs++;
        if (state === 'delayed') delayedJobs++;
        if (state === 'paused') pausedJobs++;
      });

      console.log(`[DEBUG] Job states distribution: ${JSON.stringify(jobStates.reduce((acc, state) => {
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {}))}`);
    }

    console.log(`[DEBUG] Queue stats for ${type || 'all'}: active=${activeJobs}, waiting=${waitingJobs}`);

    // Get the total processed jobs count
    const totalProcessedJobs = await getTotalProcessedJobs();
    console.log(`[DEBUG] Total processed jobs for queue stats: ${totalProcessedJobs}`);

    const queueStats = {
      activeJobs,
      waitingJobs,
      totalProcessedJobs
    };

    // Create a cache key based on the type parameter
    const cacheKey = type ? `queue-stats:${type}` : 'queue-stats:all';
    console.log(`[DEBUG] Using Redis cache key: ${cacheKey}`);

    // Cache the result for 30 seconds (queue stats change frequently)
    await redis.set(cacheKey, JSON.stringify({ queueStats }), 'EX', 30);
    console.log(`[DEBUG] Stored in Redis: ${JSON.stringify({ queueStats })}`);

    // Verify the data was stored correctly by reading it back
    const storedData = await redis.get(cacheKey);
    if (storedData) {
      console.log(`[DEBUG] Verified data in Redis for key ${cacheKey}: ${storedData}`);
      try {
        const parsedData = JSON.parse(storedData);
        console.log(`[DEBUG] Parsed data from Redis: ${JSON.stringify(parsedData)}`);
        if (parsedData.queueStats) {
          console.log(`[DEBUG] Queue stats from Redis: activeJobs=${parsedData.queueStats.activeJobs}, waitingJobs=${parsedData.queueStats.waitingJobs}`);
        } else {
          console.log(`[DEBUG] No queueStats found in Redis data`);
        }
      } catch (parseError) {
        console.error(`[DEBUG] Error parsing Redis data: ${parseError}`);
      }
    } else {
      console.log(`[DEBUG] No data found in Redis for key ${cacheKey}`);
    }

    // Also update the 'all' stats if we're updating a specific type
    if (type) {
      // Get all jobs again (no filter)
      let allActiveJobs = 0;
      let allWaitingJobs = 0;
      let allCompletedJobs = 0;
      let allFailedJobs = 0;
      let allDelayedJobs = 0;
      let allPausedJobs = 0;

      // Get counts directly from Bull queue methods (for all jobs)
      try {
        allActiveJobs = await searchQueue.getActiveCount();
        allWaitingJobs = await searchQueue.getWaitingCount();
        allCompletedJobs = await searchQueue.getCompletedCount();
        allFailedJobs = await searchQueue.getFailedCount();
        allDelayedJobs = await searchQueue.getDelayedCount();
        allPausedJobs = await searchQueue.getPausedCount();

        console.log(`[DEBUG] All queue counts from Bull: active=${allActiveJobs}, waiting=${allWaitingJobs}, completed=${allCompletedJobs}, failed=${allFailedJobs}, delayed=${allDelayedJobs}, paused=${allPausedJobs}`);
      } catch (countError) {
        console.error(`[DEBUG] Error getting all counts from Bull: ${countError}`);

        // Fallback to manual counting if Bull methods fail
        console.log(`[DEBUG] Falling back to manual job state counting for all jobs`);

        // Use Promise.all to get all job states in parallel
        const allJobStates = await Promise.all(allJobs.map(async (job) => {
          const state = await job.getState();
          console.log(`[DEBUG] All jobs - Job ${job.id} state: ${state}`);
          return state;
        }));

        // Count jobs by state
        allJobStates.forEach(state => {
          if (state === 'active') allActiveJobs++;
          if (state === 'waiting') allWaitingJobs++;
          if (state === 'completed') allCompletedJobs++;
          if (state === 'failed') allFailedJobs++;
          if (state === 'delayed') allDelayedJobs++;
          if (state === 'paused') allPausedJobs++;
        });

        console.log(`[DEBUG] All jobs - Job states distribution: ${JSON.stringify(allJobStates.reduce((acc, state) => {
          acc[state] = (acc[state] || 0) + 1;
          return acc;
        }, {}))}`);
      }

      // Use the same totalProcessedJobs count for all stats
      const allQueueStats = {
        activeJobs: allActiveJobs,
        waitingJobs: allWaitingJobs,
        totalProcessedJobs
      };

      console.log(`[DEBUG] All queue stats: active=${allActiveJobs}, waiting=${allWaitingJobs}`);
      await redis.set('queue-stats:all', JSON.stringify({ queueStats: allQueueStats }), 'EX', 30);
      console.log(`[DEBUG] Stored all stats in Redis: ${JSON.stringify({ queueStats: allQueueStats })}`);

      // Verify the data was stored correctly by reading it back
      const allStoredData = await redis.get('queue-stats:all');
      if (allStoredData) {
        console.log(`[DEBUG] Verified data in Redis for key queue-stats:all: ${allStoredData}`);
        try {
          const allParsedData = JSON.parse(allStoredData);
          console.log(`[DEBUG] Parsed data from Redis: ${JSON.stringify(allParsedData)}`);
          if (allParsedData.queueStats) {
            console.log(`[DEBUG] All queue stats from Redis: activeJobs=${allParsedData.queueStats.activeJobs}, waitingJobs=${allParsedData.queueStats.waitingJobs}`);
          } else {
            console.log(`[DEBUG] No queueStats found in Redis data for all stats`);
          }
        } catch (parseError) {
          console.error(`[DEBUG] Error parsing Redis data for all stats: ${parseError}`);
        }
      } else {
        console.log(`[DEBUG] No data found in Redis for key queue-stats:all`);
      }
    }

    redis.quit();
    return queueStats;
  } catch (error) {
    console.error('Error updating queue statistics in Redis:', error);
    return null;
  }
};

// Function to initialize and increment the total processed jobs counter
const initTotalProcessedJobsCounter = async () => {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Check if the counter exists
    const counterExists = await redis.exists('total-processed-jobs');

    if (!counterExists) {
      console.log('[DEBUG] Initializing total processed jobs counter in Redis');
      // Initialize the counter to 0
      await redis.set('total-processed-jobs', '0');
    } else {
      console.log('[DEBUG] Total processed jobs counter already exists in Redis');
    }

    redis.quit();
  } catch (error) {
    console.error('Error initializing total processed jobs counter:', error);
  }
};

// Function to increment the total processed jobs counter
const incrementTotalProcessedJobs = async () => {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Increment the counter
    const newCount = await redis.incr('total-processed-jobs');
    console.log(`[DEBUG] Incremented total processed jobs counter to ${newCount}`);

    redis.quit();
    return newCount;
  } catch (error) {
    console.error('Error incrementing total processed jobs counter:', error);
    return null;
  }
};

// Function to get the total processed jobs count
const getTotalProcessedJobs = async () => {
  try {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Get the counter value
    const count = await redis.get('total-processed-jobs');
    console.log(`[DEBUG] Retrieved total processed jobs count: ${count}`);

    redis.quit();
    return parseInt(count) || 0;
  } catch (error) {
    console.error('Error getting total processed jobs count:', error);
    return 0;
  }
};

// Initialize the counter when the module is loaded
initTotalProcessedJobsCounter();

// Event handlers for the queue
searchQueue.on('active', async (job) => {
  console.log(`Job ${job.id} has started processing`);
  // Update queue statistics when a job starts processing
  const type = job.data.type;
  await updateQueueStatsInRedis(type);
  await updateQueueStatsInRedis(); // Update all stats
});

searchQueue.on('completed', async (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
  // Increment the total processed jobs counter
  await incrementTotalProcessedJobs();
  // Update queue statistics when a job completes
  const type = job.data.type;
  await updateQueueStatsInRedis(type);
  await updateQueueStatsInRedis(); // Update all stats
});

searchQueue.on('failed', async (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
  // Update queue statistics when a job fails
  const type = job.data.type;
  await updateQueueStatsInRedis(type);
  await updateQueueStatsInRedis(); // Update all stats
});

searchQueue.on('error', (error) => {
  console.error(`Queue error:`, error);
});

// Function to test Redis connection and operations
const testRedisConnection = async () => {
  try {
    console.log('[DEBUG] Testing Redis connection...');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Test setting a value
    const testKey = 'test-redis-connection';
    const testValue = { test: 'value', timestamp: Date.now() };
    console.log(`[DEBUG] Setting test value in Redis: ${JSON.stringify(testValue)}`);
    await redis.set(testKey, JSON.stringify(testValue), 'EX', 60);

    // Test getting the value back
    const storedValue = await redis.get(testKey);
    if (storedValue) {
      console.log(`[DEBUG] Retrieved test value from Redis: ${storedValue}`);
      try {
        const parsedValue = JSON.parse(storedValue);
        console.log(`[DEBUG] Parsed test value: ${JSON.stringify(parsedValue)}`);
        console.log('[DEBUG] Redis connection test successful!');
      } catch (parseError) {
        console.error(`[DEBUG] Error parsing test value: ${parseError}`);
      }
    } else {
      console.log('[DEBUG] No test value retrieved from Redis');
    }

    redis.quit();
  } catch (error) {
    console.error('Error testing Redis connection:', error);
  }
};

// Run the Redis connection test when this module is loaded
testRedisConnection();

module.exports = {
  searchQueue,
  updateQueueStatsInRedis,
  getTotalProcessedJobs,
  incrementTotalProcessedJobs,
  initTotalProcessedJobsCounter
};
