const MESSAGES: Record<string, string> = {
  'not-signed-in': 'Sign in to continue.',
  'workout-not-found': 'That workout no longer exists.',
  'workout-not-active': 'This workout was already finished.',
  'bad-category': 'Pick a workout type.',
  'bad-duration': 'Pick a valid duration.',
  'future-workout': 'A workout cannot start in the future.',
  'cannot-friend-self': 'That is you.',
  'user-not-found': 'No one by that name.',
  'cannot-challenge-self': 'You cannot challenge yourself.',
  'bad-metric': 'Pick what to compete on.',
  'not-friends': 'You can only challenge accepted friends.',
  'challenge-exists': 'You already have an open challenge with them.',
  'challenge-not-found': 'That challenge is gone.',
  'challenge-not-pending': 'That invite was already answered.',
  'prize-not-found': 'That prize is no longer available.',
  'out-of-stock': 'That prize is out of stock.',
  'insufficient-points': 'Not enough points yet. Keep training.',
  'rank-too-low': 'You need a top finish in the last completed period to claim this.',
  'already-claimed': 'You already claimed this for that period.',
}

/** Turns a raised Postgres exception code from schema.sql into a sentence. */
export function friendlyError(message: string | undefined | null) {
  if (!message) return 'Something went wrong.'
  return MESSAGES[message] ?? message
}
