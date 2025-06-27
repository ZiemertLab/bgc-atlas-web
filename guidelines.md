
# Separating Frontend and Backend Components with Express, Node.js, and Prisma

Based on the project structure, you have a Next.js application that needs to be separated into frontend and backend components, with the backend migrated to Express, Node.js, and Prisma. Here's a step-by-step guide to achieve this:

## Step 1: Project Restructuring

Create a new project structure:

```
bgc-atlas/
├── client/             # Frontend (Next.js)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/             # Backend (Express + Prisma)
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

## Step 2: Set Up the Backend (Express + Prisma)

1. **Initialize the server directory**:
   ```bash
   mkdir -p server/src
   cd server
   npm init -y
   ```

2. **Install necessary dependencies**:
   ```bash
   npm install express cors dotenv prisma @prisma/client
   npm install --save-dev typescript ts-node @types/express @types/node @types/cors nodemon
   ```

3. **Set up TypeScript configuration**:
   Create a `tsconfig.json` file in the server directory:
   ```json
   {
     "compilerOptions": {
       "target": "es2016",
       "module": "commonjs",
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true,
       "strict": true,
       "skipLibCheck": true,
       "outDir": "./dist"
     },
     "include": ["src/**/*"]
   }
   ```

4. **Initialize Prisma**:
   ```bash
   npx prisma init
   ```

5. **Configure Prisma schema**:
   Convert your PostgreSQL schema to Prisma schema in `prisma/schema.prisma`:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model Study {
     id                 String   @id
     accession          String
     bioproject         String?
     secondaryAccession String?
     centreName         String?
     isPrivate          Boolean?
     samplesCount       Int?
     studyName          String?
     studyAbstract      String?
     dataOrigination    String?
     publicReleaseDate  DateTime?
     lastUpdate         DateTime?
     samples            Sample[]

     @@map("studies")
   }

   model Sample {
     id                String   @id
     accession         String
     biosample         String?
     sampleName        String?
     sampleAlias       String?
     sampleDesc        String?
     collectionDate    DateTime?
     analysisCompleted DateTime?
     lastUpdate        DateTime?
     latitude          Float?
     longitude         Float?
     geoLocName        String?
     environmentBiome  String?
     environmentFeature String?
     environmentMaterial String?
     hostTaxId         Int?
     species           String?
     study             Study    @relation(fields: [studyId], references: [id])
     studyId           String
     runs              Run[]

     @@map("samples")
   }

   model Run {
     id                 String   @id
     accession          String
     secondaryAccession String?
     // Add other fields from your schema
     sample             Sample   @relation(fields: [sampleId], references: [id])
     sampleId           String

     @@map("runs")
   }

   // Add other models based on your SQL schema
   ```

6. **Create environment file**:
   Create a `.env` file in the server directory:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/atlas_v2025"
   PORT=3001
   ```

7. **Create Express server**:
   Create `src/index.ts`:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';
   import { PrismaClient } from '@prisma/client';

   dotenv.config();

   const app = express();
   const prisma = new PrismaClient();
   const port = process.env.PORT || 3001;

   app.use(cors());
   app.use(express.json());

   // Health check endpoint
   app.get('/api/health', (req, res) => {
     res.json({ status: 'ok' });
   });

   // API routes
   app.use('/api', require('./routes'));

   app.listen(port, () => {
     console.log(`Server running on port ${port}`);
   });

   process.on('beforeExit', async () => {
     await prisma.$disconnect();
   });
   ```

8. **Create API routes**:
   Create `src/routes/index.ts`:
   ```typescript
   import express from 'express';
   import studiesRouter from './studies';
   import samplesRouter from './samples';
   import runsRouter from './runs';

   const router = express.Router();

   router.use('/studies', studiesRouter);
   router.use('/samples', samplesRouter);
   router.use('/runs', runsRouter);

   export default router;
   ```

9. **Create route handlers**:
   Create `src/routes/studies.ts`:
   ```typescript
   import express from 'express';
   import { PrismaClient } from '@prisma/client';

   const router = express.Router();
   const prisma = new PrismaClient();

   // Get all studies
   router.get('/', async (req, res) => {
     try {
       const studies = await prisma.study.findMany({
         take: 100, // Limit results
       });
       res.json(studies);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch studies' });
     }
   });

   // Get study by ID
   router.get('/:id', async (req, res) => {
     try {
       const study = await prisma.study.findUnique({
         where: { id: req.params.id },
         include: { samples: true },
       });
       
       if (!study) {
         return res.status(404).json({ error: 'Study not found' });
       }
       
       res.json(study);
     } catch (error) {
       res.status(500).json({ error: 'Failed to fetch study' });
     }
   });

   export default router;
   ```

   Create similar files for samples and runs.

10. **Update package.json scripts**:
    ```json
    "scripts": {
      "build": "tsc",
      "start": "node dist/index.js",
      "dev": "nodemon --exec ts-node src/index.ts",
      "prisma:generate": "prisma generate",
      "prisma:migrate": "prisma migrate dev"
    }
    ```

## Step 3: Migrate the Frontend (Next.js)

1. **Copy existing Next.js files to the client directory**:
   ```bash
   mkdir -p client
   cp -r src client/
   cp -r public client/ (if exists)
   cp package.json client/
   cp next.config.ts client/
   cp tsconfig.json client/
   ```

2. **Update client's package.json**:
   Remove backend-related dependencies and add:
   ```json
   "dependencies": {
     "axios": "^1.6.0"
   }
   ```

3. **Create API service**:
   Create `client/src/lib/api.ts`:
   ```typescript
   import axios from 'axios';

   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

   const api = axios.create({
     baseURL: API_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   export const fetchStudies = async () => {
     const response = await api.get('/studies');
     return response.data;
   };

   export const fetchStudyById = async (id: string) => {
     const response = await api.get(`/studies/${id}`);
     return response.data;
   };

   export const fetchSamples = async () => {
     const response = await api.get('/samples');
     return response.data;
   };

   // Add more API functions as needed

   export default api;
   ```

4. **Update environment variables**:
   Create `.env.local` in the client directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

5. **Update frontend components to use the API**:
   For example, update `client/src/app/browse/components/browse-client.tsx`:
   ```typescript
   "use client";
   import { useState, useEffect } from "react";
   import { fetchStudies, fetchSamples } from "@/lib/api";
   // ... rest of the imports

   export function BrowseClient() {
     const [sliderValue, setSliderValue] = useState([5000, 25000]);
     const [studies, setStudies] = useState([]);
     const [samples, setSamples] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const loadData = async () => {
         try {
           setLoading(true);
           const studiesData = await fetchStudies();
           setStudies(studiesData);
           
           const samplesData = await fetchSamples();
           setSamples(samplesData);
         } catch (error) {
           console.error("Failed to fetch data:", error);
         } finally {
           setLoading(false);
         }
       };

       loadData();
     }, []);

     // ... rest of the component
   }
   ```

6. **Update client's package.json scripts**:
   ```json
   "scripts": {
     "dev": "next dev -p 3000",
     "build": "next build",
     "start": "next start -p 3000",
     "lint": "next lint"
   }
   ```

## Step 4: Set Up Database Migration

1. **Generate Prisma migration**:
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

2. **Seed the database** (optional):
   Create `server/prisma/seed.ts` to populate initial data.

## Step 5: Docker Setup (Optional)

Create a `docker-compose.yml` file in the root directory:

```yaml
version: '3'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: atlas_v2025
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/atlas_v2025
      PORT: 3001

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - server
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api

volumes:
  postgres_data:
```

## Step 6: Running the Application

1. **Start the backend**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd client
   npm run dev
   ```

## Best Practices and Guidelines

1. **API Design**:
    - Use RESTful conventions
    - Implement proper error handling
    - Add pagination for large datasets
    - Consider adding authentication/authorization

2. **Code Organization**:
    - Use the repository pattern for database access
    - Separate business logic from route handlers
    - Create middleware for common functionality

3. **Performance**:
    - Add caching for frequently accessed data
    - Optimize database queries
    - Use connection pooling

4. **Security**:
    - Validate and sanitize all inputs
    - Implement rate limiting
    - Use HTTPS in production
    - Set proper CORS policies

5. **Testing**:
    - Write unit tests for API endpoints
    - Create integration tests for database operations
    - Set up end-to-end tests for critical flows

By following these steps, you'll have a clean separation between your frontend and backend, with the backend using Express, Node.js, and Prisma for database operations. This architecture will be more maintainable and scalable for your BGC-Atlas application.