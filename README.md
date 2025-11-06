# SlotSwapper Frontend

A React-based frontend application for the SlotSwapper time slot management and swapping system.

## Features

### 🔐 Authentication

- **Sign-up & Login**: Complete authentication system with forms
- **Protected Routes**: All application routes are secured with authentication
- **Persistent Sessions**: JWT token-based authentication with localStorage

### 📅 Calendar/Dashboard View

- **Event Management**: Create, edit, and delete personal events
- **Status Toggle**: Switch events between "BUSY" and "SWAPPABLE" states
- **Dashboard Overview**: Statistics and recent activity display
- **Event List View**: Clean list view of all user events

### 🏪 Marketplace View

- **Browse Available Slots**: View swappable slots from other users
- **Request Swap Modal**: Interactive modal to select your event to offer in exchange
- **Real-time Updates**: Dynamic state management for immediate UI updates

### 🔔 Notifications/Requests View

- **Incoming Requests**: View and respond to swap requests from other users
- **Outgoing Requests**: Track your sent requests and their status
- **Accept/Reject Actions**: One-click response system for incoming requests
- **Status Tracking**: Visual indicators for request statuses (Pending, Accepted, Rejected)

### 🎨 Modern UI/UX

- **Responsive Design**: Works on desktop and mobile devices
- **Tailwind CSS**: Modern, clean styling with consistent design system
- **Lucide Icons**: Beautiful, consistent iconography
- **Loading States**: Smooth loading animations throughout the app
- **Error Handling**: User-friendly error messages and validation

## Tech Stack

- **React 19.1.1**: Latest React with hooks and functional components
- **React Router DOM**: Client-side routing with protected routes
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Date-fns**: Modern date utility library
- **Vite**: Fast build tool and development server

## Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Access Application**:
   Open http://localhost:5174/ in your browser

## Backend Integration

The frontend communicates with the backend API at `http://localhost:3000/api` and integrates with all the required endpoints for authentication, event management, and swap functionality.

Make sure your backend server is running on `http://localhost:3000` before starting the frontend application.
