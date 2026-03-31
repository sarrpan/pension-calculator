import { loadStripe } from '@stripe/stripe-js';

// Εδώ θα μπει το κλειδί που ξεκινάει από pk_test_...
// Αν δεν το έχεις ακόμα, άφησέ το κενό ή βάλε ένα τυχαίο string για να μην χτυπάει ο κώδικας.
const stripePromise = loadStripe('pk_test_51TBZmGIH8p4lCEJqzXcmakpyc74T81oE6Tdct6tznIyDKmU9Uutln1BhtcdNWrggJqFqu3VXpNeLgglReIz6Dv7j00RNnHm2Zv');

export default stripePromise;