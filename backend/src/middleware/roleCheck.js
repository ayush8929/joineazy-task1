/**
 * Restricts a route to a specific role. Must run after requireAuth,
 * since it depends on req.user being set.
 *
 * Usage: router.post('/assignments', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Requires ${role} role.` });
    }
    next();
  };
}
