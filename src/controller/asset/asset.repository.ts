import { IAsset } from "@/interface"

export abstract class AssetRepository {
  abstract create(req: IAsset): Promise<IAsset>
  abstract update(id: string, data: Partial<IAsset>): Promise<IAsset>
  abstract delete(id: string): Promise<IAsset>
  abstract getAll(): Promise<IAsset[]>
  abstract getOne(key: keyof IAsset, id: string): Promise<IAsset>
}
