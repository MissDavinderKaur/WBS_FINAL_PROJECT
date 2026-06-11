import { Router } from 'express'
import ExpenseModel, { ExpenseValidationSchema } from '../models/expense'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parseResult = ExpenseValidationSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid expense data', errors: parseResult.error.issues })
    }

    const expense = await ExpenseModel.create({
      ...parseResult.data,
      userId
    })

    return res.status(201).json(expense)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Failed to create expense' })
  }
})

router.get('/:userId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId || userId !== req.params.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const expenses = await ExpenseModel.find({ userId }).lean()
    return res.status(200).json(expenses)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Failed to fetch expenses' })
  }
})

router.put('/:expenseId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const parseResult = ExpenseValidationSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid expense data', errors: parseResult.error.issues })
    }

    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: req.params.expenseId, userId },
      parseResult.data,
      { new: true }
    )

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or not owned by user' })
    }

    return res.status(200).json(expense)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Failed to update expense' })
  }
})

router.delete('/:expenseId', async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const expense = await ExpenseModel.findOneAndDelete({ _id: req.params.expenseId, userId })
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or not owned by user' })
    }

    return res.status(200).json({ message: 'Expense deleted' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Failed to delete expense' })
  }
})

export default router
