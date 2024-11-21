import { cloudinary } from "@/common/utils"
import { UploadRepository } from "./upload.repository"
import { AssetService } from "../asset"
import { Asset } from "@/models"

type ResourceType = "image" | "video" | "raw" | "auto"

export class UploadService implements UploadRepository {
  private readonly assetService: AssetService

  constructor() {
    this.assetService = new AssetService()
  }

  async uploadSingleFile(
    file: Express.Multer.File,
    uploadPreset: string = process.env.CLOUDINARY_UPLOAD_PRESET,
    folder: string = "/",
    resourceType: ResourceType = "auto"
  ): Promise<{
    url: string
  }> {
    const b64 = Buffer.from(file.buffer).toString("base64")
    const dataUri = "data:" + file.mimetype + ";base64," + b64
    const res = await cloudinary.uploader.unsigned_upload(dataUri, uploadPreset, {
      folder: process.env.CLOUDINARY_ROOT_FOLDER + "/" + folder,
      resource_type: resourceType
    })
    return {
      url: res.secure_url
    }
  }
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadPreset: string = process.env.CLOUDINARY_UPLOAD_PRESET,
    folder: string = "/",
    resourceType: ResourceType = "auto"
  ): Promise<{
    urls: string[]
  }> {
    const allFiles = files.map(async (file) => await this.uploadSingleFile(file, uploadPreset, folder, resourceType))
    const res = await Promise.all(allFiles)
    const urls = res.map((r) => r.url)

    const asset = await Asset.findOne({ name: resourceType, folder })

    if (asset) {
      await asset.updateOne(
        {
          $push: {
            assets: urls
          }
        },
        { new: true }
      )
    } else {
      await this.assetService.create({
        folder,
        assets: urls,
        name: resourceType
      })
    }

    return {
      urls
    }
  }
  async uploadUrl(
    url: string,
    uploadPreset: string = process.env.CLOUDINARY_UPLOAD_PRESET,
    folder: string = "/",
    resourceType: ResourceType = "auto"
  ): Promise<{ urls: string[] }> {
    const res = await cloudinary.uploader.unsigned_upload(url, uploadPreset, {
      folder: process.env.CLOUDINARY_ROOT_FOLDER + "/" + folder,
      resource_type: resourceType
    })

    const urls = [res.secure_url]

    const asset = await Asset.findOne({ name: resourceType, folder })

    if (asset) {
      await asset.updateOne(
        {
          $push: {
            assets: urls
          }
        },
        { new: true }
      )
    } else {
      await this.assetService.create({
        folder,
        assets: urls,
        name: resourceType
      })
    }
    return {
      urls
    }
  }
}
