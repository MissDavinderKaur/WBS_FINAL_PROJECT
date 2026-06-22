import { Router } from 'express'
import PensionModel, { PensionValidationSchema } from '../models/pension'

const router = Router()

// Create pension (protected)
router.post('/', async (req, res) => {
  try {
    const user = req.user
    const parsedPension = PensionValidationSchema.parse(req.body)
    const pension = await PensionModel.create({
      ...parsedPension,
      userId: user!.id
    })
    return res.status(201).json(pension)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Read pensions for a user (protected)
router.get('/:userId', async (req, res) => {
  try {
    const user = req.user
    const { userId } = req.params
    if (user?.id !== userId) return res.status(403).json({ error: 'Forbidden' })
    const pensionItems = await PensionModel.find({ userId }).exec()
    return res.status(200).json(pensionItems)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// Update pension (protected)
router.put('/:pensionId', async (req, res) => {
  try {
    const user = req.user
    const { pensionId } = req.params
    const existing = await PensionModel.findById(pensionId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    const payload = PensionValidationSchema.parse(req.body)
    existing.currentAge = payload.currentAge
    existing.selectedRetirementAge = payload.selectedRetirementAge
    existing.currentPotSize = payload.currentPotSize
    existing.monthlyContribution = payload.monthlyContribution
    existing.desiredAnnualIncome = payload.desiredAnnualIncome
    await existing.save()
    return res.json(existing)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// Delete pension (protected)
router.delete('/:pensionId', async (req, res) => {
  try {
    const user = req.user
    const { pensionId } = req.params
    const existing = await PensionModel.findById(pensionId).exec()
    if (!existing) return res.status(404).json({ error: 'Not found' })
    if (existing.userId !== user!.id) return res.status(403).json({ error: 'Forbidden' })

    await existing.deleteOne()
    return res.json({ success: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
