# Service Request Ticketing System

## Overview

A modern, feature-rich ticketing system web application built with React and TypeScript, following Stryker Brand Guidelines 2025. This application provides a complete solution for managing maintenance and service requests with an intuitive, responsive interface.

## Features

### 1. **Login/Hero Screen**
- Full-height hero screen with background imagery
- Minimalist login form with animated transitions
- Informational cards showcasing key features
- Transparent header with branding

### 2. **Persistent Sidebar Navigation**
- Collapsible sidebar with toggle functionality
- Primary "New Request" action button
- Navigation menu (Dashboard, My Requests, Analytics)
- Advanced filtering system (Status, Priority, Date Range)
- User profile section

### 3. **Dashboard View**
- Dense, sortable table of service requests
- Real-time statistics cards (Open, In Progress, Resolved, Critical)
- Search functionality across tickets
- Color-coded status and priority badges
- Click-to-view ticket details

### 4. **Submit Request Form**
- Full-page form with all required fields
- Drag-and-drop file upload support
- Real-time form validation
- Category and priority selection
- Location and description fields

### 5. **Ticket Detail View (Split Layout)**
- **Main Section (3/4 width)**:
  - Complete ticket information
  - Tabbed interface (Details, History, Comments)
  - Status and assignment management
  - Timeline of activities
- **Sidebar (1/4 width)**:
  - Attachment management
  - File preview icons
  - Download functionality
  - Upload new attachments

## Design System

### Colors (Stryker Brand Guidelines 2025)
- **Primary Gold**: #FFB500
- **Gray**: #B2B4AE
- **Black**: #000000
- **White**: #FFFFFF
- **Complementary**: Orange (#AF6D04), Purple (#85458A), Blue (#1C5687), Teal (#4C7D7A)

### Typography
- System fonts for optimal performance
- Consistent sizing and weights throughout
- Clear hierarchy with headings and body text

### Components
All components are modular and reusable:
- `LoginScreen.tsx` - Authentication interface
- `Sidebar.tsx` - Navigation and filtering
- `Dashboard.tsx` - Ticket list view
- `SubmitRequest.tsx` - New ticket form
- `TicketDetail.tsx` - Detail split view
- `TicketingApp.tsx` - Main application container

## Architecture

```
ticketing-app/
├── LoginScreen (Full-screen hero)
└── Main Layout
    ├── Sidebar (Fixed, collapsible)
    │   ├── Branding
    │   ├── New Request Button
    │   ├── Navigation
    │   ├── Filters
    │   └── User Profile
    └── Content Area (Dynamic)
        ├── Dashboard
        ├── Submit Request
        ├── Ticket Detail
        └── Analytics (Coming Soon)
```

## State Management

The application uses React hooks for state management:
- `useState` for local component state
- Prop drilling for parent-child communication
- Centralized filter state in main app
- View routing through state-based navigation

## Responsive Design

- **Desktop**: Full sidebar, multi-column layouts
- **Tablet**: Collapsed sidebar, adjusted grids
- **Mobile**: Hidden sidebar toggle, stacked layouts

## Animations & Transitions

- Smooth page transitions (fadeIn, slideUp, slideInRight)
- Hover effects on interactive elements
- Loading states with spinners
- Floating animations for empty states

## Key Interactions

1. **Login Flow**: Enter credentials → Animated transition to dashboard
2. **Create Request**: Click "New Request" → Fill form → Submit → Return to dashboard
3. **View Details**: Click ticket row → Split view opens → Tab navigation
4. **Filter & Search**: Adjust filters in sidebar → Real-time table updates
5. **Sort Table**: Click column headers → Toggle ascending/descending

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- CSS transitions over JavaScript animations
- Debounced search inputs
- Lazy loading for images
- Optimized re-renders with React best practices

## Future Enhancements

- Real API integration
- Advanced analytics dashboard
- Real-time notifications
- Multi-language support
- Dark mode theme
- Mobile native apps
- Advanced search with filters
- Bulk actions
- Export functionality

## Development

To run locally:
```bash
cd frontend
npm install
npm start
```

## Credits

Built with:
- React 18
- TypeScript
- CSS3 with CSS Variables
- Stryker Brand Guidelines 2025

---

**Note**: This is a proof-of-concept implementation. For production use, implement proper authentication, API integration, error handling, and testing.
