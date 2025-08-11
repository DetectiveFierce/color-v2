# Color Editor

A modern color palette editor built with Next.js, featuring advanced color picking, palette management, and accessibility tools.

## Features

- Advanced color picker with multiple formats (HEX, RGB, HSL, CMYK)
- Palette management with drag-and-drop functionality
- Color harmony generation (complementary, triadic, analogous)
- Accessibility testing and contrast checking
- Export to various formats (CSS, Tailwind, TypeScript)
- Dark/light theme support
- Responsive design

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build for Production

```bash
pnpm build
pnpm start
```

## Deploy on Vercel

This project is optimized for Vercel deployment. To deploy:

1. **Connect your repository** to Vercel
2. **Import the project** - Vercel will auto-detect Next.js settings
3. **Deploy** - The build will use the optimized configuration

### Environment Variables

No environment variables are required for basic functionality. The app uses client-side storage for palettes.

### Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Color Picker**: react-colorful
- **State Management**: React hooks
- **Package Manager**: pnpm

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments)
