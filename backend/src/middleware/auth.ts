import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const publicPaths = ['/api/users/login']

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (publicPaths.includes(req.path)) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or invalid' })
  }

  const token = authHeader.replace('Bearer ', '')
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret not configured' })
  }

  try {
    jwt.verify(token, secret)
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Authorization token invalid' })
  }
}

export default authMiddleware
