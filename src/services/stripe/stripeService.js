import { loadStripe } from '@stripe/stripe-js';
import { isPaidServiceLive } from '../../config/paidService';

const publishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = isPaidServiceLive && publishableKey ? loadStripe(publishableKey).catch(() => null) : null;

export default stripePromise;
