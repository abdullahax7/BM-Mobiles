# Mobile Repair Shop - Inventory Management System

A comprehensive inventory management system built specifically for mobile repair shops. Features include hierarchical device categorization, real-time search with Elasticsearch, stock management with transaction tracking, and analytics dashboard.

## Features

- **Hierarchical Device Organization**: Platform → Brand → Family → Model structure
- **Parts Management**: Track parts with many-to-many relationships to device models
- **Real-time Search**: Elasticsearch-powered search with filters and autocomplete
- **Stock Management**: IN/OUT/ADJUST transactions prevent negative inventory
- **Analytics Dashboard**: Low stock alerts, transaction history, and inventory insights
- **Saved Filters**: Quick access to commonly used filter combinations
- **Responsive Design**: Mobile-first design with shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), easily configurable for PostgreSQL/MySQL
- **Search**: Elasticsearch with fallback to database queries
- **Development**: Docker Compose for services, ESLint for code quality

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for Elasticsearch)

### Installation

1. **Install dependencies and setup database:**
   ```bash
   npm run setup
   ```

2. **Start Elasticsearch (optional but recommended):**
   ```bash
   npm run docker:up
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Visit the application:**
   Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Database Scripts
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Populate database with sample data
- `npm run db:reset` - Reset database and reseed
- `npm run setup` - Complete setup (install, generate, push, seed)

### Docker Scripts
- `npm run docker:up` - Start Elasticsearch and Kibana
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker service logs

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Application Structure

### Pages and Features

- **Dashboard** (`/`) - Overview with stats, low stock alerts, recent transactions
- **Parts** (`/parts`) - Complete CRUD for parts with search and filters
- **Transactions** (`/transactions`) - Stock management (IN/OUT/ADJUST) with history
- **Hierarchy** (`/hierarchy`) - Manage Platform → Brand → Family → Model structure
- **Search** (`/search`) - Advanced search with Elasticsearch integration and shortcuts
- **Analytics** (`/analytics`) - Inventory reports, profit analysis, transaction trends

### Database Schema

The application uses a hierarchical structure for organizing mobile devices:

```
Platform (Android, iOS)
└── Brand (Samsung, Apple, LG)
    └── Family (Galaxy S, iPhone, G Series)
        └── Model (Galaxy S21, iPhone 13, G8)
            └── Parts (many-to-many relationship)
```

**Key Models:**
- **Platform**: Top-level categories (Android, iOS)
- **Brand**: Device manufacturers (Samsung, Apple, LG) 
- **Family**: Product lines (Galaxy S, iPhone, Pixel)
- **Model**: Specific device models (Galaxy S21, iPhone 13 Pro)
- **Part**: Replacement parts with cost, price, and stock tracking
- **Transaction**: Stock movements (IN/OUT/ADJUST) with audit trail
- **PartModel**: Many-to-many relationship between parts and models
- **Shortcut**: Saved filter combinations for quick access

### Transaction System

The transaction system prevents negative stock and maintains audit trails:

- **IN**: Add stock (purchases, returns)
- **OUT**: Remove stock (sales, repairs) 
- **ADJUST**: Stock corrections (damage, counting errors)

All transactions update stock levels atomically and cannot reduce stock below zero.

### Search & Elasticsearch

**Elasticsearch Features:**
- Full-text search across part names, descriptions, SKUs
- Filters by platform, brand, family, model, stock level, price range
- Denormalized data with pre-computed compatibility strings
- Automatic fallback to database when Elasticsearch is unavailable

**Indexing Commands:**
```bash
npm run es:reindex        # Reindex all parts
npm run docker:up         # Start Elasticsearch
curl -X POST http://localhost:3010/api/elasticsearch/reindex
```

## Environment Variables

The `.env` file is already configured for development:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Elasticsearch (optional but recommended)
ELASTICSEARCH_URL="http://localhost:9200"

# Application
NEXT_PUBLIC_APP_NAME="Mobile Repair Shop" 
NEXT_PUBLIC_APP_DESCRIPTION="Inventory management system"
NODE_ENV="development"
```

## API Endpoints

### Parts Management
- `GET /api/parts` - List parts with search/filtering
- `POST /api/parts` - Create new part
- `GET /api/parts/[id]` - Get part details
- `PUT /api/parts/[id]` - Update part
- `DELETE /api/parts/[id]` - Delete part

### Transactions
- `GET /api/transactions` - List transactions with filtering
- `POST /api/transactions` - Create new transaction (with stock validation)

### Hierarchy Management
- `GET/POST /api/hierarchy/platforms` - Manage platforms
- `GET/POST /api/hierarchy/brands` - Manage brands  
- `POST /api/hierarchy/families` - Create families
- `POST /api/hierarchy/models` - Create models

### Search
- `GET /api/search` - Advanced search with Elasticsearch fallback

### Elasticsearch
- `GET/POST /api/elasticsearch/reindex` - Trigger full reindex

## Development Workflow

### Setup for New Developers
```bash
git clone <repository>
cd mobile-repair-shop
npm run setup                # Install, generate, migrate, seed
npm run docker:up           # Start Elasticsearch (optional)
npm run es:reindex          # Index parts for search (optional)
npm run dev                 # Start development server
```

### Working with the Database
```bash
npm run db:generate         # Generate Prisma client after schema changes
npm run db:push            # Push schema changes to database  
npm run db:seed            # Add sample data
npm run db:reset           # Reset database and reseed
```

### Working with Elasticsearch
```bash
npm run docker:up          # Start Elasticsearch + Kibana
npm run docker:down        # Stop services
npm run docker:logs        # View service logs
npm run es:reindex         # Reindex all parts
```

### Adding UI Components
```bash
npx shadcn@latest add [component-name]
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run build              # Build for production
```

## Production Deployment

### Database Migration
For production, consider PostgreSQL:
1. Update `DATABASE_URL` in `.env`
2. Change provider in `prisma/schema.prisma` to `postgresql`
3. Run `npm run db:push`
4. Run `npm run db:seed`

### Elasticsearch Production
1. Configure production Elasticsearch cluster
2. Update `ELASTICSEARCH_URL`
3. Run `npm run es:reindex` for initial indexing
4. Set up automated reindexing triggers

### Performance Optimizations
- Enable database connection pooling
- Configure Elasticsearch cluster appropriately  
- Use Redis for session storage if needed
- Set up proper logging and monitoring

## Troubleshooting

### Common Issues
- **Port conflicts**: Server runs on port 3010 by default
- **Elasticsearch connection**: Check Docker containers with `docker ps`
- **Database locks**: Restart development server
- **Search not working**: Verify Elasticsearch status or use database fallback

### Logs and Debugging
- Application logs in console during development
- Elasticsearch logs: `npm run docker:logs elasticsearch`
- Database queries visible with Prisma debug mode
# 233
