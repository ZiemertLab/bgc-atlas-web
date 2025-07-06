const Queue = require('bull');
const path = require('path');
const fs = require('fs');

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

// Event handlers for the queue
searchQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

searchQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

searchQueue.on('error', (error) => {
  console.error(`Queue error:`, error);
});

module.exports = {
  searchQueue
};
