# Frontend Structure & Design System

## 🎨 Design System

### Color Palette
Our design system uses a carefully crafted color palette for consistency and accessibility:

#### Primary Colors (Blue - Trust & Professionalism)
- `primary-50` to `primary-900` - Main brand colors
- Used for buttons, links, and primary actions

#### Secondary Colors (Purple - Accent)
- `secondary-50` to `secondary-900` - Accent colors
- Used for secondary actions and highlights

#### Semantic Colors
- **Success**: Green shades for positive actions
- **Warning**: Yellow/Orange for cautions
- **Error**: Red for errors and dangerous actions
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter (with system fallbacks)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Responsive scaling** with Tailwind's text utilities

### Shadows & Effects
- `shadow-soft`: Subtle elevation
- `shadow-medium`: Moderate elevation
- `shadow-strong`: High elevation
- Custom animations: `fade-in`, `slide-up`, `slide-down`

## 📁 File Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── components/             # Reusable components
│   │   ├── ui/                # Design system components
│   │   │   ├── Input.tsx      # Reusable input component
│   │   │   ├── Button.tsx     # Reusable button component
│   │   │   ├── Card.tsx       # Card container component
│   │   │   ├── Alert.tsx      # Alert/notification component
│   │   │   └── index.ts       # UI components barrel exports
│   │   ├── Layout.tsx         # App layout with navigation
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   ├── PostCard.tsx       # Post display component
│   │   └── CreatePost.tsx     # Post creation component
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication state management
│   ├── pages/                 # Page components
│   │   ├── Login.tsx         # Sign-in page
│   │   ├── Register.tsx      # Sign-up page
│   │   ├── Home.tsx          # Dashboard/feed page
│   │   ├── Profile.tsx       # User profile page
│   │   ├── Users.tsx         # User discovery page
│   │   └── Search.tsx        # Search functionality page
│   ├── services/             # API and external services
│   │   └── api.ts           # Backend API client
│   ├── styles/              # Design system definitions
│   │   └── colors.ts        # Color palette constants
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # React app entry point
│   └── index.css            # Global styles
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies and scripts
```

## 🧩 Component Architecture

### UI Components (Design System)

#### `Input`
**Features:**
- Multiple variants: `default`, `outlined`, `filled`
- Sizes: `sm`, `md`, `lg`
- Built-in password toggle
- Left/right icon support
- Error states with validation messages
- Helper text support
- Full TypeScript support

**Usage:**
```tsx
<Input
  label="Email"
  type="email"
  leftIcon={<Mail />}
  placeholder="Enter email"
  error={errors.email}
  required
/>
```

#### `Button`
**Features:**
- Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
- Sizes: `sm`, `md`, `lg`
- Loading states with spinner
- Left/right icon support
- Full width option
- Disabled states

**Usage:**
```tsx
<Button
  variant="primary"
  size="lg"
  isLoading={isSubmitting}
  leftIcon={<LogIn />}
  fullWidth
>
  Sign In
</Button>
```

#### `Card`
**Features:**
- Variants: `default`, `outlined`, `elevated`, `glass`
- Padding options: `none`, `sm`, `md`, `lg`
- Hover effects option
- Responsive design

#### `Alert`
**Features:**
- Types: `success`, `error`, `warning`, `info`
- Dismissible option
- Icon integration
- Title and description support

### Page Components

#### Authentication Pages
- **Login**: Enhanced with gradient background and card design
- **Register**: Multi-step form with validation

#### Dashboard & Social Features
- **Home**: Personalized feed with sidebar stats
- **Profile**: User profile management with stats
- **Users**: User discovery with follow/unfollow
- **Search**: Advanced search for users and posts

#### Post Management
- **PostCard**: Interactive post display with likes/comments
- **CreatePost**: Rich post creation with image support

## 🎯 Key Features Implemented

### Authentication & Security
- JWT token management
- Protected routes
- Auto-logout on token expiry
- Secure form handling

### User Experience
- Loading states throughout
- Error handling with user-friendly messages
- Responsive design (mobile-first)
- Smooth animations and transitions
- Accessibility considerations

### Social Features
- Real-time-like interactions
- Comment system
- Follow/unfollow functionality
- User discovery
- Content search

### Performance
- Code splitting with React Router
- Optimized bundle size
- React Query for efficient data fetching
- Memoized components where appropriate

## 🛠 Development Workflow

### Build System
- **Vite**: Fast development server and optimized builds
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with custom config
- **ESLint**: Code linting

### Component Development
1. Create in appropriate directory (`ui/`, `pages/`, etc.)
2. Use TypeScript interfaces for props
3. Follow design system patterns
4. Include error handling
5. Add to barrel exports if UI component

### Styling Guidelines
1. Use design system colors (`primary-500`, `secondary-600`, etc.)
2. Consistent spacing with Tailwind scale
3. Responsive design with mobile-first approach
4. Smooth transitions and hover effects
5. Accessibility-compliant color contrasts

## 🚀 Getting Started

### Development
```bash
cd frontend
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## 📈 Future Enhancements

### Potential Improvements
1. **Dark Mode**: Toggle between light/dark themes
2. **Internationalization**: Multi-language support
3. **PWA Features**: Offline support, push notifications
4. **Advanced Components**: Data tables, modal system, toast notifications
5. **Testing**: Unit tests with Jest/React Testing Library
6. **Storybook**: Component documentation and testing
7. **Performance**: Virtual scrolling for large lists
8. **Accessibility**: Enhanced ARIA support, keyboard navigation

### Component Library Extensions
- Modal/Dialog system
- Dropdown/Select components
- Date picker
- File upload with drag & drop
- Rich text editor
- Data visualization components

The frontend is now fully functional with a modern, accessible, and maintainable codebase that follows React and TypeScript best practices.
