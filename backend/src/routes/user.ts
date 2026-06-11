import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/user'

const router = express.Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).exec()

  if (!user) {
    return res.status(404).json({ error: 'No account found' })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return res.status(404).json({ error: 'No account found' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret not configured' })
  }

  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' })

  return res.status(200).json({ token })
})

export default router