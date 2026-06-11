import express from "express";
import UserModel from '../models/user'

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await UserModel.findOne({ email: email.toLowerCase().trim(), password }).exec()

  if (!user) {
    return res.status(404).json({ error: 'No account found' })
  }

  return res.status(200).json({ id: user.id, email: user.email })
})

export default router