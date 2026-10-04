# VELLORE Load Testing Suite (k6)

This directory contains automated stress and load testing scripts designed to validate that VELLORE maintains sub-500ms p95 latency under high concurrent buyer volume.

## Prerequisites

1. Install k6:
   - **Windows**: `winget install k6` or `choco install k6`
   - **macOS**: `brew install k6`
   - **Linux**: `sudo apt-get install k6`

## Running the Catalog & Edge Cache Test

Ensure your Next.js application is running (`npm run build && npm run start` or `npm run dev`):

```bash
# Run against local server
k6 run scripts/k6-load-test.js

# Or test against a deployed URL (e.g. Vercel)
k6 run -e BASE_URL="https://your-domain.com" scripts/k6-load-test.js
```

## Target Thresholds

- **p(95) < 500ms**: 95% of cached storefront page hits (`/`, `/shop`, `/watches/[slug]`) served in under 500ms.
- **Failed Requests < 1%**: Near-zero failure rate during spikes to 300 concurrent simulated buyers.
