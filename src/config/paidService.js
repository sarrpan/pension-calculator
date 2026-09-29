// Only an explicit live value enables the paid service. This is a build-time UI
// setting; Firebase independently enforces PAID_SERVICE_MODE on every paid action.
export const paidServiceMode = import.meta.env.VITE_PAID_SERVICE_MODE === 'live'
  ? 'live'
  : 'prelaunch';
export const isPaidServiceLive = paidServiceMode === 'live';
