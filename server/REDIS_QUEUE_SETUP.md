# Redis Queue System Setup for BGC-Atlas Search Jobs

This document explains how to set up and use the Redis queue system for processing search jobs in the BGC-Atlas application.

## Overview

The BGC-Atlas application uses Redis and Bull to implement a queueing system for search jobs. This allows the application to handle long-running search operations asynchronously, improving the user experience and system reliability.

## Prerequisites

- Node.js (v14 or higher)
- Redis server (v5 or higher)

## Installation

### 1. Install Redis

#### On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install redis-server
```

#### On macOS (using Homebrew):

```bash
brew install redis
```

#### On Windows:

Download and install Redis from [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)

### 2. Start Redis Server

#### On Ubuntu/Debian:

```bash
sudo systemctl start redis-server
```

#### On macOS:

```bash
brew services start redis
```

#### On Windows:

Start Redis server from the installation directory:

```bash
redis-server.exe
```

### 3. Configure Environment Variables

Create or update the `.env` file in the server directory with the following Redis configuration:

```
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password  # Optional, remove if no password
```

## Architecture

The queueing system consists of the following components:

1. **Redis Server**: Stores the queue data and job information
2. **Bull Queue**: Node.js library that provides the queue functionality
3. **Job Producers**: API endpoints that add jobs to the queue
4. **Job Consumers**: Workers that process jobs from the queue

## Queue Types

The system uses two types of queues:

1. **Sequence Search Queue**: For processing sequence search jobs
2. **BGC Search Queue**: For processing BGC search jobs

## API Endpoints

### Submit Search Jobs

- **POST /api/search/sequence**: Submit a sequence search job
  - Request: `multipart/form-data` with FASTA files
  - Response: Job ID and session ID

- **POST /api/search/bgc**: Submit a BGC search job
  - Request: `multipart/form-data` with GenBank files
  - Response: Job ID and session ID

### Check Job Status

- **GET /api/search/status/:jobId?type=<sequence|bgc>**: Get the status of a specific job
  - Parameters:
    - `jobId`: The ID of the job
    - `type`: The type of search job (`sequence` or `bgc`)
  - Response: Job status, progress, and results (if completed)

- **GET /api/search/session/:sessionId?type=<sequence|bgc>**: Get all jobs for a specific session
  - Parameters:
    - `sessionId`: The ID of the session
    - `type`: The type of search job (`sequence` or `bgc`)
  - Response: List of jobs with their status, progress, and results

## Job States

Jobs can be in one of the following states:

- **waiting**: Job is waiting to be processed
- **active**: Job is currently being processed
- **completed**: Job has been successfully processed
- **failed**: Job processing has failed

## Monitoring

You can monitor the queue using the Bull Dashboard. To set it up:

1. Install the Bull Dashboard package:

```bash
npm install bull-board
```

2. Add the following code to your server's index.js file:

```javascript
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { sequenceSearchQueue, bgcSearchQueue } = require('./queue');

createBullBoard({
  queues: [
    new BullAdapter(sequenceSearchQueue),
    new BullAdapter(bgcSearchQueue)
  ],
  serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());
```

3. Access the dashboard at `http://your-server/admin/queues`

## Troubleshooting

### Redis Connection Issues

If the application cannot connect to Redis:

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

2. Check Redis connection settings in the `.env` file

3. Ensure Redis is listening on the specified port:
   ```bash
   netstat -an | grep 6379
   ```

### Job Processing Issues

If jobs are not being processed:

1. Check the server logs for errors

2. Verify the queue is receiving jobs:
   ```bash
   redis-cli
   > KEYS bull:*
   ```

3. Check the job state:
   ```bash
   GET bull:sequence-search:job-id
   ```

## Scaling

For high-load environments, consider:

1. **Redis Cluster**: Set up a Redis cluster for better performance and reliability
2. **Multiple Workers**: Run multiple instances of the worker processes
3. **Job Concurrency**: Configure Bull to process multiple jobs concurrently

Example configuration for concurrency:

```javascript
sequenceSearchQueue.process(10, async (job) => {
  // Process job
});
```

This will process up to 10 sequence search jobs concurrently.