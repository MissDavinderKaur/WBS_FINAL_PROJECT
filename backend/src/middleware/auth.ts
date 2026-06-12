import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or invalid' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret not configured' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    const payload = jwt.verify(token, secret) as any
    ;(req as any).user = payload
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Authorization token invalid' })
  }
}

export default authMiddleware
