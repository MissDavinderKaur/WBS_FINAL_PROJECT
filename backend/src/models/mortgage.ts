import { z } from 'zod'
import mongoose from 'mongoose'

export type MortgageDocument = mongoose.Document & {
  userId: string
  originalLoanAmount: number
  annualInterestRate: number
  mortgageStartDate: Date
  standardMonthlyRepayment: number
  remainingBalance: number
  id: string
}

const mortgageSchema = new mongoose.Schema<MortgageDocument>(
  {
    userId: { type: String, required: true, index: true },
    originalLoanAmount: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    mortgageStartDate: { type: Date, required: true },
    standardMonthlyRepayment: { type: Number, required: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

mortgageSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

mortgageSchema.virtual('remainingBalance').get(function () {
  const r = this.annualInterestRate / 12
  const now = new Date()
  const start = new Date(this.mortgageStartDate)
  const monthsPaid = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())

  if (monthsPaid <= 0) return Math.round(this.originalLoanAmount * 100) / 100

  const factor = Math.pow(1 + r, monthsPaid)
  const balance = this.originalLoanAmount * factor - this.standardMonthlyRepayment * (factor - 1) / r
  return Math.max(0, Math.round(balance * 100) / 100)
})

export const MortgageValidationSchema = z.object({
  originalLoanAmount: z.number().positive(),
  annualInterestRate: z.number().min(0).max(1),
  mortgageStartDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Date must be in DD-MM-YYYY format'),
  standardMonthlyRepayment: z.number().positive()
})

export type MortgageInput = z.infer<typeof MortgageValidationSchema>

const MortgageModel = mongoose.model<MortgageDocument>('Mortgage', mortgageSchema)
export default MortgageModel
