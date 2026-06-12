import { Router } from 'express'
import ExpenseModel, { ExpenseValidationSchema } from '../models/expense'

const router = Router()

// Create expense (protected)
router.post('/', async (req, res) => {
  try {
    const user = req.user
    const parsedExpense = ExpenseValidationSchema.safeParse(req.body)
    const expense = await ExpenseModel.create({...parsedExpense, userId:user!.id })
    return res.status(201).json(expense)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Read expenses for a user (protected)
router.get('/:userId', async (req, res) => {
  try {
    const user = req.user
    const { userId } = req.params
    if (user?.id !== userId) return res.status(403).json({ error: 'Forbidden' })
    const expenseItems = await ExpenseModel.find({ userId }).exec()
    return res.status(200).json(expenseItems)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Update expense (protected)
router.put('/:expenseId', async (req, res) => {
  try {
    const user = req.user
    const { expenseId } = req.params
    const existing = await ExpenseModel.findById(expenseId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    const payload = ExpenseValidationSchema.parse(req.body)
    existing.label = payload.label
    existing.amount = payload.amount
    existing.type = payload.type
    existing.category = payload.category
    await existing.save()
    return res.json(existing)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Delete expense (protected)
router.delete('/:expenseId', async (req, res) => {
  try {
    const user = req.user
    const { expenseId } = req.params
    const existing = await ExpenseModel.findById(expenseId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    await existing.deleteOne()
    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
