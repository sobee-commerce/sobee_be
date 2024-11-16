export interface IPaginate {
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
  nextPage: number | null
  prevPage: number | null
  total: number
  offset: number
  totalElements: number
}

export interface TotalAndData<T> {
  total: number
  data: T[]
}
