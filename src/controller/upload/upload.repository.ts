export abstract class UploadRepository {
  abstract uploadSingleFile(
    file: Express.Multer.File,
    uploadPreset?: string,
    folder?: string,
    resourceType?: string
  ): Promise<{
    url: string
  }>
  abstract uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadPreset?: string,
    folder?: string,
    resourceType?: string
  ): Promise<{
    urls: string[]
  }>
  abstract uploadUrl(
    url: string,
    uploadPreset?: string,
    folder?: string,
    resourceType?: string
  ): Promise<{
    urls: string[]
  }>
}
