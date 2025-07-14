# SceneryAddons Database - UI Specification Document

## Table of Contents
1. [Overview](#overview)
2. [Design System](#design-system)
3. [Layout Architecture](#layout-architecture)
4. [Page Specifications](#page-specifications)
5. [Component Library](#component-library)
6. [Responsive Design](#responsive-design)
7. [API Integration](#api-integration)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Implementation Guidelines](#implementation-guidelines)

## Overview

This document serves as the comprehensive specification for the SceneryAddons Database frontend implementation. The application is a modern React-based dashboard for managing Microsoft Flight Simulator scenery addons with real-time data visualization, search capabilities, and download management.

### Key Requirements
- **Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS 4.0
- **Architecture**: Single Page Application (SPA) with client-side routing
- **API Integration**: RESTful API with real-time updates via SignalR
- **Responsive Design**: Mobile-first approach supporting all device sizes
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Fast loading, smooth animations, optimized for large datasets

### Design Philosophy
- **Professional**: Clean, modern interface suitable for technical users
- **Functional**: Data-dense layouts with efficient information hierarchy
- **Consistent**: Unified design language across all components
- **Accessible**: Inclusive design for all users and devices

## Design System

### Color Palette

#### Primary Colors
```css
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6  /* Main brand color */
--primary-600: #2563eb  /* Hover states */
--primary-700: #1d4ed8  /* Active states */
--primary-900: #1e3a8a  /* Text on light backgrounds */
```

#### Semantic Colors
```css
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

--info-50: #f0f9ff
--info-500: #06b6d4
--info-600: #0891b2
```

#### Neutral Colors
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Typography

#### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Type Scale
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
```

#### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing System

#### Base Unit: 4px (0.25rem)
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */
```

### Border Radius
```css
--radius-sm: 0.375rem   /* 6px */
--radius-md: 0.5rem     /* 8px */
--radius-lg: 0.75rem    /* 12px */
--radius-xl: 1rem       /* 16px */
--radius-2xl: 1.5rem    /* 24px */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

## Layout Architecture

### Grid System
- **Container**: Max-width with responsive breakpoints
- **Sidebar**: Fixed width 280px (desktop), collapsible (mobile/tablet)
- **Main Content**: Fluid width with proper padding and margins
- **Header**: Fixed height 64px with consistent spacing

### Breakpoints
```css
--breakpoint-sm: 640px   /* Mobile landscape */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
--breakpoint-2xl: 1536px /* Extra large */
```

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ Header (64px height)                                    │
├─────────────┬───────────────────────────────────────────┤
│ Sidebar     │ Main Content Area                         │
│ (280px)     │ ┌─────────────────────────────────────┐   │
│             │ │ Page Header                         │   │
│ Navigation  │ ├─────────────────────────────────────┤   │
│ Menu        │ │ Content Area                        │   │
│             │ │ (Cards, Tables, Forms, etc.)        │   │
│             │ │                                     │   │
│             │ └─────────────────────────────────────┘   │
└─────────────┴───────────────────────────────────────────┘
```

### Critical Alignment Requirements
1. **Sidebar Navigation Items** must align perfectly with **Main Content Headers**
2. **Consistent left padding** across all content areas (24px)
3. **Vertical rhythm** maintained throughout the application
4. **Header height consistency** across all pages and components
5. **Responsive behavior** that maintains alignment at all breakpoints

## Page Specifications

### 1. Dashboard Page (`/`)

#### Purpose
Central hub displaying system overview, key metrics, and quick actions.

#### Layout Components
- **Hero Section**: Welcome message and system status
- **Metrics Grid**: 4-column responsive grid of key statistics
- **Quick Actions**: Grid of action buttons for common tasks
- **Recent Activity**: List of latest addon additions
- **System Health**: Real-time status indicators

#### Key Features
- Real-time data updates every 30 seconds
- Interactive metric cards with hover effects
- Quick navigation to other sections
- System health monitoring
- Recent activity feed

#### Data Requirements
- Total addon count
- Recent additions (7 days)
- Compatibility breakdown
- System health status
- Latest 5 addons added

### 2. Addons Browser Page (`/addons`)

#### Purpose
Comprehensive interface for browsing, searching, and managing scenery addons.

#### Layout Components
- **Search Header**: Search input with filters toggle
- **Filter Sidebar**: Collapsible filter panel
- **Results Grid**: Responsive grid of addon cards
- **Pagination**: Bottom pagination controls
- **Bulk Actions**: Selection and batch operations

#### Key Features
- **Advanced Search**: Text search across name, description, filename
- **Filtering**: By compatibility, date range, file size
- **Sorting**: Multiple sort options (date, name, size, compatibility)
- **Bulk Selection**: Multi-select with batch download
- **Pagination**: Efficient loading of large datasets
- **Real-time Updates**: Live data refresh

#### Search & Filter Specifications
```typescript
interface SearchFilters {
  query: string;
  compatibility: 'all' | 'MSFS 2020' | 'MSFS 2024' | 'MSFS 2020/2024';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sortBy: 'dateAdded' | 'name' | 'fileSize' | 'compatibility';
  sortOrder: 'asc' | 'desc';
  pageSize: 20 | 50 | 100;
}
```

#### Addon Card Specifications
- **Thumbnail**: Placeholder or preview image
- **Title**: Addon name with truncation
- **Compatibility Badge**: Color-coded compatibility indicator
- **Description**: Truncated description with expand option
- **Metadata**: File size, date added, filename
- **Actions**: Download button, info button, select checkbox

### 3. Downloads Manager Page (`/downloads`)

#### Purpose
Monitor and manage addon download sessions and progress.

#### Layout Components
- **Statistics Header**: Download metrics and status
- **Active Downloads**: Real-time progress tracking
- **Download History**: Completed and failed downloads
- **Session Management**: Pause, resume, cancel operations

#### Key Features
- **Real-time Progress**: Live download progress updates
- **Session Control**: Pause, resume, cancel downloads
- **Batch Downloads**: Multiple addon download sessions
- **Download History**: Complete download audit trail
- **Error Handling**: Failed download retry mechanisms

#### Progress Tracking
- Individual file progress bars
- Overall session progress
- Download speed indicators
- ETA calculations
- Error status reporting

### 4. System Status Page (`/system/status`)

#### Purpose
Comprehensive system monitoring and health dashboard.

#### Layout Components
- **Health Overview**: System status cards
- **API Monitoring**: Endpoint health and response times
- **Database Stats**: Connection status and performance metrics
- **Resource Usage**: Memory, CPU, disk usage
- **Logs Viewer**: Recent system logs and errors

#### Key Features
- **Real-time Monitoring**: Live system health updates
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: System errors and warnings
- **Resource Monitoring**: System resource utilization
- **Diagnostic Tools**: Health check utilities

## Component Library

### Navigation Components

#### Sidebar Navigation
```typescript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: string | number;
}
```

**Specifications:**
- Fixed width: 280px (desktop)
- Collapsible on mobile/tablet
- Active state highlighting
- Icon + text layout
- Badge support for notifications
- Smooth animations for state changes

#### Header Component
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

**Specifications:**
- Fixed height: 64px
- Responsive title sizing
- Action buttons alignment
- Breadcrumb navigation
- Mobile hamburger menu

### Data Display Components

#### Metric Card
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  loading?: boolean;
}
```

**Specifications:**
- Gradient backgrounds
- Icon integration
- Loading states
- Hover animations
- Responsive sizing

#### Data Table
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  pagination?: PaginationConfig;
  selection?: SelectionConfig<T>;
  loading?: boolean;
  error?: string;
}
```

**Specifications:**
- Sortable columns
- Row selection
- Pagination integration
- Loading skeletons
- Error states
- Responsive behavior

### Form Components

#### Search Input
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  loading?: boolean;
  suggestions?: string[];
}
```

**Specifications:**
- Icon integration
- Loading states
- Autocomplete support
- Keyboard navigation
- Clear button

#### Filter Panel
```typescript
interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}
```

**Specifications:**
- Collapsible design
- Multiple filter types
- Reset functionality
- Applied filters display
- Mobile-friendly

### Feedback Components

#### Loading States
- **Skeleton Loaders**: For content placeholders
- **Spinner**: For action feedback
- **Progress Bars**: For file operations
- **Shimmer Effects**: For card loading

#### Error States
- **Error Boundaries**: For component errors
- **Error Messages**: For form validation
- **Empty States**: For no data scenarios
- **Network Errors**: For API failures

## Responsive Design

### Mobile (320px - 767px)
- **Sidebar**: Overlay with backdrop
- **Navigation**: Hamburger menu
- **Cards**: Single column layout
- **Tables**: Horizontal scroll or card view
- **Forms**: Full-width inputs
- **Typography**: Smaller scale

### Tablet (768px - 1023px)
- **Sidebar**: Collapsible with toggle
- **Cards**: 2-column grid
- **Tables**: Responsive columns
- **Forms**: Optimized spacing
- **Touch Targets**: 44px minimum

### Desktop (1024px+)
- **Sidebar**: Fixed visible sidebar
- **Cards**: 3-4 column grid
- **Tables**: Full feature set
- **Forms**: Multi-column layouts
- **Hover States**: Full interaction

## API Integration

### Data Fetching Strategy
- **React Query**: For server state management
- **Optimistic Updates**: For better UX
- **Background Refetch**: For real-time data
- **Error Retry**: Automatic retry logic
- **Cache Management**: Intelligent caching

### Real-time Updates
- **SignalR Integration**: For live updates
- **Connection Management**: Auto-reconnection
- **Event Handling**: Typed event system
- **Fallback Polling**: When WebSocket fails

### API Endpoints
```typescript
interface ApiClient {
  // Addons
  getAddons(params: SearchParams): Promise<PaginatedResponse<Addon>>;
  getAddon(id: string): Promise<Addon>;
  downloadAddon(id: string): Promise<DownloadSession>;
  
  // Downloads
  getDownloadSessions(): Promise<DownloadSession[]>;
  getDownloadStats(): Promise<DownloadStats>;
  pauseDownload(sessionId: string): Promise<void>;
  cancelDownload(sessionId: string): Promise<void>;
  
  // System
  getHealth(): Promise<HealthStatus>;
  getStatusReport(): Promise<SystemStatus>;
}
```

## Accessibility Guidelines

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 ratio
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Focus Management**: Visible focus indicators
- **Alternative Text**: For all images

### Implementation Requirements
- **Semantic HTML**: Proper element usage
- **ARIA Attributes**: For complex components
- **Keyboard Shortcuts**: For power users
- **High Contrast Mode**: Support for accessibility tools
- **Reduced Motion**: Respect user preferences

## Implementation Guidelines

### Technology Stack
```json
{
  "framework": "React 18",
  "language": "TypeScript",
  "bundler": "Vite",
  "styling": "Tailwind CSS 4.0",
  "routing": "React Router v6",
  "state": "React Query + Zustand",
  "forms": "React Hook Form",
  "icons": "Lucide React",
  "animations": "Framer Motion"
}
```

### Code Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── stores/             # State management
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### Performance Optimization
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP format, lazy loading
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Aggressive caching for static assets

### Testing Strategy
- **Unit Tests**: Component testing with Jest/Vitest
- **Integration Tests**: API integration testing
- **E2E Tests**: Critical user flows with Playwright
- **Accessibility Tests**: Automated a11y testing
- **Visual Regression**: Screenshot comparison testing

### Development Workflow
1. **Design Review**: Figma/design system alignment
2. **Component Development**: Isolated component building
3. **Integration**: Page-level integration
4. **Testing**: Comprehensive test coverage
5. **Review**: Code review and QA
6. **Deployment**: Automated CI/CD pipeline

## Critical Alignment Solutions

### Sidebar Navigation Alignment Issues - Root Cause Analysis

The previous implementation suffered from alignment issues between sidebar navigation items and main content headers. This section provides definitive solutions to prevent these issues.

#### Problem Identification
1. **Inconsistent Padding**: Different padding values between sidebar and main content
2. **Layout Shifts**: Dynamic content causing layout recalculation
3. **Responsive Breakpoints**: Misaligned elements at different screen sizes
4. **CSS Grid/Flexbox Conflicts**: Competing layout systems
5. **Z-index Stacking**: Overlapping elements affecting visual alignment

#### Definitive Solution Architecture

##### 1. Unified Spacing System
```css
/* Root CSS Variables for Consistent Spacing */
:root {
  --sidebar-width: 280px;
  --header-height: 64px;
  --content-padding: 24px;
  --nav-item-height: 48px;
  --nav-item-padding: 12px 16px;
}
```

##### 2. Layout Container Structure
```tsx
// Recommended Layout Structure
<div className="min-h-screen bg-gray-50">
  {/* Sidebar - Fixed Position */}
  <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-gray-200 z-30">
    <div className="flex flex-col h-full">
      {/* Logo/Brand - Exact height match with header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Logo />
      </div>

      {/* Navigation - Consistent padding */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map(item => (
          <NavigationItem
            key={item.id}
            className="flex items-center h-12 px-3 rounded-lg"
            {...item}
          />
        ))}
      </nav>
    </div>
  </aside>

  {/* Main Content Area */}
  <div className="pl-[280px]">
    {/* Header - Fixed height, consistent padding */}
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200">
      <div className="flex items-center h-full px-6">
        <PageTitle />
      </div>
    </header>

    {/* Page Content - Consistent padding */}
    <main className="p-6">
      <PageContent />
    </main>
  </div>
</div>
```

##### 3. Navigation Item Alignment
```tsx
// Navigation Item Component with Perfect Alignment
interface NavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  href: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ icon: Icon, label, isActive, href }) => (
  <Link
    to={href}
    className={cn(
      // Base styles - CRITICAL: Exact height and padding
      "flex items-center h-12 px-3 rounded-lg transition-colors",
      // Typography - CRITICAL: Consistent font sizing
      "text-sm font-medium",
      // States
      isActive
        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
        : "text-gray-700 hover:bg-gray-100"
    )}
  >
    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
    <span className="truncate">{label}</span>
  </Link>
);
```

##### 4. Page Header Alignment
```tsx
// Page Header Component with Guaranteed Alignment
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="flex items-center justify-between mb-8">
    <div>
      {/* CRITICAL: Exact font sizing to match navigation */}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && (
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      )}
    </div>
    {actions && (
      <div className="flex items-center space-x-3">
        {actions}
      </div>
    )}
  </div>
);
```

##### 5. Responsive Behavior
```tsx
// Mobile-First Responsive Implementation
const Layout: React.FC = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        // Mobile: Slide-in overlay
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: Static sidebar
        "lg:static lg:z-30"
      )}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[280px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

### Reference Implementation Templates

#### Recommended Template: Tailwind UI Dashboard
Base the implementation on Tailwind UI's "Stacked Layout" pattern:
- **URL**: https://tailwindui.com/components/application-ui/application-shells/stacked
- **Key Features**: Fixed sidebar, consistent spacing, perfect alignment
- **Adaptation**: Customize colors and components while maintaining structure

#### Alternative Template: Headless UI Examples
Reference Headless UI's dashboard examples for component patterns:
- **URL**: https://headlessui.com/react/disclosure
- **Key Features**: Accessible navigation, responsive behavior
- **Adaptation**: Use for mobile navigation and disclosure patterns

### Implementation Checklist

#### Pre-Development
- [ ] Review this specification document completely
- [ ] Set up design tokens in CSS variables
- [ ] Create base layout components first
- [ ] Establish spacing constants

#### During Development
- [ ] Test alignment at every breakpoint
- [ ] Verify navigation item heights match content headers
- [ ] Ensure consistent padding across all pages
- [ ] Test with different content lengths
- [ ] Validate responsive behavior

#### Post-Development
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Device testing (Mobile, Tablet, Desktop)
- [ ] Accessibility audit with screen readers
- [ ] Performance testing with large datasets
- [ ] Visual regression testing

### Common Pitfalls to Avoid

1. **Dynamic Heights**: Never use auto heights for navigation items
2. **Inconsistent Padding**: Always use design tokens for spacing
3. **CSS Conflicts**: Avoid mixing CSS Grid and Flexbox inappropriately
4. **Z-index Wars**: Establish clear z-index hierarchy
5. **Responsive Assumptions**: Test all breakpoints thoroughly
6. **Content Overflow**: Plan for long text and dynamic content
7. **Animation Conflicts**: Ensure animations don't affect layout
8. **Browser Differences**: Test cross-browser compatibility

---

*This specification document serves as the definitive guide for implementing the SceneryAddons Database frontend. All implementation decisions should reference this document to ensure consistency and quality. The alignment solutions provided here are based on industry best practices and proven patterns from established design systems.*
