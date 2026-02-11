# LDPS - Local Delivery Partner Service

## Overview

LDPS (Local Delivery Partner Service) is an on-demand local delivery mobile application built with React Native and Expo. The app connects users with delivery partners, similar to Uber/Porter, featuring real-time order tracking, location-based pickup/drop selection, and a professional, trustworthy interface. The project uses a monorepo structure with a shared schema between client and server.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **State Management**: React Context for auth, TanStack Query for server state
- **Styling**: StyleSheet API with a custom theme system supporting light/dark modes
- **Animations**: React Native Reanimated for smooth, performant animations
- **Storage**: AsyncStorage for local persistence (user data, orders, auth state)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Pattern**: RESTful routes prefixed with `/api`
- **Storage**: In-memory storage implementation with interface for easy database swap

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Shared between client and server in `/shared/schema.ts`
- **Validation**: Zod schemas generated from Drizzle using drizzle-zod
- **Migrations**: Managed via drizzle-kit with migrations in `/migrations`

### Project Structure
```
├── client/           # React Native app code
│   ├── components/   # Reusable UI components
│   ├── screens/      # Screen components
│   ├── navigation/   # Navigation configuration
│   ├── context/      # React Context providers
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities (storage, API client)
│   └── constants/    # Theme and constants
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   └── storage.ts    # Data storage interface
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle schema definitions
└── scripts/          # Build scripts
```

### Key Design Patterns
- **Path Aliasing**: `@/` maps to `./client`, `@shared/` maps to `./shared`
- **Theming**: Centralized theme in `constants/theme.ts` with LDPS brand colors
- **Error Handling**: ErrorBoundary component with fallback UI
- **Platform Compatibility**: Platform-specific implementations (web vs native) where needed

## External Dependencies

### Core Services
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Expo Services**: Build, development, and OTA updates

### Key Packages
- **expo-haptics**: Tactile feedback for user interactions
- **react-native-maps**: Map display for location selection
- **expo-linear-gradient**: Gradient backgrounds for UI elements
- **expo-blur/expo-glass-effect**: iOS-style blur effects

### Development Environment
- **Replit Integration**: Configured for Replit deployment with CORS handling for Replit domains
- **Environment Variables**: 
  - `DATABASE_URL`: PostgreSQL connection string
  - `EXPO_PUBLIC_DOMAIN`: API domain for client requests
  - `REPLIT_DEV_DOMAIN`: Development domain for CORS