---
name: Clinical Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#414750'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#727781'
  outline-variant: '#c1c7d2'
  surface-tint: '#1b60a2'
  primary: '#003e6f'
  on-primary: '#ffffff'
  primary-container: '#005596'
  on-primary-container: '#a4caff'
  inverse-primary: '#a2c9ff'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#8cf3f3'
  on-secondary-container: '#007070'
  tertiary: '#00471c'
  on-tertiary: '#ffffff'
  tertiary-container: '#006129'
  on-tertiary-container: '#4ce277'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a2c9ff'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#004881'
  secondary-fixed: '#8cf3f3'
  secondary-fixed-dim: '#6fd7d6'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-id:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  status-badge:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 16px
  stack-gap: 12px
  inline-gap: 8px
  card-padding: 16px
---

## Brand & Style
The design system is engineered for a high-stakes clinical environment, prioritizing reliability, authority, and precision. It adopts a **Modern Minimalist** style that bridges the gap between institutional stability and contemporary software usability. 

The aesthetic is characterized by high functional density without visual clutter. It utilizes a card-based architecture to encapsulate complex medical and administrative data, ensuring that interns and supervisors can make split-second decisions based on clear information hierarchy. To support the "Night Shift" use case, the system utilizes a high-contrast dark mode designed to reduce eye strain in low-light hospital corridors while maintaining legibility of critical status alerts.

## Colors
The palette is rooted in "Deep Hospital Blue" to establish immediate professional trust. 

- **Primary & Secondary:** Used for core navigation, primary actions, and branding elements.
- **Semantic Logic:** Green, Amber, and Crimson are reserved strictly for status indicators (Verified, Needs Attention, Failed). Do not use these colors for decorative purposes.
- **Neutral Palette:** Employs Slate Grays to create a sophisticated hierarchy in typography and borders.
- **Dark Mode:** For the dark variant, surfaces should use `#1E293B` (Slate 800) to ensure high contrast against the `#0F172A` background, optimizing for legibility during night shifts.

## Typography
Inter is selected for its exceptional legibility and neutral, systematic tone. 

- **Registration Numbers:** Use `display-id` for student IDs or medical codes to ensure they are the most prominent element on a record card.
- **Hierarchy:** Use `label-caps` (Uppercase) for section headers and non-interactive metadata to distinguish them from actionable body text.
- **Status:** Status indicators use a dedicated weight (`600`) to ensure visibility even at small sizes within badges.

## Layout & Spacing
This design system utilizes a **Mobile-First Fluid Grid** with a strict 4px baseline rhythm.

- **Margins:** Standardize on 16px lateral margins for all mobile screens.
- **Card Logic:** Content is grouped into cards. Cards should have a bottom margin of 12px to create a clear vertical "stack" that is easy to parse while scrolling.
- **Touch Targets:** All interactive elements (buttons, list items) must maintain a minimum height of 48px to accommodate use in fast-paced clinical environments where precision touch is difficult.

## Elevation & Depth
The system uses **Tonal Layers** rather than heavy shadows to maintain a clean, clinical feel.

- **Level 0 (Background):** Used for the main canvas (`#F8FAFC`).
- **Level 1 (Cards):** Pure white (`#FFFFFF`) with a subtle 1px stroke in `#E2E8F0`. No shadow is used in light mode to keep the UI "flat" and professional.
- **Level 2 (Active Elements):** When a card is pressed or active, use a soft, 4px blur shadow with 5% opacity to indicate elevation.
- **Night Shift:** In dark mode, depth is conveyed through lighter surface fills rather than shadows. Level 1 surfaces move from `#0F172A` to `#1E293B`.

## Shapes
A **Soft** (0.25rem/4px) roundedness is applied across the system. This "semi-sharp" approach maintains a clinical and authoritative look while feeling modern. 

- **Buttons & Cards:** Use the standard 4px radius.
- **Status Badges:** Use a "Pill" shape (full rounding) to visually differentiate them from interactive square buttons and data cards.
- **GPS Indicators:** Visualizations for GPS verification use perfect circles to represent radius and location accuracy.

## Components
### Status Badges
Badges are non-interactive indicators. They consist of a light tinted background (10% opacity of the semantic color) and high-contrast text in the 100% semantic color.

### Professional Cards
Cards for student/shift info should feature a header row for the Name and Registration ID, followed by a middle section for time/location data, and a footer for the status badge and GPS indicator.

### GPS Verification Visuals
When displaying location status, use a map-pin icon surrounded by three concentric, pulsating rings. The color of the rings should match the Primary Blue when searching and transition to Medical Green when "Verified."

### Role-Specific Navigation
The bottom navigation bar must change context based on the user (Intern vs. Supervisor). 
- **Intern:** Home, Shifts, Logs, Profile.
- **Supervisor:** Dashboard, Pending, Students, Profile.

### Input Fields
Fields should have a 1px border. When focused, the border transitions to Primary Blue with a 2px thickness. Labels should remain visible (floating or top-aligned) at all times to prevent errors in data entry.