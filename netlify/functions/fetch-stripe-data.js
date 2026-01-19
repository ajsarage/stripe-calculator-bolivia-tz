const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { startDate, endDate } = JSON.parse(event.body);

    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing startDate or endDate' }),
      };
    }

    // FIXED: Convert dates from Bolivia timezone (GMT-4) to UTC timestamps
    // Bolivia is UTC-4, so we need to add 4 hours to get UTC time
    
    // Parse the date strings and treat them as Bolivia time
    // Start of day in Bolivia: 00:00:00 BOT = 04:00:00 UTC
    const startDateObj = new Date(startDate + 'T00:00:00-04:00');
    const startTimestamp = Math.floor(startDateObj.getTime() / 1000);
    
    // End of day in Bolivia: 23:59:59 BOT = 03:59:59 UTC (next day)
    const endDateObj = new Date(endDate + 'T23:59:59-04:00');
    const endTimestamp = Math.floor(endDateObj.getTime() / 1000);

    console.log(`Fetching transactions from ${startDate} to ${endDate}`);
    console.log(`Unix timestamps: ${startTimestamp} to ${endTimestamp}`);

    // Fetch ALL payment intents with pagination
    let allPaymentIntents = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params = {
        limit: 100,
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
      };

      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await stripe.paymentIntents.list(params);
      allPaymentIntents = allPaymentIntents.concat(response.data);
      
      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    console.log(`Found ${allPaymentIntents.length} total payment intents`);

    // Filter for succeeded payments only
    const succeededPayments = allPaymentIntents.filter(
      (pi) => pi.status === 'succeeded'
    );

    console.log(`${succeededPayments.length} succeeded payments`);

    // Calculate totals
    const transactionCount = succeededPayments.length;
    const grossRevenue = succeededPayments.reduce((sum, pi) => sum + pi.amount, 0) / 100;

    // Stripe fee calculation: 2.9% + $0.30 per transaction
    const stripeFees = succeededPayments.reduce((sum, pi) => {
      const amount = pi.amount / 100;
      const fee = amount * 0.029 + 0.30;
      return sum + fee;
    }, 0);

    const netUSD = grossRevenue - stripeFees;

    // Convert to Bolivianos (BOB)
    const exchangeRate = 6.96; // 1 USD = 6.96 BOB
    const netBOB = netUSD * exchangeRate;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        transactionCount,
        grossRevenue: parseFloat(grossRevenue.toFixed(2)),
        stripeFees: parseFloat(stripeFees.toFixed(2)),
        netUSD: parseFloat(netUSD.toFixed(2)),
        netBOB: parseFloat(netBOB.toFixed(2)),
        dateRange: {
          start: startDate,
          end: endDate,
          startTimestamp,
          endTimestamp,
        },
      }),
    };
  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch Stripe data',
        message: error.message,
      }),
    };
  }
};
