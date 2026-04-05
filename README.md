# 3D Building Builder

An interactive web application for generating and randomising 3D building models that can be exported as STL files for 3D printing.

## Features

- **Procedural building generation** – create unique buildings using sliders and dropdowns
- **Multiple building styles** – rectangular, stepped (e.g. Art-Deco setbacks), and tapered towers
- **Four roof styles** – flat, pitched, dome, and pyramid
- **Configurable details** – window density, antenna / spire, balconies
- **One-click randomisation** – generate a completely random building with a single button press
- **Reproducible seeds** – every random building has a numeric seed so you can re-create it later
- **STL export** – download the model as a binary STL file ready to send to a 3D printer

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Usage

1. Adjust the sliders and dropdowns in the left panel to shape your building.
2. Click **🎲 Randomize** to generate a random building.
3. Note down the **Seed** value if you want to reproduce that building later.
4. Click **⬇️ Export STL** to download the model as an STL file.
5. Open the STL file in your preferred slicer software (PrusaSlicer, Cura, Bambu Studio, etc.) and 3D print away!

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/) for 3D rendering
- [Vite](https://vite.dev/) for fast development and bundling
