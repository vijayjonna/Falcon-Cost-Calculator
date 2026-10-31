# Implementation Plan - Architectural Blueprint Falcon Emblem

Create an original, bespoke vector SVG logo inspired by the reference image, rendered in the exact architectural blueprint slate-navy tone (`#184572` / `#1b4b7e`) with a clean transparent background and crisp architectural crosshair drafting lines.

## Proposed Changes

### 1. Vector Emblem Design & Precision Paths
- **Falcon Silhouette in Upward Flight**:
  - Distinct upward-angled aerodynamic stance facing right.
  - Multi-tier swept wing with 3 feather blades separated by crisp negative-space kerf cuts.
  - Clean vertical drafting kerf separating the wing and torso.
  - Sharp, geometric predator head with defined crest, focused eye notch, and hooked beak.
  - Swept underbody leading into a downward-pointing tail fin.
- **Architectural Drafting Framework**:
  - Top and bottom horizontal framing lines extending past the vertical framing mark with drafting crosshairs/extension intersections.
  - Right vertical drafting guide with extension lines mimicking CAD/blueprint crop marks.
  - Open left side allowing the falcon's wings to dynamically break out of the blueprint boundary box.
- **Color Palette & Transparency**:
  - Primary Tone: Slate Blueprint Navy (`#184572` / `#1E4E80`) matching the uploaded reference image.
  - Dark Mode Adaptation: Maintains the slate blueprint navy tone with subtle adaptive luminance (`#60A5FA` / `#93C5FD` accents or glowing contrast where appropriate for dark mode support, while preserving the authentic blueprint blue in standard views).
  - Background: 100% transparent vector rendering with no background box or tint.

### 2. Component Updates (`src/components/FalconLogo.tsx`)
- Replace the current framing-square icon with the new architectural blueprint falcon emblem.
- Retain scalable props: `size`, `className`, `variant` ('full' with typography, 'mark-only', 'icon'), and theme support.
- Ensure crisp rendering at 32px, 48px, 64px, and larger display sizes.

### 3. Vector Favicon / App Icon (`public/icon.svg`)
- Update `public/icon.svg` with the new transparent blueprint falcon emblem for browser tabs and web app manifests.

## Verification Plan
1. **Visual & Structural Audit**:
   - Verify logo geometry and transparency against light and dark theme backgrounds in `src/App.tsx`.
   - Confirm crisp path alignment and scale consistency across navbar and hero sections.
2. **Build & Lint Verification**:
   - Run `lint_applet` and `compile_applet` to confirm zero TypeScript or SVG path syntax errors.
   - Verify dev server responsiveness.
