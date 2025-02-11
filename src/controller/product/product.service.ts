import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { generateNameId, getIdFromNameId, redisClient } from "@/common/utils"
import { EOrderStatus, EProductType, ERole } from "@/enum"
import { IProduct, IVariant, TotalAndData } from "@/interface"
import { Order, Product, User } from "@/models"
import { DeleteResult } from "mongodb"
import { BrandService } from "../brand"
import { CategoryService } from "../category"
import { CreateProductRequest } from "./dto"
import { ProductRepository } from "./product.repository"
import { sendMail } from "@/common/utils/mailer"
import { NotificationService } from "../notification/notification.service"

export class ProductService implements ProductRepository {
  private readonly categoryService: CategoryService
  private readonly brandService: BrandService

  private readonly generalPopulate = {
    populate: [
      {
        path: "category",
        select: "name slug"
      },
      {
        path: "variants"
      },
      {
        path: "brand",
        select: "name logo"
      },
      {
        path: "tax",
        select: "name rate"
      },
      {
        path: "shippingFee"
      }
    ]
  }

  constructor() {
    this.categoryService = new CategoryService()
    this.brandService = new BrandService()
  }
  async getProductsAndCustomerInOrder(): Promise<any> {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: [EOrderStatus.COMPLETED, EOrderStatus.DELIVERED] }
        }
      },
      {
        $unwind: "$orderItems"
      },
      {
        $group: {
          _id: "$orderItems.product",
          customers: {
            $addToSet: "$orderItems.customer"
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $lookup: {
          from: "categories",
          localField: "category.parent",
          foreignField: "_id",
          as: "parentCategory"
        }
      },
      {
        $unwind: "$parentCategory"
      },
      {
        $project: {
          productId: "$_id",
          customers: 1,
          category: "$parentCategory.name",
          _id: 0
        }
      }
    ])
  }

  async create(req: CreateProductRequest): Promise<IProduct> {
    const { category, variants, type, brand } = req
    const _variants = (variants as IVariant[]) || []
    await this.categoryService.getOne("_id", category.toString())
    brand && (await this.brandService.getOne("_id", brand.toString()))
    const minPrice = Math.min(..._variants.map((v) => v.price))
    const maxPrice = Math.max(..._variants.map((v) => v.price))
    const product = new Product({
      ...req,
      minPrice,
      maxPrice,
      variants: [],
      brand: brand || null
    })

    const slug = generateNameId({
      name: product.name,
      id: product._id?.toString() as string
    })

    product.slug = slug

    if (type === EProductType.VARIABLE) {
      if (!variants || variants.length === 0) {
        throw new ObjectModelOperationException("Variable product must have at least one attribute")
      }

      product.variants = _variants
      product.isVariation = true
    }

    await product.save()

    const users = await User.find({ role: ERole.CUSTOMER })
    sendMail({
      to: users.map((user) => user.email),
      subject: "New product just released",
      text: `New product ${product.name} just released. Get it now on our store.`
    })

    NotificationService.sendMulticastNotification({
      tokens: users.map((user) => user.fcmToken).filter((token) => token !== null),
      notification: {
        title: "New product just released",
        body: `New product ${product.name} just released. Get it now on our store.`
      }
    })

    return product
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const { variants, type } = data
    const product = await Product.findById(id)

    if (!product) throw new ObjectModelNotFoundException("Product not found")

    data.brand = data.brand || undefined

    if (!product.isVariation && product.variants.length > 0) {
      data.variants = []
    } else {
      if (variants) {
        const _variants = variants as IVariant[]
        const minPrice = Math.min(..._variants.map((v) => v.price))
        const maxPrice = Math.max(..._variants.map((v) => v.price))
        data.minPrice = minPrice
        data.maxPrice = maxPrice
      }
    }

    await product.updateOne(data)

    return product
  }

  async delete(id: string): Promise<DeleteResult> {
    const product = await Product.findById(id)

    if (!product) throw new ObjectModelNotFoundException("Product not found")

    return await product.deleteOne()
  }

  async getAll(
    query: any,
    page: number,
    limit: number,
    otherQuery?: Partial<Record<keyof IProduct, any>>,
    canSort: boolean = true
  ): Promise<TotalAndData<IProduct>> {
    const priceRange = query.priceRange || null
    const keyword = query.keyword || null
    console.log(query, otherQuery)
    const categories = query.categories && query.categories !== "All" ? [query.categories].flat() : null
    const colors = query.colors && query.colors !== "All" ? [query.colors].flat().map((v) => `#${v}`) : null
    const sizes = query.sizes && query.sizes !== "All" ? query.sizes : null
    const ratings = query.ratings && query.ratings !== "All" ? query.ratings : null
    const sortBy = (query.sortBy && query.sortBy) || "Newest"
    const isOnSale = query.isOnSale

    const searchQueries = ["priceRange", "keyword", "categories", "colors", "sizes", "ratings", "sortBy", "isOnSale"]

    const hasSearchQuery = searchQueries.some((q) => query[q])
    const hasKeywordOnly = searchQueries.filter((q) => q !== "keyword").every((q) => !query[q])

    console.log({ hasKeywordOnly })

    const sorts = [
      {
        label: "Price: Low to High",
        key: "displayPrice-asc"
      },
      {
        label: "Price: High to Low",
        key: "displayPrice-desc"
      },
      {
        label: "Rating: Low to High",
        key: "ratingValue-asc"
      },
      {
        label: "Rating: High to Low",
        key: "ratingValue-desc"
      },
      {
        label: "Newest",
        key: "createdAt-desc"
      },
      {
        label: "Oldest",
        key: "createdAt-asc"
      },
      {
        label: "Best Selling",
        key: "sold-desc"
      },
      {
        label: "Most Popular",
        key: "ratingCount-desc"
      }
    ]

    const sort = sorts.find((s) => s.key === sortBy)
    const [sortKey, dir] = sort?.key.split("-") ?? [null, null]

    const productQuery = () =>
      Product.find(
        {
          $and: [
            {
              ...otherQuery
            },
            ...(hasKeywordOnly
              ? [
                  {
                    $or: [{ name: { $regex: keyword || "", $options: "i" } }]
                  }
                ]
              : hasSearchQuery
                ? [
                    {
                      $and: [
                        ...(priceRange
                          ? [
                              {
                                $or: [
                                  { displayPrice: { $gte: priceRange[0], $lte: priceRange[1] } },
                                  {
                                    maxPrice: { $gte: priceRange[0], $lte: priceRange[1] }
                                  }
                                ]
                              }
                            ]
                          : []),
                        ...(keyword ? [{ name: { $regex: keyword, $options: "i" } }] : []),
                        ...(categories ? [{ category: { $in: categories } }] : []),
                        ...(colors
                          ? [
                              {
                                "variants.color": { $in: colors }
                              }
                            ]
                          : []),
                        ...(sizes ? [{ "variants.size": { $in: sizes } }] : []),
                        ...(ratings ? [{ ratingValue: { $in: ratings } }] : []),
                        ...(isOnSale !== "false" ? [{ isDiscount: true }] : [])
                      ]
                    }
                  ]
                : [])
          ]
        },
        {
          description: 0
        },
        {
          ...this.generalPopulate,
          sort: canSort
            ? sortKey
              ? {
                  [sortKey]: dir === "asc" ? 1 : -1
                }
              : {
                  isFeatured: -1,
                  discount: -1,
                  ratingValue: -1,
                  ratingCount: -1,
                  sold: -1,
                  displayPrice: 1,
                  favoritesBy: -1,
                  maxPrice: 1
                }
            : {}
        }
      )

    const data = await productQuery()
      .limit(limit)
      .skip((page - 1) * limit)
    const total = await productQuery().countDocuments()

    return {
      data,
      total
    }
  }

  async getPublishedProducts(query: any, page: number, limit: number) {
    console.log(query)
    return await this.getAll(
      query,
      page,
      limit,
      {
        isDraft: false
      },
      false
    )
  }

  async getDraftProducts(query: any, page: number, limit: number) {
    return await this.getAll(
      query,
      page,
      limit,
      {
        isDraft: true
      },
      false
    )
  }

  async getOne(type: keyof IProduct, id: string): Promise<IProduct> {
    const product = await Product.findOne(
      { [type]: id },
      {},
      {
        populate: [
          {
            path: "category",
            select: "name"
          },
          {
            path: "variants"
          },
          {
            path: "brand",
            select: "name logo website"
          },
          {
            path: "tax",
            select: "name rate"
          },
          {
            path: "shippingFee"
          }
        ]
      }
    )
    if (!product) throw new ObjectModelNotFoundException("Product not found")
    return product
  }

  async getFeatured(): Promise<IProduct[]> {
    return await Product.find({ isFeatured: true }, {}, this.generalPopulate)
  }

  async getRelated(productId: string): Promise<IProduct[]> {
    const processedSlug = getIdFromNameId(productId)
    const product = await Product.findById(processedSlug)
    if (!product) throw new ObjectModelNotFoundException("Product not found")

    return await Product.find(
      {
        category: product.category,
        isDraft: false,
        _id: { $ne: product._id }
      },
      {},
      this.generalPopulate
    )
      .sort({ createdAt: -1 })
      .limit(10)
  }

  async getRecommended(productId: string): Promise<IProduct[]> {
    const processedSlug = getIdFromNameId(productId)
    const cachedRecommend = await redisClient.get(`recommendations:${processedSlug}`)

    if (cachedRecommend) {
      return JSON.parse(cachedRecommend) as IProduct[]
    } else {
      // const recommendRes = await fetch(process.env.RECOMMENDATION_API_URL! + "?input=" + processedSlug, {
      //   method: "POST"
      // })

      // const recommendData = await recommendRes.json()
      // recommends = recommendData.recommendations
      const product = await Product.findById(processedSlug)

      if (!product) throw new ObjectModelNotFoundException("Product not found")

      const recommends = await Product.find(
        {
          category: product.category,
          isDraft: false,
          _id: { $ne: product._id }
        },
        {},
        this.generalPopulate
      )
        .sort({ createdAt: -1 })
        .limit(10)
      await redisClient.set(`recommendations:${processedSlug}`, JSON.stringify(recommends))
      return recommends
    }
  }

  async getBestSeller(): Promise<IProduct[]> {
    return await Product.find(
      {
        sold: { $gt: 0 },
        isDraft: false
      },
      {},
      this.generalPopulate
    )
      .sort({ sold: -1 })
      .limit(10)
  }

  async getPopular(): Promise<IProduct[]> {
    return await Product.find(
      { ratingCount: { $gt: 4 }, ratingValue: { $gt: 4 }, isDraft: false },
      {},
      this.generalPopulate
    )
      .sort({ ratingValue: -1, ratingCount: -1 })
      .limit(10)
  }

  async getDiscounted(): Promise<IProduct[]> {
    return await Product.find({ isDiscount: true, isDraft: false }, {}, this.generalPopulate)
  }

  async getColors(): Promise<string[]> {
    const colors = await Product.aggregate([
      { $unwind: "$variants" },
      { $group: { _id: "$variants.color" } },
      { $project: { _id: 0, color: "$_id" } },
      { $sort: { color: 1 } }
    ])

    return colors.map((c) => c.color)
  }

  async getBySlug(slug: string): Promise<IProduct> {
    const processedSlug = getIdFromNameId(slug)
    const product = await Product.findById(processedSlug, {}, this.generalPopulate)
    if (!product) throw new ObjectModelNotFoundException("Product not found")
    return product
  }

  async getUserFavorites(userId: string): Promise<IProduct[]> {
    return await Product.find(
      {
        favoritesBy: {
          $elemMatch: {
            $eq: userId
          }
        },
        isDraft: false
      },
      {},
      this.generalPopulate
    )
  }

  async toggleFavorite(productId: string, userId: string): Promise<IProduct> {
    const product = await Product.findById(productId)
    if (!product) throw new ObjectModelNotFoundException("Product not found")

    const index = product.favoritesBy.findIndex((id) => id === userId)

    if (index === -1) {
      product.favoritesBy.push(userId)
    } else {
      product.favoritesBy.splice(index, 1)
    }

    await product.save()

    return product
  }
}
