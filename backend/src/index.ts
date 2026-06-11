import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
