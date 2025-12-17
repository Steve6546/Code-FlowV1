# Design Guidelines: Smart Memory App

## Architecture Decisions

### Authentication
**No Authentication Required** - This is a local-first, privacy-focused utility app.
- All data stored locally using SQLite
- No server sync in MVP phase
- **Profile/Settings Screen Required**:
  - User-customizable avatar (generate 3 preset minimalist avatars matching the app's aesthetic)
  - Display name field
  - Language preference (Arabic/English with RTL support)
  - Theme toggle (Light/Dark/Auto)
  - Privacy settings (location permissions, camera/microphone access)
  - Data export/backup options

### Navigation Architecture
**Tab Navigation** (4 tabs with floating action button):
1. **Timeline** (Home) - Default view showing chronological content
2. **Discover** - Smart suggestions based on context
3. **Quick Add** (Floating Action Button) - Core capture action
4. **Profile** - Settings and user customization

**Modal Screens**:
- Focus Mode (activated from Discover tab)
- Content Detail View
- Filter & Sort Options
- Content Type Selection (when tapping Quick Add)

### Information Architecture

**Timeline Tab Stack**:
- Timeline Screen (root) → Content Detail Screen → Edit Screen

**Discover Tab Stack**:
- Suggestions Screen (root) → Focus Mode Screen → Content Detail Screen

**Profile Tab Stack**:
- Profile Screen (root) → Settings Screens → About/Privacy Policy

---

## Screen Specifications

### 1. Timeline Screen
**Purpose**: Display chronological view of all captured content with filtering options

**Layout**:
- **Header**: Custom transparent header
  - Left: Filter button (shows content type filters)
  - Title: "Timeline" or date range
  - Right: Calendar/date picker icon
- **Main Content**: Scrollable list (FlatList)
  - Pull-to-refresh enabled
  - Grouped by date with sticky section headers
  - Card-based layout for each memory item
  - Safe area insets: `top: headerHeight + Spacing.xl`, `bottom: tabBarHeight + Spacing.xl`
- **Components**: 
  - Date section headers (sticky)
  - Memory cards (text/image/audio/link previews)
  - Empty state illustration (when no content)
  - Floating scroll-to-top button (appears after scrolling)

### 2. Discover Screen
**Purpose**: Show contextual suggestions and activate Focus Mode

**Layout**:
- **Header**: Custom transparent header
  - Title: "Discover"
  - Right: Focus Mode toggle button
- **Main Content**: Scrollable view
  - Context cards showing time-based suggestions
  - Location-based suggestions (if permission granted)
  - Pattern-based suggestions (recurring behaviors)
  - Safe area insets: `top: headerHeight + Spacing.xl`, `bottom: tabBarHeight + Spacing.xl`
- **Components**:
  - Context suggestion cards (morning ideas, weekly patterns)
  - Focus Mode activation card
  - "Memory Threads" grouped cards

### 3. Focus Mode Screen (Modal)
**Purpose**: Filtered view showing only goal-relevant content

**Layout**:
- **Header**: Standard navigation header (non-transparent)
  - Left: Close button
  - Title: Focus goal name
  - Right: None
  - Background: Semi-transparent blur (iOS) or solid (Android)
- **Main Content**: Scrollable list
  - Only content matching focus criteria
  - Distraction-free layout
  - Safe area insets: `top: Spacing.xl`, `bottom: insets.bottom + Spacing.xl`
- **Footer**: Fixed button bar
  - "Exit Focus Mode" button

### 4. Quick Add FAB Flow
**Purpose**: Rapid content capture without categorization

**Interaction**:
- FAB press opens content type selector (modal bottom sheet)
- Content types: Text, Voice, Photo, Camera, Link, Screenshot
- Each type opens appropriate input modal
- Auto-saves with timestamp and optional location

**Voice Input Modal**:
- Full-screen modal
- Large circular record button (center)
- Waveform visualization
- Timer display
- Cancel/Save buttons

**Photo/Camera Modal**:
- Camera view or photo picker
- Caption text field (optional)
- Save button (top-right header)

**Text Input Modal**:
- Full-screen text editor
- Auto-focus keyboard
- Formatting toolbar (optional for MVP)
- Cancel (header-left) / Save (header-right)

**Link Input Modal**:
- URL text field with auto-detection
- Link preview card (after paste)
- Save button

### 5. Profile Screen
**Purpose**: User customization and app settings

**Layout**:
- **Header**: Default navigation header
  - Title: "Profile"
- **Main Content**: Scrollable form
  - Avatar selection (horizontal scrollable picker with 3 presets)
  - Display name field
  - Statistics cards (total memories, current streak)
  - Settings sections (grouped list)
  - Safe area insets: `top: Spacing.xl`, `bottom: insets.bottom + Spacing.xl`
- **Settings Sections**:
  - Appearance (Theme, Language)
  - Privacy (Permissions status)
  - Data (Export, Clear cache)
  - About (Version, Privacy Policy)

### 6. Content Detail Screen
**Purpose**: View and edit individual memory items

**Layout**:
- **Header**: Standard navigation header
  - Left: Back button
  - Title: Content type + date
  - Right: Edit/Delete menu
- **Main Content**: Scrollable view
  - Content display (text/image/audio player)
  - Metadata (time, location if available)
  - Related memories section (Memory Threads)
  - Safe area insets: `top: Spacing.xl`, `bottom: insets.bottom + Spacing.xl`

---

## Design System

### Color Palette

**Light Mode**:
- Primary: `#2E7D32` (Green - represents growth/memory)
- Secondary: `#0277BD` (Blue - trust/clarity)
- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Text Primary: `#212121`
- Text Secondary: `#757575`
- Divider: `#E0E0E0`
- Error: `#D32F2F`

**Dark Mode**:
- Primary: `#66BB6A` (Lighter green)
- Secondary: `#4FC3F7` (Lighter blue)
- Background: `#121212`
- Surface: `#1E1E1E`
- Text Primary: `#E0E0E0`
- Text Secondary: `#B0B0B0`
- Divider: `#2C2C2C`
- Error: `#EF5350`

### Typography
- **Display**: SF Pro Display (iOS) / Roboto (Android), 28px, Bold
- **Title Large**: 22px, Semibold
- **Title**: 18px, Semibold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

**RTL Support**: All text must support Arabic RTL layout with proper text alignment.

### Spacing Scale
```
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
xxl: 32px
```

### Component Specifications

**Memory Card**:
- Border radius: 12px
- Padding: Spacing.lg
- Background: Surface color
- No shadow in light mode
- Subtle elevation in dark mode (shadowOpacity: 0.15)
- Press feedback: Scale to 0.98 + opacity 0.7

**Floating Action Button**:
- Size: 56x56px
- Border radius: 28px (perfect circle)
- Background: Primary color
- Icon: Plus symbol (Feather icon: "plus")
- Shadow: 
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2
- Press feedback: Scale to 1.05
- Position: Bottom-center, above tab bar

**Section Headers (Timeline)**:
- Height: 32px
- Background: Background color with 90% opacity (blur on iOS)
- Text: Caption size, Text Secondary color
- Padding: Spacing.sm horizontal, Spacing.xs vertical
- Sticky positioning enabled

**Content Type Icons**:
- Text: Feather "file-text"
- Voice: Feather "mic"
- Photo: Feather "image"
- Link: Feather "link"
- Screenshot: Feather "monitor"
- Use Primary color in light mode, adjusted for dark mode

### Interaction Design

**Gestures**:
- Swipe left on memory card → Quick delete (with confirmation)
- Swipe right on memory card → Quick edit
- Long-press on memory card → Share options
- Pull-to-refresh on Timeline
- Swipe down to dismiss modals

**Animations**:
- Screen transitions: 300ms ease-in-out
- Modal presentations: Slide up from bottom (320ms)
- Card press: Spring animation (tension: 100, friction: 7)
- FAB press: Scale + ripple effect
- Loading states: Subtle skeleton screens (no spinners)

**Feedback**:
- Haptic feedback on FAB press (medium impact)
- Haptic feedback on save/delete actions (success/error)
- Toast notifications for background saves
- Subtle success checkmark animation

### Accessibility

**Requirements**:
- All interactive elements minimum 44x44pt touch target
- Color contrast ratio ≥ 4.5:1 for text
- Support VoiceOver (iOS) and TalkBack (Android)
- Descriptive accessibility labels for icons
- Screen reader announcements for context changes
- Support Dynamic Type (iOS text scaling)
- Keyboard navigation support (if applicable)

**Focus Indicators**:
- 2px border in Primary color when focused
- Clearly visible in both themes

---

## Critical Assets

**Generate 3 Preset Avatars**:
- Abstract geometric minimal designs
- Color palette matching app theme
- SVG format, 200x200px
- Themes: Brain icon, Light bulb, Star constellation

**Empty State Illustrations**:
- Timeline empty state: Floating thought bubbles (minimalist line art)
- Discover empty state: Compass with paths (suggests exploration)
- Focus mode empty: Single focused beam of light

**No Other Custom Graphics Needed**:
- Use Feather icons from @expo/vector-icons for all other UI elements
- System-standard components for native feel