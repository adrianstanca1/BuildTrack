# BuildTrack — Design System & UI/UX Specification

A comprehensive construction management mobile app design system.

---

## 1. Design Tokens

### Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **Primary** | `#2563EB` | `#3B82F6` | Buttons, links, active states |
| **Primary Hover** | `#1D4ED8` | `#60A5FA` | Button pressed states |
| **Primary Light** | `#EFF6FF` | `#1E3A5F` | Primary backgrounds |
| **Success** | `#10B981` | `#34D399` | Success states, completions |
| **Warning** | `#F59E0B` | `#FBBF24` | Warnings, pending |
| **Danger** | `#EF4444` | `#F87171` | Errors, critical incidents |
| **Info** | `#3B82F6` | `#60A5FA` | Information, notifications |
| **Background** | `#FFFFFF` | `#0F172A` | Screen backgrounds |
| **Surface** | `#F8FAFC` | `#1E293B` | Cards, sheets |
| **Surface Elevated** | `#FFFFFF` | `#334155` | Modals, dialogs |
| **Border** | `#E2E8F0` | `#475569` | Dividers, borders |
| **Text Primary** | `#0F172A` | `#F8FAFC` | Headlines, body |
| **Text Secondary** | `#64748B` | `#94A3B8` | Subtitles, captions |
| **Text Tertiary** | `#94A3B8` | `#64748B` | Placeholders, hints |
| **Text Inverse** | `#FFFFFF` | `#0F172A` | Text on primary |

### Typography

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Display** | 32px | 700 | 40px | -0.02em | Splash, onboarding titles |
| **H1** | 28px | 700 | 36px | -0.02em | Screen titles |
| **H2** | 22px | 600 | 28px | -0.01em | Section headers |
| **H3** | 18px | 600 | 24px | -0.01em | Card titles |
| **H4** | 16px | 600 | 22px | 0 | List item titles |
| **Body** | 16px | 400 | 24px | 0 | Paragraphs |
| **Body Small** | 14px | 400 | 20px | 0 | Secondary text |
| **Caption** | 12px | 500 | 16px | 0.02em | Labels, badges |
| **Button** | 16px | 600 | 24px | 0.01em | Button text |
| **Tab** | 12px | 500 | 16px | 0.02em | Tab labels |

**Font Family:** System default (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`)

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Icon padding, tight gaps |
| **sm** | 8px | Inline spacing |
| **md** | 12px | Card internal padding |
| **lg** | 16px | Section padding |
| **xl** | 20px | Screen edge padding |
| **2xl** | 24px | Large gaps |
| **3xl** | 32px | Section separators |
| **4xl** | 48px | Major section breaks |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Badges, small pills |
| **sm** | 8px | Buttons, inputs |
| **md** | 12px | Cards |
| **lg** | 16px | Bottom sheets |
| **xl** | 24px | Modals |
| **full** | 9999px | Avatars, FAB |

### Shadows (Light Mode)

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| **md** | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| **lg** | `0 10px 15px rgba(0,0,0,0.1)` | Modals, FAB |
| **xl** | `0 20px 25px rgba(0,0,0,0.1)` | Dropdowns |

---

## 2. Component Library

### Buttons

**Primary Button**
- Background: `Primary`
- Text: `Text Inverse`
- Border radius: `sm` (8px)
- Padding: `md` vertical, `lg` horizontal
- Height: 48px
- Active: scale 0.98 + `Primary Hover`
- Disabled: opacity 0.5

**Secondary Button**
- Background: transparent
- Border: 1.5px `Primary`
- Text: `Primary`
- Same dimensions as primary

**Ghost Button**
- Background: transparent
- Text: `Primary`
- Padding: `sm` vertical, `md` horizontal

**Icon Button**
- Size: 40px × 40px
- Border radius: `sm`
- Background: `Surface`
- Icon color: `Text Secondary`

**FAB (Floating Action Button)**
- Size: 56px × 56px
- Border radius: `full`
- Background: `Primary`
- Shadow: `lg`
- Icon: `Text Inverse`, 24px

### Cards

**Standard Card**
- Background: `Surface`
- Border radius: `md` (12px)
- Padding: `lg` (16px)
- Shadow: `md`
- Border: 1px `Border` (optional)

**Stat Card**
- Same as standard + icon top-left
- Large number: `H1` weight
- Label: `Caption` color `Text Secondary`

**Project Card**
- Horizontal layout: thumbnail + content
- Progress bar at bottom
- Status badge top-right
- Members row (avatar stack)

**Task Card**
- Checkbox left
- Title + description
- Priority badge + due date
- Swipe actions: Complete, Edit, Delete

### Inputs

**Text Input**
- Background: `Surface`
- Border: 1px `Border`
- Border radius: `sm`
- Padding: `md`
- Height: 48px
- Focus: border color `Primary`
- Error: border color `Danger` + error text `Caption`

**Search Input**
- Same as text + search icon left
- Clear button right (when filled)
- Background: slightly darker `Surface`

**Text Area**
- Same styling, min-height 120px
- Auto-resize with content

**Select/Dropdown**
- Same as text input + chevron right
- Options sheet slides up from bottom

### Badges

| Variant | Background | Text | Border radius |
|---------|-----------|------|---------------|
| **Default** | `Surface Elevated` | `Text Primary` | `xs` |
| **Primary** | `Primary Light` | `Primary` | `xs` |
| **Success** | `#D1FAE5` | `#059669` | `xs` |
| **Warning** | `#FEF3C7` | `#D97706` | `xs` |
| **Danger** | `#FEE2E2` | `#DC2626` | `xs` |

### Avatars

| Size | Dimension | Border radius |
|------|-----------|---------------|
| **xs** | 24px | `full` |
| **sm** | 32px | `full` |
| **md** | 40px | `full` |
| **lg** | 56px | `full` |
| **xl** | 80px | `full` |

- Placeholder: initials on `Primary Light` background
- Stack: -8px overlap, border 2px `Background`

### Progress Indicators

**Linear Progress**
- Height: 8px
- Border radius: `full`
- Background track: `Surface Elevated`
- Fill: `Primary`
- Success fill: `Success`
- Danger fill: `Danger`

**Circular Progress**
- Size: 48px (default)
- Stroke width: 4px
- Track: `Surface Elevated`
- Fill: `Primary`

**Skeleton Loader**
- Background: `Surface Elevated`
- Animated pulse opacity 0.5 → 1
- Border radius matches content

---

## 3. Screen Designs

### Onboarding Flow

**Screen 1 — Welcome**
- Full-screen gradient: `Primary` → `#1E40AF`
- Center: app icon (80px), app name `Display` white
- Tagline: "Construction management, simplified"
- Bottom: "Get Started" button (primary, full-width)
- "Already have an account? Sign In" link

**Screen 2 — Features (Carousel)**
- Skip button top-right
- 3-4 slides with illustrations
- Title: `H2`
- Description: `Body`
- Page dots bottom
- "Next" / "Get Started" button

**Screen 3 — Permissions**
- Location access request
- Notification permission
- Camera/photo library permission
- Each with icon + description + allow/deny

### Auth Screens

**Login**
- Logo centered top
- "Welcome back" `H1`
- Email input
- Password input + show/hide toggle
- "Forgot password?" link
- "Sign In" primary button
- Divider: "or continue with"
- Social auth buttons (Google, Apple)
- "Don't have an account? Sign Up"
- Biometric auth option (if available)

**Register**
- "Create account" `H1`
- Full name input
- Email input
- Company name input
- Password input + strength meter
- Confirm password
- Terms & privacy checkbox
- "Create Account" primary button
- "Already have an account? Sign In"

**Forgot Password**
- "Reset password" `H1`
- Email input
- "Send reset link" button
- Success: "Check your email" illustration

### Dashboard (Home)

**Header**
- Greeting: "Good morning, [Name]" `H2`
- Date subtitle
- Notification bell icon (badge if unread)
- Profile avatar

**Stats Row**
- 4 stat cards horizontal scroll
- Active Projects | Pending Tasks | Team Members | Safety Score
- Each: icon + number + label

**Quick Actions**
- Grid: 2×2 or horizontal scroll
- New Project, New Task, Report Incident, Add Worker
- Icon buttons with labels

**Recent Projects**
- Section header: "Recent Projects" + "See All"
- 3 project cards vertical
- Each: thumbnail, name, progress bar, status badge, due date

**Recent Tasks**
- Section header: "Your Tasks" + "See All"
- 5 task items
- Each: checkbox, title, project name, due date, priority dot

**Activity Feed**
- Section header: "Recent Activity"
- Timeline items: avatar + action + time
- "John completed Foundation task on Downtown Office"
- Swipe: "View Details"

**Bottom Tab Bar**
- 5 tabs: Dashboard, Projects, Tasks, Safety, More
- Active: icon filled + `Primary` + label
- Inactive: icon outline + `Text Secondary` + label
- Center: FAB for quick actions

### Projects

**Project List**
- Search bar top (sticky)
- Filter chips: All, Active, Completed, On Hold
- Sort: Recent, Name, Progress, Due Date
- List view: project cards
- Grid view toggle (2 columns)
- Pull-to-refresh

**Project Detail**
- Hero image (carousel if multiple)
- Project name `H1`
- Status badge + progress bar
- Quick stats: Budget, Spent, Remaining, Timeline
- Tabs: Overview, Tasks, Team, Photos, Map
- Overview: description, location, client info
- Tasks: list with add button
- Team: avatar stack + manage button
- Photos: masonry grid
- Map: interactive with pin

**Create/Edit Project**
- Form with sections:
  - Basic Info (name, description, client)
  - Location (address + map picker)
  - Budget & Timeline
  - Team assignment
  - Photo upload
- "Save" primary button
- "Archive" danger button (edit mode)

### Tasks

**Task List**
- Search + filter (status, priority, assignee, due date)
- Group by: Project, Due Date, Priority
- Kanban view toggle (To Do, In Progress, Done)
- Each item: checkbox, title, assignee avatar, due date, priority

**Task Detail**
- Title `H1`
- Status dropdown
- Assignee selector
- Due date picker
- Priority selector
- Description
- Subtasks (checklist)
- Attachments (photos/docs)
- Activity log
- Comments thread
- "Complete" primary button

**Create Task**
- Project selector
- Title input
- Description text area
- Assignee picker
- Due date + time
- Priority: Low, Medium, High, Urgent
- Subtasks addable
- Photo attachments

### Workers/Team

**Team List**
- Search bar
- Role filter chips
- Grid view: avatar cards
- List view: rows with role, status, contact
- Status indicators: Active, Off-Duty, On Leave

**Worker Detail**
- Large avatar
- Name + role badge
- Contact: phone, email
- Hourly rate
- Certifications list
- Assigned projects
- Weekly hours chart
- "Edit" / "Message" buttons

**Add Worker**
- Name, role, contact info
- Hourly rate
- Certifications (addable)
- Photo
- Assign to projects

### Safety Incidents

**Safety Dashboard**
- Safety score card (large circular progress)
- Stats: Total Incidents, Open, Resolved, Critical
- Trend chart (last 30 days)
- Recent incidents list

**Incident List**
- Filter: All, Open, Critical, Resolved
- Each card: severity badge, title, date, location, photos count
- Swipe: Resolve, Edit, Delete

**Report Incident**
- Step 1: Type (Injury, Near Miss, Equipment, Environmental)
- Step 2: Details (title, description, location)
- Step 3: Severity (Low, Medium, High, Critical)
- Step 4: Photos (camera + gallery)
- Step 5: Witnesses
- Step 6: Review & Submit

**Incident Detail**
- Severity banner (color-coded)
- Title + description
- Photos carousel
- Location map
- Witnesses list
- Status timeline
- Actions: Edit, Resolve, Close

### Inspections

**Inspection List**
- Filter: Pending, Passed, Failed
- Each: title, inspector, date, status, findings count

**Inspection Detail**
- Header: status badge + date
- Inspector info
- Checklist with pass/fail/na for each item
- Findings list
- Photos
- Signature pad (for sign-off)
- "Mark as Passed" / "Mark as Failed"

**Create Inspection**
- Project selector
- Inspector name
- Title
- Checklist template (addable items)
- Location
- Due date

### Notifications

**Inbox**
- Segmented control: All, Unread, Mentions
- List: icon + title + body + timestamp
- Swipe: Mark Read, Delete
- Pull-to-refresh
- Mark all as read button

**Notification Detail**
- Full content
- Related action button ("View Project", "Complete Task")
- Timestamp

### Profile & Settings

**Profile**
- Avatar (editable)
- Name, email, phone
- Company info
- Role badge
- Subscription tier badge

**Settings**
- Account section
  - Edit Profile
  - Change Password
  - Security (biometric, 2FA)
- Preferences
  - Notifications
  - Dark Mode toggle
  - Language
- Support
  - Help Center
  - Contact Support
  - Privacy Policy
  - Terms of Service
- Danger zone
  - Log Out
  - Delete Account

### Admin Dashboard

**Stats Overview**
- Revenue cards
- User growth chart
- Active subscriptions
- Recent signups table

**User Management**
- Searchable table
- Filter by role, status, subscription
- Actions: Edit, Disable, Delete
- Bulk actions

**Billing**
- Revenue charts
- Subscription breakdown
- Invoice table
- Export reports

---

## 4. Navigation Structure

### Tab Bar (5 tabs)

| Tab | Icon | Active Icon | Screen |
|-----|------|-------------|--------|
| Dashboard | home-outline | home | DashboardScreen |
| Projects | folder-outline | folder | ProjectsStack |
| Quick Action | add-circle | add-circle | QuickActionSheet |
| Tasks | checkmark-circle-outline | checkmark-circle | TasksStack |
| Safety | shield-outline | shield | SafetyStack |

### Stack Navigation

**Projects Stack**
- ProjectListScreen → ProjectDetailScreen → CreateProjectScreen → EditProjectScreen → ProjectMapScreen

**Tasks Stack**
- TaskListScreen → TaskDetailScreen → CreateTaskScreen → EditTaskScreen

**Safety Stack**
- SafetyDashboardScreen → IncidentListScreen → IncidentDetailScreen → ReportIncidentScreen

**More Stack** (accessed from profile)
- ProfileScreen → SettingsScreen → NotificationSettingsScreen → HelpScreen

### Modals

- CreateProjectScreen (full screen)
- CreateTaskScreen (full screen)
- ReportIncidentScreen (full screen)
- QuickActionSheet (bottom sheet)
- FilterSheet (bottom sheet)
- ImagePickerSheet (bottom sheet)
- ShareSheet (system)

### Bottom Sheets

**Quick Actions**
- New Project
- New Task
- Report Incident
- Add Worker
- Scan QR Code

**Filters**
- Status chips
- Date range
- Priority
- Assignee

---

## 5. Interaction Patterns

### Pull-to-Refresh
- Trigger: pull down 80px
- Indicator: circular spinner `Primary`
- Success: brief checkmark flash
- List screens: all

### Swipe Actions
- Left swipe: Edit (blue), Delete (red)
- Right swipe: Complete (green), Archive (gray)
- Threshold: 80px to trigger
- Applies to: tasks, incidents, workers

### FAB Behavior
- Dashboard: New quick action
- Project detail: New task
- Task list: New task
- Safety: Report incident
- Hides on scroll down, shows on scroll up

### Search + Filter
- Search: real-time debounce 300ms
- Filter: bottom sheet with chips
- Active filters: horizontal chip list below search
- Clear all button

### Empty States
- Icon: 80px, `Text Tertiary`
- Title: `H3`
- Description: `Body Small`
- CTA button if applicable

### Loading States
- Initial: skeleton screens
- Pagination: inline spinner
- Action: button spinner
- Image: blur placeholder + fade in

### Error States
- Inline: red text below input
- Toast: bottom banner, auto-dismiss 4s
- Full screen: illustration + retry button
- Offline: banner at top

---

## 6. Data Visualization

### Project Progress
- Horizontal bar, segmented by phase
- Color: `Primary` for complete, `Surface Elevated` for remaining
- Label: percentage + phase name

### Budget Chart
- Bar chart: Budget vs Spent
- Colors: `Success` vs `Danger` (if over)
- Dotted line for projected

### Task Completion
- Donut chart
- Segments: Complete, In Progress, Pending, Overdue
- Center: completion percentage

### Safety Trends
- Line chart: incidents over time
- X-axis: days/weeks
- Y-axis: count
- Color: `Danger` for incidents, `Success` for resolved

### Worker Hours
- Bar chart: hours per worker per week
- Horizontal bars
- Color: `Primary`

---

## 7. Animation & Motion

### Transitions
- Screen push: slide from right, 250ms, ease-out
- Screen pop: slide to right, 200ms, ease-in
- Modal: slide up from bottom, 300ms, spring
- Bottom sheet: slide up, 300ms, spring

### Micro-interactions
- Button press: scale 0.96, 100ms
- Card press: scale 0.98 + shadow increase
- Checkbox: spring bounce
- Toggle: slide + color transition
- FAB: scale + rotate icon, 200ms

### Loading
- Skeleton: shimmer animation, 1.5s loop
- Spinner: rotate, 1s linear loop
- Progress: width transition, ease-out

### Success States
- Checkmark: scale from 0 + spring
- Confetti: particles on milestone completion

---

## 8. Dark Mode

### Overrides

| Element | Light | Dark |
|---------|-------|------|
| Background | `#FFFFFF` | `#0F172A` |
| Surface | `#F8FAFC` | `#1E293B` |
| Text Primary | `#0F172A` | `#F8FAFC` |
| Text Secondary | `#64748B` | `#94A3B8` |
| Border | `#E2E8F0` | `#334155` |
| Shadow | opacity 0.1 | opacity 0.3 |
| Primary Light | `#EFF6FF` | `#1E3A5F` |

### Implementation
- `useColorScheme()` for system preference
- Override toggle in settings
- CSS variables / context provider
- Image adjustments: brightness 0.9

---

## 9. Responsive Considerations

### Phone (default)
- Full width cards
- Bottom tab navigation
- Stacked layouts

### Tablet
- Side-by-side master/detail
- Grid layouts (2-3 columns)
- Persistent sidebar navigation

### Foldable
- Single pane folded
- Dual pane unfolded

---

## 10. Accessibility

- Minimum touch target: 44px × 44px
- Color contrast: WCAG AA (4.5:1)
- Screen reader labels on all interactive elements
- Focus indicators on all focusable elements
- Reduce motion support
- Dynamic type support (iOS) / font scaling (Android)

---

## 11. NativeWind Class Reference

### Common Combinations

```
// Screen container
className="flex-1 bg-background"

// Card
className="bg-surface rounded-xl p-4 shadow-md border border-border"

// Primary button
className="bg-primary rounded-lg px-6 py-3 active:scale-98"

// Text input
className="bg-surface border border-border rounded-lg px-4 py-3 focus:border-primary"

// H1
className="text-text-primary text-2xl font-bold"

// Body
className="text-text-primary text-base leading-6"

// Badge success
className="bg-green-100 text-green-700 rounded px-2 py-1 text-xs font-medium"

// FAB
className="w-14 h-14 bg-primary rounded-full shadow-lg items-center justify-center"
```

### Dark Mode Classes

```
className="bg-white dark:bg-slate-900"
className="text-slate-900 dark:text-white"
className="bg-slate-100 dark:bg-slate-800"
```

---

## 12. Asset Requirements

### Icons (Lucide React Native)
- All standard icons: Home, Folder, CheckCircle, Shield, Plus, Search, Bell, User, Settings, MapPin, Calendar, Clock, AlertTriangle, Camera, ChevronRight, Filter, MoreVertical, Edit, Trash, Share, Download, Upload, Eye, EyeOff, Lock, Mail, Phone, Building

### Illustrations
- Empty states: no projects, no tasks, no notifications
- Onboarding: project management, teamwork, safety
- Success: checkmark, celebration
- Error: broken connection, not found

### App Icons
- iOS: 1024×1024
- Android: adaptive icon (foreground + background)
- Notification: 96×96

---

*Document version: 1.0*
*Last updated: 2026-05-09*
