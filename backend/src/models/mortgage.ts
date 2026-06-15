import { z } from 'zod'
import mongoose from 'mongoose'

export type MortgageDocument = mongoose.Document & {
  userId: string
  originalLoanAmount: number
  annualInterestRate: number
  mortgageStartDate: Date
  standardMonthlyRepayment: number
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

export const MortgageValidationSchema = z.object({
  originalLoanAmount: z.number().positive(),
  annualInterestRate: z.number().min(0).max(1),
  mortgageStartDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, 'Date must be in DD-MM-YYYY format'),
  standardMonthlyRepayment: z.number().positive()
})

export type MortgageInput = z.infer<typeof MortgageValidationSchema>

const MortgageModel = mongoose.model<MortgageDocument>('Mortgage', mortgageSchema)
export default MortgageModel
