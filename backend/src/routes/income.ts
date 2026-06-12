import { Router } from 'express'
import IncomeModel, { IncomeValidationSchema } from '../models/income'

const router = Router()

// Create income (protected)
router.post('/', async (req, res) => {
  try {
    const user = req.user
    const parsedIncome = IncomeValidationSchema.parse(req.body)
    const income = await IncomeModel.create({ ...parsedIncome, userId: user!.id })
    return res.status(201).json(income)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Read incomes for a user (protected)
router.get('/:userId', async (req, res) => {
  try {
    const user = req.user
    const { userId } = req.params
    if (user?.id !== userId) return res.status(403).json({ error: 'Forbidden' })
    const incomeItems = await IncomeModel.find({ userId }).exec()
    return res.status(200).json(incomeItems)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Update income (protected)
router.put('/:incomeId', async (req, res) => {
  try {
    const user = req.user
    const { incomeId } = req.params
    const existing = await IncomeModel.findById(incomeId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    const payload = IncomeValidationSchema.parse(req.body)
    existing.description = payload.description
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
    const user = req.user
    const { incomeId } = req.params
    const existing = await IncomeModel.findById(incomeId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    await existing.deleteOne()
    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
