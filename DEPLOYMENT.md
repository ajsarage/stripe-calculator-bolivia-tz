# Deployment Instructions

## Setup Environment Variable in Netlify

The calculator needs your Stripe API key to work. Follow these steps:

1. Go to [Netlify Dashboard](https://app.netlify.com/sites/stripe-calculator-b9ca1c04/configuration/env)
2. Click on **"Environment variables"** in the left sidebar
3. Click **"Add a variable"** or **"Add environment variable"**
4. Set:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (starts with `sk_live_` or `sk_test_`)
   - **Scopes**: Select "All scopes" or at least "Functions" and "Builds"
5. Click **"Create variable"** or **"Save"**

## Trigger Deployment

After setting the environment variable:

1. Go to [Deploys](https://app.netlify.com/sites/stripe-calculator-b9ca1c04/deploys)
2. Click **"Trigger deploy"** → **"Deploy site"**

Or simply push any change to the GitHub repository and it will auto-deploy.

## Verify Deployment

Once deployed, test the calculator at:
https://stripe-calculator-b9ca1c04.netlify.app

Enter PIN: `2279`

Select a date range and click "Calculate Earnings" to verify it's working.

## GitHub Repository

The code is now in GitHub at:
https://github.com/ajsarage/stripe-calculator-bolivia-tz

Any changes pushed to the `master` branch will automatically deploy to Netlify.
