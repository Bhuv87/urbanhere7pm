# Bengaluru Digital Twin — Local VS Code Setup Guide

Follow these quick steps to run the project locally in VS Code.

---

## 1. Quick Download or Extract

You can download the bundled project archive directly from your running applet:
- Download URL: `/bengaluru-digital-twin.tar.gz` (e.g. `http://localhost:3000/bengaluru-digital-twin.tar.gz` or your app URL)
- Or extract via terminal:
  ```bash
  tar -xzf bengaluru-digital-twin.tar.gz -C bengaluru-digital-twin
  cd bengaluru-digital-twin
  ```

---

## 2. Requirements

- **Node.js**: v18+ (Node v20 or v22 recommended)
- **npm** or **bun** or **pnpm**

---

## 3. Install & Run in VS Code

1. Open the folder in VS Code:
   ```bash
   code .
   ```
2. Open the integrated terminal (`Ctrl + ~` or `Cmd + ~`) and install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Run Unit Tests

To run the unit tests (geometry generator, clash detection, solar angle calculation, and zoning compliance):

```bash
npx tsx --test src/utils/rules.test.ts
```

---

## 5. Production Build

To test the production build:

```bash
npm run build
npm run preview
```

---

## 6. Project Architecture

- `src/App.tsx`: Stage router (`Onboarding` vs `Explore`).
- `src/components/Onboarding.tsx`: BBMP Ward & Corridor selector with 1-click boot.
- `src/components/TopBar.tsx`: Corridor switcher, Area view toggle, Explode toggle, Export menu.
- `src/components/Sidebar/`: CAD/BIM tools (Pipe builder, House cards, GIS Legend, STEP CAD uploader, Solar simulator).
- `src/components/Scene/`: Three.js / React Three Fiber 3D viewport:
  - `Street.tsx`, `Road.tsx`, `Sidewalk.tsx`: 3D road with GSAP vertical explode animation.
  - `PreExistingUtility.tsx`: Real volumetric PBR utilities (BWSSB, GAIL, BESCOM, Telecom).
  - `PlacedPipe.tsx`, `PipeSegment.tsx`, `PipeElbow.tsx`, `PipeFlange.tsx`: Parametric pipe geometry.
  - `PlacedHouse.tsx`, `GhostHouse.tsx`: Grid-snapped 3D house builder with plot validation.
  - `ClashBadge.tsx`: 3D spatial intersection alert torus and tags.
  - `CADBuilding.tsx`, `ZoningHUD.tsx`: .STEP CAD import and BBMP zoning check.
  - `SunLight.tsx`, `SolarPanelMesh.tsx`: SunCalc-driven Bengaluru solar tracking and shadow detection.
- `src/utils/`: Pure decoupled math engines (`clashDetection.ts`, `pipeGenerator.ts`, `zoning.ts`, `solar.ts`, `exportPNG.ts`, `exportGeoJSON.ts`).
