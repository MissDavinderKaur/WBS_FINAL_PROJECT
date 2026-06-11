import express from 'express'
import { z } from 'zod'
import IncomeModel, { IncomeValidationSchema } from '../models/income'

const router = express.Router()

// Create income (protected)
router.post('/', async (req, res) => {
  try {
    const payload = IncomeValidationSchema.parse(req.body)
    const user = (req as any).user
    if (!user || !user.id) return res.status(401).json({ error: 'Unauthorized' })

    const doc = await IncomeModel.create({ ...payload, userId: user.id })
    return res.status(201).json(doc)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Read incomes for a user (protected)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const user = (req as any).user
    if (!user || user.id !== userId) return res.status(403).json({ error: 'Forbidden' })

    const items = await IncomeModel.find({ userId }).exec()
    return res.json(items)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Update income (protected)
router.put('/:incomeId', async (req, res) => {
  try {
    const { incomeId } = req.params
    const user = (req as any).user
    if (!user || !user.id) return res.status(401).json({ error: 'Unauthorized' })

    const existing = await IncomeModel.findById(incomeId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    const payload = IncomeValidationSchema.parse(req.body)
    existing.label = payload.label
    existing.amount = payload.amount
    existing.frequency = payload.frequency
    await existing.save()
    return res.json(existing)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Delete income (protected)
router.delete('/:incomeId', async (req, res) => {
  try {
    const { incomeId } = req.params
    const user = (req as any).user
    if (!user || !user.id) return res.status(401).json({ error: 'Unauthorized' })

    const existing = await IncomeModel.findById(incomeId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user.id) return res.status(403).json({ error: 'Forbidden' })

    await existing.deleteOne()
    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
