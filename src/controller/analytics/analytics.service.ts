import { Order, Product, User } from "@/models"
import { AnalyticsRepository } from "./analytics.repository"
import { EOrderStatus, ERole } from "@/enum"
import { BadRequestResponse } from "@/common/utils"

export class AnalyticsService implements AnalyticsRepository {
  async summary(): Promise<ISummaryAnalytics> {
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: {
            $in: ["COMPLETED", "DELIVERED"]
          }
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total"
          }
        }
      }
    ])

    const totalOrders = await Order.find().countDocuments()

    const totalCustomers = await User.find({ role: ERole.CUSTOMER }).countDocuments()

    const totalProducts = await Product.find().countDocuments()

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0
    }
  }

  async totalOrderByStatus(req: { startDate: string; endDate: string }): Promise<ITotalOrderByStatus> {
    const startDate = req.startDate ? new Date(req.startDate) : new Date()
    const endDate = req.endDate ? new Date(req.endDate) : new Date(new Date().setDate(new Date().getDate() + 1))

    console.log(startDate, endDate)

    const query = await Order.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])

    const totalOrderByStatus = {
      pending: 0,
      pickingUp: 0,
      delivering: 0,
      canceled: 0,
      delivered: 0,
      completed: 0,
      total: 0
    }

    query.forEach((item) => {
      switch (item._id) {
        case EOrderStatus.PENDING:
          totalOrderByStatus.pending = item.count
          break
        case EOrderStatus.PICKING_UP:
          totalOrderByStatus.pickingUp = item.count
          break
        case EOrderStatus.DELIVERING:
          totalOrderByStatus.delivering = item.count
          break
        case EOrderStatus.CANCELED:
          totalOrderByStatus.canceled = item.count
          break
        case EOrderStatus.DELIVERED:
          totalOrderByStatus.delivered = item.count
          break
        case EOrderStatus.COMPLETED:
          totalOrderByStatus.completed = item.count
          break

        default:
          break
      }
    })

    totalOrderByStatus.total = query.reduce((acc, item) => acc + item.count, 0)
    return totalOrderByStatus
  }

  async orderAnalyticData(startDate: string, endDate: string): Promise<IOrderAnalyticData[]> {
    if (!startDate || !endDate) {
      throw new BadRequestResponse("Start date and end date are required")
    }
    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestResponse("Start date cannot be greater than end date")
    }

    // check length of date range
    // if length of date range is less than 1 month, return data by day
    // if length of date range is less than 6 months , return data by week
    // if length of date range is less than 1 year, return data by month

    const start = new Date(startDate)
    const end = new Date(endDate)

    const diffTime = Math.abs(end.getTime() - start.getTime())

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    console.log(diffDays)

    if (diffDays < 30) {
      return this.orderAnalyticDataByDay(startDate, endDate)
    } else if (diffDays < 180) {
      console.log("vô đây")

      return this.orderAnalyticDataByWeek(startDate, endDate)
    } else {
      return this.orderAnalyticDataByMonth(startDate, endDate)
    }
  }

  async orderAnalyticDataByMonth(startDate: string, endDate: string): Promise<IOrderAnalyticData[]> {
    if (!startDate || !endDate) {
      throw new BadRequestResponse("Start date and end date are required")
    }

    return await Order.aggregate<IOrderAnalyticData>([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%m-%Y",
              date: "$createdAt"
            }
          },
          orderCount: {
            $sum: 1
          },
          totalRevenue: {
            $sum: "$total"
          }
        }
      },
      {
        $project: {
          key: "$_id",
          _id: 0,
          orderCount: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: {
          key: 1
        }
      }
    ])
  }

  async orderAnalyticDataByWeek(startDate: string, endDate: string): Promise<IOrderAnalyticData[]> {
    if (!startDate || !endDate) {
      throw new BadRequestResponse("Start date and end date are required")
    }

    return await Order.aggregate<IOrderAnalyticData>([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt"
            },
            week: {
              $week: "$createdAt"
            }
          },
          totalOrders: {
            $sum: 1
          },
          totalRevenue: {
            $sum: "$total"
          }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          week: "$_id.week",
          key: {
            $concat: ["Week ", { $toString: "$_id.week" }, " - ", { $toString: "$_id.year" }]
          },
          totalOrders: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: {
          year: 1,
          week: 1
        }
      }
    ])
  }

  async orderAnalyticDataByDay(startDate: string, endDate: string): Promise<IOrderAnalyticData[]> {
    if (!startDate || !endDate) {
      throw new BadRequestResponse("Start date and end date are required")
    }

    return await Order.aggregate<IOrderAnalyticData>([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lt: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalOrders: {
            $sum: 1
          },
          totalRevenue: {
            $sum: "$total"
          }
        }
      },
      {
        $project: {
          key: "$_id",
          _id: 0,
          totalOrders: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: {
          key: 1
        }
      }
    ])
  }
}

interface IOrderAnalyticData {
  key: string
  week?: number
  month?: number
  year?: number
  totalOrders: number
  totalRevenue: number
}

interface ISummaryAnalytics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
}

interface ITotalOrderByStatus {
  pending: number
  pickingUp: number
  delivering: number
  canceled: number
  delivered: number
  completed: number
  total: number
}
