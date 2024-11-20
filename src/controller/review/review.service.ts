import { IReply, IReview, TotalAndData } from "@/interface"
import { ReviewRepository } from "./review.repository"
import { Product, Reply, Review } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"
import { DeleteResult } from "mongodb"
import { getIdFromNameId } from "@/common/utils"

export class ReviewService implements ReviewRepository {
  async createReview(data: IReview): Promise<IReview> {
    const product = await Product.findById(data.product)
    if (!product) throw new ObjectModelNotFoundException("Product not found")

    const review = await Review.create(data)

    const newRatingCount = product.ratingCount + 1
    const newRatingValue = (product.ratingValue * product.ratingCount + data.rating) / newRatingCount

    // Update the product with the new rating values
    await Product.findByIdAndUpdate(
      data.product,
      {
        $set: {
          ratingValue: Math.round(newRatingValue * 10) / 10,
          ratingCount: newRatingCount
        }
      },
      { new: true } // Return the updated product document
    )

    return review
  }

  async updateReview(reviewId: string, data: Partial<IReview>, requestId: string, role: string): Promise<IReview> {
    const foundReview = await Review.findById(reviewId)

    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")
    // if (foundReview.customer.toString() !== requestId || role !== ERole.ADMIN)
    //   throw new UnauthorizedException("You are not authorized to update this review")

    if (data.rating) {
      const product = await Product.findById(foundReview.product)
      if (!product) throw new ObjectModelNotFoundException("Product not found")
      product.ratingValue =
        (product.ratingValue * product.ratingCount - foundReview.rating + data.rating) / product.ratingCount
      await product.save()
    }

    const updated = await foundReview.updateOne({ $set: data }, { new: true })

    return updated
  }

  async getReviewsById(reviewId: string): Promise<IReview> {
    const foundReview = await Review.findById(reviewId)
      .populate({ path: "customer" })
      .populate({ path: "product" })
      .lean()

    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")

    return foundReview
  }

  async getReviewByProductIdAndCustomerId(productId: string, customerId: string): Promise<IReview> {
    const foundReview = await Review.findOne({ product: productId, customer: customerId })
    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")
    return foundReview
  }

  //get all review and paginate
  async getReviews(page: number, limit: number, keyword?: string): Promise<TotalAndData<IReview>> {
    const reviewQuery = () =>
      Review.find(
        {
          ...(keyword && {
            $or: [{ content: { $regex: keyword, $options: "i" } }]
          })
        },
        {},
        {
          populate: [
            {
              path: "customer",
              select: "name email"
            },
            {
              path: "product",
              select: "name thumbnail"
            }
          ]
        }
      )

    const total = await reviewQuery().countDocuments()
    const reviews = await reviewQuery()
      .skip((page - 1) * limit)
      .limit(limit)

    return {
      total,
      data: reviews
    }
  }

  async getReviewsByProductId(
    productId: string,
    page: number,
    limit: number,
    filterRating?: number
  ): Promise<TotalAndData<IReview>> {
    const processedSlug = getIdFromNameId(productId)
    const reviewQuery = () =>
      Review.find({ product: processedSlug, ...(filterRating && { rating: filterRating }) }).populate({
        path: "customer",
        select: "name email avatar"
      })

    const total = await reviewQuery().countDocuments()
    const reviews = await reviewQuery()
      .skip((page - 1) * limit)
      .limit(limit)

    return {
      total,
      data: reviews
    }
  }
  async getReviewsByCustomerId(customerId: string): Promise<IReview[]> {
    const foundReviews = await Review.find({ customer: customerId })
      // .populate({ path: "product", select: ["name", "price"] })
      .lean()

    return foundReviews
  }
  async deleteReviewById(reviewId: string): Promise<DeleteResult> {
    const foundReview = await Review.findById(reviewId)

    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")

    const product = await Product.findById(foundReview.product)
    if (!product) {
      foundReview.deleteOne()
      throw new ObjectModelNotFoundException("Product in review not found. Review deleted successfully")
    }

    const newRatingCount = product.ratingCount - 1
    const newRatingValue = (product.ratingValue * product.ratingCount - foundReview.rating) / newRatingCount

    // Update the product with the new rating values
    await Product.findByIdAndUpdate(
      foundReview.product,
      {
        $set: {
          ratingValue: Math.round(newRatingValue * 10) / 10,
          ratingCount: newRatingCount
        }
      },
      { new: true } // Return the updated product document
    )

    const deleted = await foundReview.deleteOne()
    return deleted
  }

  async deleteAllReview(): Promise<void> {
    const reviews = await Review.find()
    //set ratingCount and ratingValue to 0
    reviews.forEach(async (review) => {
      await Product.findByIdAndUpdate(review.product, {
        $set: { ratingCount: 0, ratingValue: 0 }
      })
      await review.deleteOne()
    })
  }

  async replyReview(reviewId: string, content: string): Promise<IReview> {
    const foundReview = await Review.findById(reviewId)
    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")

    if (foundReview.reply) {
      foundReview.reply.content = content
    } else {
      const reply: IReply = {
        content,
        likes: []
      }
      foundReview.reply = reply
    }
    await foundReview.save()

    return foundReview
  }

  async likeReview(reviewId: string, userId: string): Promise<IReview> {
    const foundReview = await Review.findById(reviewId)
    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")

    if (foundReview.likes.includes(userId)) {
      foundReview.likes = foundReview.likes.filter((id) => id !== userId)
    } else {
      foundReview.likes.push(userId)
    }

    await foundReview.save()

    return foundReview
  }

  async likeReply(reviewId: string, userId: string): Promise<IReview> {
    const foundReview = await Review.findById(reviewId)
    if (!foundReview) throw new ObjectModelNotFoundException("Review not found")

    if (!foundReview.reply) throw new ObjectModelNotFoundException("Reply not found")

    if (foundReview.reply.likes.includes(userId)) {
      foundReview.reply.likes = foundReview.reply.likes.filter((id) => id !== userId)
    } else {
      foundReview.reply.likes.push(userId)
    }

    await foundReview.save()

    return foundReview
  }

  async getReviewAnalytics(): Promise<ReviewAnalytics> {
    const totalRating = await Review.countDocuments()
    const averageRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ])

    const byRating = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      },
      {
        $project: {
          rating: "$_id",
          count: 1,
          _id: 0
        }
      }
    ])

    const lastWeekReview = await Review.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRating: { $sum: 1 }
        }
      }
    ])

    return {
      averageRating: averageRating[0].averageRating,
      totalRating,
      byRating,
      lastWeekReview: lastWeekReview[0]
    }
  }
}

type ReviewAnalytics = {
  averageRating: number
  totalRating: number
  byRating: { rating: number; count: number }[]
  lastWeekReview: Omit<ReviewAnalytics, "lastWeekReview">
}
