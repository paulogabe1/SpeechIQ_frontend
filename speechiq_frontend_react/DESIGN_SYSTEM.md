# SpeechIQ Design System

## Color Palette

### Primary Colors
```css
--primary: #030213 (Dark Navy - almost black)
--primary-foreground: #ffffff (White text on primary)
```
**Usage**: Main navigation, primary headings, high-emphasis text

### Secondary Colors
```css
--secondary: oklch(0.95 0.0058 264.53) (Very light purple-gray)
--secondary-foreground: #030213 (Dark text on secondary)
```
**Usage**: Subtle backgrounds, secondary UI elements

### Success Color
```css
Green: #10b981 (Emerald-500)
Green Alt: #22c55e (Green-500)
Success Background: from-green-400 to-emerald-500
Success Light: from-green-100 to-emerald-100
```
**Usage**: Success states, positive metrics, achievements, growth indicators

### Semantic Colors

#### Purple (Brand/Progress)
```css
Purple-50: rgb(250, 245, 255)
Purple-100: rgb(243, 232, 255)
Purple-200: rgb(233, 213, 255)
Purple-300: rgb(216, 180, 254)
Purple-400: rgb(192, 132, 252)
Purple-500: rgb(168, 85, 247)
Purple-600: rgb(147, 51, 234) - PRIMARY BRAND COLOR
Purple-700: rgb(126, 34, 206)
Purple-800: rgb(107, 33, 168)
Purple-900: rgb(88, 28, 135)
```
**Usage**: XP progress, level indicators, primary actions, focus states

#### Blue (Secondary Brand)
```css
Blue-50: rgb(239, 246, 255)
Blue-100: rgb(219, 234, 254)
Blue-200: rgb(191, 219, 254)
Blue-300: rgb(147, 197, 253)
Blue-400: rgb(96, 165, 250)
Blue-500: rgb(59, 130, 246)
Blue-600: rgb(37, 99, 235) - SECONDARY BRAND COLOR
Blue-700: rgb(29, 78, 216)
Blue-800: rgb(30, 64, 175)
Blue-900: rgb(30, 58, 138)
```
**Usage**: Secondary actions, information states, chart lines

#### Orange/Amber (Missions/Daily Goals)
```css
Orange-100: rgb(255, 237, 213)
Orange-200: rgb(254, 215, 170)
Orange-300: rgb(253, 186, 116)
Orange-400: rgb(251, 146, 60) - MISSION ACCENT
Orange-500: rgb(249, 115, 22)
Orange-600: rgb(234, 88, 12)
Orange-700: rgb(194, 65, 12)

Amber-300: rgb(252, 211, 77)
Amber-400: rgb(251, 191, 36) - DAILY MISSION PRIMARY
Amber-500: rgb(245, 158, 11)

Yellow-300: rgb(253, 224, 71) - LEVEL PROGRESS BAR
Yellow-400: rgb(250, 204, 21)
Yellow-500: rgb(234, 179, 8)
Yellow-600: rgb(202, 138, 4)
```
**Usage**: Daily missions, streaks, rewards, XP earned indicators

#### Teal/Emerald (Voice Synthesis)
```css
Emerald-100: rgb(209, 250, 229)
Emerald-500: rgb(16, 185, 129)
Teal-600: rgb(13, 148, 136)
```
**Usage**: Voice synthesis feature, premium features

#### Red (Destructive/Warnings)
```css
Red-600: rgb(220, 38, 38) - ISSUE INDICATOR
--destructive: #d4183d
```
**Usage**: Errors, critical feedback, issue detection

#### Gray (Neutral)
```css
Gray-50: rgb(249, 250, 251)
Gray-100: rgb(243, 244, 246)
Gray-200: rgb(229, 231, 235)
Gray-300: rgb(209, 213, 219)
Gray-400: rgb(156, 163, 175)
Gray-500: rgb(107, 114, 128)
Gray-600: rgb(75, 85, 99) - PRIMARY TEXT
Gray-700: rgb(55, 65, 81)
Gray-800: rgb(31, 41, 55)
Gray-900: rgb(17, 24, 39) - HEADINGS
```
**Usage**: Text hierarchy, borders, backgrounds, disabled states

---

## Button Styles

### Primary Action Button
```tsx
className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95"
```
**Properties**:
- Gradient: Purple-600 → Blue-600
- Text: White
- Padding: 32px (p-8)
- Border radius: 16px (rounded-2xl)
- Shadow: Extra large
- Hover: Scale 1.05
- Active: Scale 0.95

### Secondary Action Button
```tsx
className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95"
```
**Properties**:
- Gradient: Emerald-500 → Teal-600
- Same interaction patterns as primary

### White Button (on colored backgrounds)
```tsx
className="w-full bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
```

### Outlined Button (Hover State)
```tsx
className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all"
```

### Small Button
```tsx
className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
```

---

## Card Styles

### Primary Card
```tsx
className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
```
**Properties**:
- Background: White
- Padding: 24px
- Border radius: 16px
- Shadow: Large
- Border: 1px gray-200

### Gradient Hero Card
```tsx
className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-xl border-2 border-purple-400 text-white"
```

### Mission Card (Amber)
```tsx
className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 shadow-xl border-2 border-amber-300"
```

### Success Card
```tsx
className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-xl border-2 border-green-300"
```

### Stat Card
```tsx
className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-6 border-2 border-purple-200"
```

### Interactive Card (Clickable)
```tsx
className="p-4 rounded-xl hover:bg-purple-50 transition-colors border-2 border-transparent hover:border-purple-300"
```

### Info Panel
```tsx
className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200"
```

---

## Spacing Rules

### Page Layout
- Max width: `max-w-4xl` (896px) for main content, `max-w-6xl` (1152px) for wide layouts
- Page padding: `p-6` (24px)
- Bottom padding for nav: `pb-24` (96px)
- Section spacing: `space-y-6` (24px) or `space-y-8` (32px)

### Component Spacing
- Card padding: `p-6` (24px) or `p-8` (32px) for hero cards
- Button padding: `px-4 py-2` (small), `py-3` (medium), `p-8` (large)
- Gap between elements: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)
- Margin bottom for sections: `mb-4` (16px), `mb-6` (24px)

### Grid Layouts
- Two columns: `grid md:grid-cols-2 gap-6`
- Three columns: `grid md:grid-cols-3 gap-6`
- Four columns: `grid grid-cols-2 md:grid-cols-4 gap-4`
- Five columns: `grid grid-cols-5 gap-3`

---

## Border Radius Scale

```css
--radius: 0.625rem (10px) - Base radius
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 10px
--radius-xl: 14px

Tailwind Classes:
rounded-lg: 8px
rounded-xl: 12px
rounded-2xl: 16px
rounded-full: 9999px (circular)
```

---

## Animation Rules

### Motion Library (Framer Motion)
```tsx
import { motion } from "motion/react";
```

### Fade In + Slide Up
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
```

### Scale In
```tsx
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
```

### Progress Bar Animation
```tsx
initial={{ width: 0 }}
animate={{ width: animateProgress ? `${progressPercent}%` : 0 }}
transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
```

### Hover Animations
```tsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### CSS Transitions
- Standard: `transition-colors` (color changes)
- Transform: `transition-transform` (scale, translate)
- All: `transition-all` (multiple properties)
- Duration: Default 150ms (CSS), custom with motion

### Stagger Delays
- Card 1: delay: 0.2
- Card 2: delay: 0.3
- Card 3: delay: 0.4
- Button 1: delay: 0.5
- Button 2: delay: 0.6

---

## Typography Scale

### Font Sizes (Tailwind)
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px) - Default
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)
text-7xl: 4.5rem (72px) - Large scores
```

### Font Weights
```css
font-medium: 500 (labels, buttons)
font-bold: 700 (headings, emphasis)
```

### Line Heights
```css
line-height: 1.5 (Default for all elements)
leading-relaxed: 1.625 (paragraphs)
```

### Text Hierarchy Examples
- Page Title: `text-3xl font-bold` or `text-4xl font-bold`
- Section Heading: `text-xl font-bold` or `text-2xl font-bold`
- Card Title: `text-lg font-bold` or `text-xl font-bold`
- Metric Label: `text-sm text-gray-600 font-medium`
- Large Number: `text-4xl font-bold` or `text-7xl font-bold`
- Body Text: `text-base text-gray-700`
- Small Text: `text-xs text-gray-500`

---

## Special Effects

### Glassmorphism
```tsx
className="bg-white/20 backdrop-blur rounded-xl"
className="bg-white/10 backdrop-blur rounded-lg"
```

### Gradient Text
```tsx
className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
```

### Shadows
```css
shadow-sm: 0 1px 2px
shadow: 0 1px 3px
shadow-md: 0 4px 6px
shadow-lg: 0 10px 15px
shadow-xl: 0 20px 25px
shadow-2xl: 0 25px 50px
```

### Backdrop Effects
```tsx
className="backdrop-blur"
```

---

## Chart Colors

```css
--chart-1: oklch(0.646 0.222 41.116) - Orange
--chart-2: oklch(0.6 0.118 184.704) - Blue
--chart-3: oklch(0.398 0.07 227.392) - Dark Blue
--chart-4: oklch(0.828 0.189 84.429) - Yellow
--chart-5: oklch(0.769 0.188 70.08) - Amber
```

### Recharts Line Colors
- Overall: `#8b5cf6` (Purple-500)
- Fluency: `#3b82f6` (Blue-500)
- Pacing: `#10b981` (Emerald-500)

---

## Icon Usage

### Icon Library
```tsx
import { IconName } from "lucide-react";
```

### Icon Sizes
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Default: `w-6 h-6` (24px)
- Large: `w-8 h-8` (32px)
- XL: `w-10 h-10` (40px)
- 2XL: `w-12 h-12` (48px)

### Common Icon Pairings
- Flame + Orange (Streak)
- Trophy + Yellow/Purple (Level)
- Target + Amber (Mission)
- Zap + Yellow (XP)
- TrendingUp + Green (Growth)
- Award + Purple (Achievement)

---

## Progress Bars

### Level Progress Bar
```tsx
className="relative h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur"
// Inner bar
className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
```

### Metric Progress Bar
```tsx
className="h-2 bg-gray-200 rounded-full overflow-hidden"
// Inner bar
className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
```

### Small Progress Bar
```tsx
className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
className="h-full bg-purple-600 rounded-full"
```

---

## Responsive Design

### Breakpoints
- Mobile: default
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)

### Common Patterns
```tsx
className="grid md:grid-cols-2 gap-6" // 1 col mobile, 2 cols tablet+
className="grid grid-cols-2 md:grid-cols-4 gap-4" // 2 cols mobile, 4 cols tablet+
className="flex flex-col md:flex-row" // Stack mobile, row tablet+
```
