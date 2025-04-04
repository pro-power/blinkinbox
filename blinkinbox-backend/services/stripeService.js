// services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

module.exports = {
  // Process subscription payment
  async processSubscription(email, paymentMethodId) {
    try {
      // Create or get customer
      let customer;
      
      // Try to find existing customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          }
        });
      }
      
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });
      
      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: process.env.STRIPE_PREMIUM_PRICE_ID, // Premium plan price ID
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Check subscription status
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        return {
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
        };
      } else {
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice.payment_intent;
        
        return {
          success: false,
          error: 'Payment failed',
          paymentIntentId: paymentIntent.id,
          paymentIntentStatus: paymentIntent.status,
        };
      }
    } catch (error) {
      logger.error('Stripe subscription error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      
      return {
        success: true,
        status: subscription.status,
      };
    } catch (error) {
      logger.error('Stripe cancellation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
};