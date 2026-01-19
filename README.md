# Stripe Calculator - Bolivia Timezone

A Stripe payment calculator that converts net income to Bolivianos (BOB) with proper Bolivia timezone (GMT-4) support.

## Features

- 📅 **Bolivia Timezone Support** - Queries use Bolivia local time (GMT-4) instead of UTC
- 💰 **Accurate Fee Calculation** - Calculates Stripe fees (2.9% + $0.30 per transaction)
- 🇧🇴 **BOB Conversion** - Converts USD to Bolivianos using current exchange rate
- 🔒 **PIN Protected** - Secure access with PIN code
- 📊 **Date Range Queries** - Query transactions by date range

## How It Works

When you select a date (e.g., Jan 18), the calculator:
1. Converts the date from Bolivia time (GMT-4) to UTC
2. Queries Stripe for all succeeded payment intents in that date range
3. Calculates gross revenue, Stripe fees, and net income
4. Converts the result to Bolivianos

## Deployment

This site is deployed on Netlify and connected to this GitHub repository.

### Environment Variables

The following environment variable needs to be set in Netlify:

- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_live_` or `sk_test_`)

**Note:** Currently the key is hardcoded in the function as a fallback. For production, it's recommended to set it as an environment variable in Netlify.

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set your Stripe key in `netlify/functions/fetch-stripe-data.js`
4. Run locally: `netlify dev`

## Files

- `index.html` - Frontend calculator interface
- `netlify/functions/fetch-stripe-data.js` - Backend function that queries Stripe API
- `package.json` - Dependencies (stripe SDK)

## Timezone Fix

The key fix is in the date conversion:

```javascript
// Bolivia timezone (GMT-4)
const startDateObj = new Date(startDate + 'T00:00:00-04:00');
const endDateObj = new Date(endDate + 'T23:59:59-04:00');
```

This ensures that when you select "Jan 18", it queries for transactions that occurred on Jan 18 in Bolivia time, not UTC time.
