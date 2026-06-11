import { z } from 'zod'
import mongoose from 'mongoose'

export const UserValidationSchema = z.object({
  email: z.string(),
  password: z.string().min(6)
})

export type UserInput = z.infer<typeof UserValidationSchema>

export type UserDocument = mongoose.Document & {
    id: string
    email: string
    password: string
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

const UserModel = mongoose.model<UserDocument>('User', userSchema)
export default UserModel
