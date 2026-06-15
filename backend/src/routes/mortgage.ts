import { Router } from 'express'
import MortgageModel, { MortgageValidationSchema } from '../models/mortgage'

const router = Router()

// Create mortgage (protected)
router.post('/', async (req, res) => {
  try {
    const user = req.user
    const parsedMortgage = MortgageValidationSchema.parse(req.body)
    const [day, month, year] = parsedMortgage.mortgageStartDate.split('-').map(Number)
    const mortgage = await MortgageModel.create({
      ...parsedMortgage,
      mortgageStartDate: new Date(year, month - 1, day),
      userId: user!.id
    })
    return res.status(201).json(mortgage)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Read mortgages for a user (protected)
router.get('/:userId', async (req, res) => {
  try {
    const user = req.user
    const { userId } = req.params
    if (user?.id !== userId) return res.status(403).json({ error: 'Forbidden' })
    const mortgageItems = await MortgageModel.find({ userId }).exec()
    return res.status(200).json(mortgageItems)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Update mortgage (protected)
router.put('/:mortgageId', async (req, res) => {
  try {
    const user = req.user
    const { mortgageId } = req.params
    const existing = await MortgageModel.findById(mortgageId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    const payload = MortgageValidationSchema.parse(req.body)
    const [day, month, year] = payload.mortgageStartDate.split('-').map(Number)
    existing.originalLoanAmount = payload.originalLoanAmount
    existing.annualInterestRate = payload.annualInterestRate
    existing.mortgageStartDate = new Date(year, month - 1, day)
    existing.standardMonthlyRepayment = payload.standardMonthlyRepayment
    await existing.save()
    return res.json(existing)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Delete mortgage (protected)
router.delete('/:mortgageId', async (req, res) => {
  try {
    const user = req.user
    const { mortgageId } = req.params
    const existing = await MortgageModel.findById(mortgageId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    await existing.deleteOne()
    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
