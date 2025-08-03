const { verifyToken } = require('@clerk/backend');

// Clerk JWT verification middleware
async function requireAuth(req, res, next) {
  console.log('Authorization header:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  try {
    const token = authHeader.split(' ')[1];
    
    // This is the correct way to call the function.
    // We pass an options object that explicitly uses the environment variable.
    const payload = await verifyToken(token, { 
      jwtKey: process.env.CLERK_JWT_KEY 
    });

    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    // Add more detail to your error logging for future debugging
    return res.status(401).json({ error: 'Invalid token', details: err.message, reason: err.reason });
  }
}

module.exports = { requireAuth }; 