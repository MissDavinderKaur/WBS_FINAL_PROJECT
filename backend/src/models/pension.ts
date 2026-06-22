import { z } from 'zod'
import mongoose from 'mongoose'

export type PensionDocument = mongoose.Document & {
  userId: string
  currentAge: number
  selectedRetirementAge: number
  currentPotSize: number
  monthlyContribution: number
  desiredAnnualIncome: number
  calculatedPotAtRetirement: number
  calculatedYearsPotWillLast: number
  id: string
}

const pensionSchema = new mongoose.Schema<PensionDocument>(
  {
    userId: { type: String, required: true, index: true },
    currentAge: { type: Number, required: true },
    selectedRetirementAge: { type: Number, required: true },
    currentPotSize: { type: Number, required: true },
    monthlyContribution: { type: Number, required: true },
    desiredAnnualIncome: { type: Number, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

pensionSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

pensionSchema.virtual('calculatedPotAtRetirement').get(function () {
  const annualGrowthRate = parseFloat(process.env.PENSION_ANNUAL_GROWTH_RATE ?? '0.05')
  const monthlyRate = annualGrowthRate / 12
  const months = (this.selectedRetirementAge - this.currentAge) * 12

  if (months <= 0) return Math.round(this.currentPotSize * 100) / 100

  const growthFactor = Math.pow(1 + monthlyRate, months)
  const futureValueOfCurrentPot = this.currentPotSize * growthFactor
  const futureValueOfContributions = this.monthlyContribution * ((growthFactor - 1) / monthlyRate)

  return Math.round((futureValueOfCurrentPot + futureValueOfContributions) * 100) / 100
})

pensionSchema.virtual('calculatedYearsPotWillLast').get(function () {
  const annualGrowthRate = parseFloat(process.env.PENSION_ANNUAL_GROWTH_RATE ?? '0.05')
  const annualInflationRate = parseFloat(process.env.PENSION_ANNUAL_INFLATION_RATE ?? '0.02')

  const monthlyRate = annualGrowthRate / 12
  const months = (this.selectedRetirementAge - this.currentAge) * 12
  if (months <= 0) return 0

  const growthFactor = Math.pow(1 + monthlyRate, months)
  const futureValueOfCurrentPot = this.currentPotSize * growthFactor
  const futureValueOfContributions = this.monthlyContribution * ((growthFactor - 1) / monthlyRate)
  const potAtRetirement = futureValueOfCurrentPot + futureValueOfContributions

  // Real return accounts for inflation eroding purchasing power of withdrawals
  const realAnnualRate = (1 + annualGrowthRate) / (1 + annualInflationRate) - 1

  if (potAtRetirement <= 0 || this.desiredAnnualIncome <= 0) return 0

  if (Math.abs(realAnnualRate) < 0.0001) {
    return Math.round((potAtRetirement / this.desiredAnnualIncome) * 10) / 10
  }

  const ratio = potAtRetirement * realAnnualRate / this.desiredAnnualIncome
  if (ratio >= 1) return 999 // pot grows faster than withdrawals — effectively infinite

  const years = -Math.log(1 - ratio) / Math.log(1 + realAnnualRate)
  return Math.round(years * 10) / 10
})

export const PensionValidationSchema = z.object({
  currentAge: z.number().int().min(18).max(80),
  selectedRetirementAge: z.number().int().min(55).max(90),
  currentPotSize: z.number().min(0),
  monthlyContribution: z.number().min(0),
  desiredAnnualIncome: z.number().positive()
}).refine(data => data.selectedRetirementAge > data.currentAge, {
  message: 'Retirement age must be greater than current age',
  path: ['selectedRetirementAge']
})

export type PensionInput = z.infer<typeof PensionValidationSchema>

const PensionModel = mongoose.model<PensionDocument>('Pension', pensionSchema)
export default PensionModel
