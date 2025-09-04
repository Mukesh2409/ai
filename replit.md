# AI Collaborative Editor

## Overview

This is an AI-powered collaborative text editor built with React and Express. The application provides intelligent writing assistance through AI-powered text editing, a conversational chat interface, and real-time document management. Users can select text to receive contextual editing suggestions, interact with an AI assistant for writing help, and collaborate on documents with rich text editing capabilities powered by TipTap.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses React with TypeScript and Vite as the build tool. The UI is built with shadcn/ui components and Radix UI primitives, providing a modern, accessible interface. TailwindCSS handles styling with a dark theme configuration and custom design tokens. The application uses Wouter for client-side routing and TanStack Query for server state management and caching.

The editor is built on TipTap, a headless rich text editor that supports tables, formatting, and extensible functionality. A floating toolbar appears when users select text, offering AI-powered editing options like shortening, expanding, grammar correction, and custom prompts.

State management follows a component-based approach with React hooks. Custom hooks handle AI interactions (`useAIEdit`, `useChat`), text selection (`useTextSelection`), and UI state. The application maintains real-time synchronization between the editor and server through optimistic updates and query invalidation.

### Backend Architecture
The server is built with Express.js and follows a REST API pattern. Routes are organized in a single file (`server/routes.ts`) handling document operations and AI interactions. The server uses a simple in-memory storage abstraction (`IStorage` interface) implemented by `MemStorage` for development, allowing easy switching to database implementations.

The backend includes middleware for request logging, JSON parsing, and error handling. Development mode integrates Vite's dev server for hot module replacement and asset serving.

### Data Storage
The application uses Drizzle ORM configured for PostgreSQL with schema definitions in `shared/schema.ts`. Three main entities are defined: users, documents, and chat messages. Documents store content as JSON (TipTap document structure) and support versioning through timestamps.

Currently implemented with in-memory storage for development, the architecture supports easy migration to PostgreSQL through the storage interface abstraction. Database migrations are handled through Drizzle Kit with configuration pointing to a PostgreSQL connection.

### AI Integration
AI functionality is abstracted through a client interface (`mistralClient.ts`) that handles text editing requests, chat interactions, and potentially web search. The system supports multiple editing operations (shorten, expand, grammar correction, table creation, custom prompts) with structured responses including reasoning and suggestions.

Chat functionality allows users to interact with an AI assistant for writing help, with messages stored and displayed in a sidebar interface. The AI integration is designed to be provider-agnostic, allowing easy switching between different AI services.

## External Dependencies

### Core Framework Dependencies
- **React 18** with TypeScript for the frontend framework
- **Express.js** for the backend server
- **Vite** for build tooling and development server
- **Node.js** runtime with ES modules

### UI and Styling
- **shadcn/ui** component library built on Radix UI primitives
- **TailwindCSS** for utility-first styling with custom design tokens
- **Lucide React** for consistent iconography
- **TipTap** headless rich text editor with table support

### Data Management
- **TanStack Query** (React Query) for server state management and caching
- **Drizzle ORM** for database operations and schema management
- **Neon Database** (@neondatabase/serverless) as the PostgreSQL provider
- **Zod** for schema validation and type safety

### Development and Build
- **TypeScript** for static typing across the full stack
- **ESBuild** for production server bundling
- **PostCSS** with Autoprefixer for CSS processing
- **Replit** specific plugins for development environment integration

### Additional Libraries
- **React Hook Form** with Zod resolvers for form management
- **date-fns** for date manipulation and formatting
- **wouter** for lightweight client-side routing
- **class-variance-authority** and **clsx** for conditional styling utilities