import { env } from "node:process"
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      PORT: number
      ALLOWED_ORIGIN: string
      ACCESS_TOKEN_EXPIRES_IN: string
      REFRESH_TOKEN_EXPIRES_IN: string
      MINIO_ENDPOINT: string
      MINIO_PORT: string
      MINIO_ACCESS_KEY: string
      MINIO_SECRET_KEY: string
      MINIO_USE_SSL: string

      CLOUDINARY_UPLOAD_PRESET: string
      CLOUDINARY_CLOUD_NAME: string
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string
      CLOUDINARY_URL: string
      CLOUDINARY_TIMESTAMP: string
      CLOUDINARY_ROOT_FOLDER: string
    }
  }
}
