import { loadStripe } from '@stripe/stripe-js';

const publishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = publishableKey ? loadStripe(publishableKey).catch(() => null) : null;

export default stripePromise;
