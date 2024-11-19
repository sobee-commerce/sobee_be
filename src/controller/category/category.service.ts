import { ICategory, IProduct, TotalAndData } from "@/interface"
import { CategoryRepository } from "./category.repository"
import { CreateCategoryRequest, CreateCategoryResponse } from "./dto"
import { Category, Product, SCHEMA_NAME } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { paginate, stringToObjectId } from "@/common/utils"

export class CategoryService implements CategoryRepository {
  async create(req: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const { parent, children } = req

    let parentCategory: any = null
    if (parent && parent !== "") {
      parentCategory = await Category.findById(parent)
      if (!parentCategory) throw new ObjectModelNotFoundException("Parent category not found")
    } else {
      req.parent = null
    }
    // let childrenCategories: any[] = []
    // if (children) {
    //   childrenCategories = await Category.find({ _id: { $in: children } })
    //   if (childrenCategories.length !== children.length)
    //     throw new ObjectModelNotFoundException("Children categories not found")
    // }

    const category = new Category(req)

    if (parentCategory) {
      parentCategory.children.push(category._id)
      await parentCategory.save()
    }

    // if (childrenCategories.length > 0) {
    //   Promise.all(
    //     childrenCategories.map(async (child) => {
    //       child.parent = category._id
    //       await child.save()
    //     })
    //   )
    // }

    await category.save()
    return category
  }
  async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const { parent } = data

    const category = await Category.findById(id)
    if (!category) throw new ObjectModelNotFoundException("Category not found")

    if (parent && parent !== "") {
      const parentCategory = await Category.findById(parent)
      if (!parentCategory) throw new ObjectModelNotFoundException("Parent category not found")

      if (category.parent && category.parent.toString() !== parentCategory._id.toString()) {
        const oldParent = await Category.findById(category.parent)
        if (!oldParent) throw new ObjectModelNotFoundException("Old parent category not found")
        oldParent.children = oldParent.children.filter((child) => child.toString() !== id) as string[]
        await oldParent.save()

        parentCategory.children.push(category._id.toString() as any)
        parentCategory.save()
      } else if (!category.parent) {
        parentCategory.children.push(category._id.toString() as any)
        await parentCategory.save()
      }
      category.parent = parentCategory._id
      data.parent = parentCategory._id.toString()
    } else if (category.parent) {
      const oldParent = await Category.findById(category.parent)
      if (!oldParent) throw new ObjectModelNotFoundException("Old parent category not found")
      oldParent.children = oldParent.children.filter((child) => child.toString() !== id) as string[]
      await oldParent.save()
      category.parent = null
      data.parent = null
    } else {
      data.parent = null
    }

    category.set(data)

    return await category.save()
  }
  async delete(id: string): Promise<ICategory> {
    const category = await Category.findByIdAndDelete(id)
    if (!category) throw new ObjectModelOperationException("Category not found")

    if (category.parent) {
      const parentCategory = await Category.findById(category.parent)
      if (!parentCategory) throw new ObjectModelOperationException("Parent category not found")

      parentCategory.children = parentCategory.children.filter((child) => child.toString() !== id) as string[]

      await parentCategory.save()
    }

    if (category.children.length > 0) {
      const children = await Category.find({ _id: { $in: category.children } })
      Promise.all(
        children.map(async (child) => {
          child.parent = null
          await child.save()
        })
      )
    }

    return category
  }
  async getAll(page: number = 1, limit: number = 10, keyword: string = ""): Promise<TotalAndData<ICategory>> {
    const skip = (page - 1) * limit
    const categoryWithProductCountQuery = await Category.aggregate([
      keyword ? { $match: { name: { $regex: keyword, $options: "i" } } } : { $match: {} },
      {
        $lookup: {
          from: SCHEMA_NAME.PRODUCTS,
          localField: "_id",
          foreignField: "category",
          as: "products"
        }
      },
      {
        $lookup: {
          from: SCHEMA_NAME.CATEGORIES,
          localField: "children",
          foreignField: "_id",
          as: "children",
          pipeline: [
            {
              $project: {
                description: 0
              }
            },
            {
              $lookup: {
                from: SCHEMA_NAME.PRODUCTS,
                localField: "_id",
                foreignField: "category",
                as: "products"
              }
            },
            {
              $addFields: {
                productCount: {
                  $size: "$products"
                }
              }
            },
            {
              $project: {
                products: 0
              }
            }
          ]
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          image: 1,
          parent: 1,
          children: 1,
          products: 1
        }
      },
      {
        $addFields: {
          productCount: {
            $size: "$products"
          }
        }
      },
      {
        $project: {
          products: 0
        }
      }
    ])

    const total = categoryWithProductCountQuery.length
    const data = categoryWithProductCountQuery.slice(skip, skip + limit)

    return {
      data,
      total
    }
  }

  async getOne(type: keyof ICategory, id: string): Promise<ICategory> {
    const data = await Category.findOne({ [type]: id })

    if (!data) throw new ObjectModelNotFoundException()
    return data
  }

  async getProducts(slug: string, page: number, limit: number): Promise<TotalAndData<IProduct>> {
    const category = await Category.findOne({ slug })
    if (!category) throw new ObjectModelNotFoundException("Category not found")

    const categoryQuery = () =>
      Product.find(
        { category: category._id },
        { description: 0 },
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
      )

    const total = await categoryQuery().countDocuments()
    const data = await categoryQuery()
      .limit(limit)
      .skip((page - 1) * limit)
    return {
      total,
      data
    }
  }

  async getCategoryAndProducts(
    page: number,
    limit: number
  ): Promise<
    TotalAndData<
      ICategory & {
        products: IProduct[]
      }
    >
  > {
    const productAndCategory = () =>
      Category.aggregate([
        {
          $lookup: {
            from: SCHEMA_NAME.PRODUCTS,
            localField: "_id",
            foreignField: "category",
            as: "products",
            pipeline: [
              {
                $limit: 6
              },
              {
                $lookup: {
                  from: SCHEMA_NAME.BRAND,
                  localField: "brand",
                  foreignField: "_id",
                  as: "brand",
                  pipeline: [
                    {
                      $project: {
                        products: 0
                      }
                    }
                  ]
                }
              },
              { $unwind: "$brand" },
              {
                $project: {
                  description: 0
                }
              },
              {
                $lookup: {
                  from: SCHEMA_NAME.CATEGORIES,
                  localField: "category",
                  foreignField: "_id",
                  as: "category",
                  pipeline: [
                    {
                      $project: {
                        description: 0
                      }
                    }
                  ]
                }
              },
              { $unwind: "$category" }
            ]
          }
        },
        {
          $project: {
            name: 1,
            slug: 1,
            products: 1
          }
        },
        {
          $addFields: {
            productCount: {
              $size: "$products"
            }
          }
        },
        {
          $sort: {
            productCount: -1
          }
        }
      ])

    const total = await Category.countDocuments().exec()
    const data = await productAndCategory()
      .limit(limit + (page - 1) * limit)
      .skip((page - 1) * limit)

    return {
      total,
      data
    }
  }
}
