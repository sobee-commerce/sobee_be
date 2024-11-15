import { IPaginate } from "@/interface"

export const paginate = async (page: number, limit: number, total: number): Promise<IPaginate> => {
  try {
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    const nextPage = hasNextPage ? page + 1 : null
    const prevPage = hasPrevPage ? page - 1 : null
    const offset = (page - 1) * limit
    return Promise.resolve({
      hasNext: hasNextPage,
      hasPrev: hasPrevPage,
      offset,
      limit,
      page,
      total: totalPages,
      nextPage,
      prevPage,
      totalElements: total
    } as IPaginate)
  } catch (error) {
    return Promise.reject(error)
  }
}
