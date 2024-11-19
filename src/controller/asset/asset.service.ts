import { IAsset } from "@/interface"
import { AssetRepository } from "./asset.repository"
import { Asset } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"

export class AssetService implements AssetRepository {
  async create(req: IAsset): Promise<IAsset> {
    return await Asset.create(req)
  }
  async update(id: string, data: Partial<IAsset>): Promise<IAsset> {
    const updated = await Asset.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!updated) throw new ObjectModelNotFoundException()
    return updated
  }
  async delete(id: string): Promise<IAsset> {
    const deleted = await Asset.findByIdAndDelete(id)
    if (!deleted) throw new ObjectModelNotFoundException()
    return deleted
  }
  async getAll(): Promise<IAsset[]> {
    const assets = await Asset.find()
    return assets
  }

  async getByType(type: string, folder: string): Promise<IAsset> {
    const parsedFolderNameFromUrl = decodeURIComponent(folder)
    console.log({ parsedFolderNameFromUrl })
    const asset = await Asset.findOne({ name: type, folder: parsedFolderNameFromUrl })
    if (!asset) throw new ObjectModelNotFoundException("Asset not found")
    return asset
  }

  async getOne(key: keyof IAsset, id: string): Promise<IAsset> {
    const asset = await Asset.findOne({
      [key]: id
    })
    if (!asset) throw new ObjectModelNotFoundException()
    return asset
  }
  async insecureGetOne(key: keyof IAsset, id: string): Promise<IAsset | null> {
    return await Asset.findOne({
      [key]: id
    })
  }
}
