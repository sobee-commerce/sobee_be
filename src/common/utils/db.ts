import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
      autoCreate: true
    })
    console.log("MongoDB Connected...")
    return res
  } catch (err: any) {
    console.log(err)
    console.error("DB ERR", err.message)
    process.exit(1)
  }
}

export { connectDB }
