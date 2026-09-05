---
name: Lumina Core
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
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style
The design system is a premium, high-utility framework designed for educational clarity and professional focus. It draws heavy inspiration from modern productivity tools like Raycast and Linear, emphasizing precision, subtle depth, and a reduced cognitive load.

The aesthetic is **Modern Minimalism with Glassmorphic layering**. It utilizes translucent surfaces and high-fidelity micro-interactions to create a sense of digital craftsmanship. The interface should feel like a breathable, organized canvas where the content (teaching and learning) remains the primary focus, supported by a sophisticated technical infrastructure.

## Colors
The palette is rooted in a "Paper White" foundation—a slightly tinted off-white that reduces eye strain compared to pure hex white. 

- **Primary (#6366f1):** Used for primary actions, progress indicators, and active states. It represents the "Lumina" energy.
- **Semantic Colors:** Green, Amber, and Red are reserved strictly for status (Success, Warning, Error) to maintain a disciplined visual hierarchy.
- **Glass Surfaces:** Surfaces use a translucent white `rgba(255, 255, 255, 0.7)` with a `blur(12px)` to create a sense of layered depth and "floating" UI elements.
- **Borders:** Extremely thin (1px) and low-contrast borders are used to define boundaries without adding visual noise.

## Typography
This design system uses a dual-font approach. **Geist** is employed for headings and UI labels to provide a technical, "engineered" feel, while **Inter** is used for body copy and instructional text for its world-class legibility in dense interfaces.

- **Scale:** Font sizes are optimized for readability within an LMS context.
- **Anti-aliasing:** Ensure `-webkit-font-smoothing: antialiased` is applied across the system.
- **Hierarchy:** Use weight (Medium to Semibold) rather than size to denote importance in the UI labels.

## Layout & Spacing
The system utilizes a **12-column fluid grid** for main dashboard views, transitioning to a focused **single-column layout** for lesson content.

- **Rhythm:** An 8pt grid system governs all spatial relationships.
- **Container:** Main content is capped at 1200px for optimal line length and focus.
- **Margins:** 24px (Desktop), 16px (Mobile).
- **Density:** High density for management screens (dashboards, rosters); Low density for learning screens (lesson players, reading views).

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Base):** The canvas background (`#fcfcfd`).
- **Level 1 (Cards/Sidebar):** Translucent white with 12px backdrop blur. 1px border (`rgba(0,0,0,0.06)`).
- **Level 2 (Popovers/Modals):** Increased blur (20px) and a soft, wide ambient shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)`.
- **Interactions:** Hover states on cards should subtly lift by increasing shadow spread and reducing border opacity.

## Shapes
The shape language is "Generous & Soft." 

- **Components (Buttons, Inputs):** 8px (`0.5rem`).
- **Containers (Cards, Modals):** 12px - 16px.
- **Outer Shells (Sidebar, Main Wrap):** 20px for a distinctive "app-within-a-frame" look similar to Arc or Raycast.
- **Selection States:** Use a pill shape (full round) for tags and active indicators.

## Components

### Buttons
- **Primary:** Solid `#6366f1` background with white text. Subtle 1px inner light border for depth.
- **Secondary:** Semi-transparent light grey background or outline. 
- **Ghost:** No background, primary color text. Used for less prominent actions.

### Inputs & Fields
- **Default State:** Light neutral background (`#f1f5f9`), 1px border.
- **Focus State:** White background, 1px `#6366f1` border, and a subtle 3px outer glow in the primary color at 15% opacity.

### Cards
- Always use the glassmorphic style. 
- Padding should be generous (`24px`).
- Header and Footer sections within cards should be separated by a 1px soft divider.

### Feedback & Status
- **Chips:** Small, caps-heavy labels using the semantic palette with 10% opacity backgrounds and 100% opacity text.
- **Progress Bars:** Thin 4px height, primary color for the fill, neutral-100 for the track.

### Icons
- Use **Lucide** outline icons. 
- Stroke weight: `2px` for standard UI, `1.5px` for large decorative icons.
- Color: Use `neutral-500` for inactive and `primary-500` for active states.