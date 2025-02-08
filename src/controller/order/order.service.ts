import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { generateOrderId } from "@/common/utils"
import { EOrderStatus } from "@/enum"
import { IOrder, IOrderItem, IProduct, TotalAndData } from "@/interface"
import { Address, Order, OrderItem, Product } from "@/models"
import { DeleteResult } from "mongodb"
import { CouponService } from "../coupon"
import { OrderRepository } from "./order.repository"
import Stripe from "stripe"

export class OrderService implements OrderRepository {
  private readonly couponService: CouponService

  constructor() {
    this.couponService = new CouponService()
  }

  async addOrderItem(data: IOrderItem): Promise<IOrderItem> {
    const product = await Product.findById(data.product)
    if (!product) {
      throw new ObjectModelNotFoundException("Product not found")
    }

    if (product.isVariation) {
      const existOrderItem = await OrderItem.findOne({
        customer: data.customer,
        product: data.product,
        size: data.size,
        color: data.color
      })

      if (existOrderItem) {
        return await this.updateOrderItemQuantity(existOrderItem._id.toString(), existOrderItem.amount + data.amount)
      }
    } else {
      const existOrderItem = await OrderItem.findOne({ customer: data.customer, product: data.product })

      if (existOrderItem) {
        return await this.updateOrderItemQuantity(existOrderItem._id.toString(), existOrderItem.amount + data.amount)
      }
    }

    let price = 0
    let subTotal = 0

    if (product.isVariation) {
      const { color, size, amount } = data

      const productVariantIndex = product.variants.findIndex((v) => v.color === color && v.size === size)

      if (productVariantIndex === -1) {
        throw new ObjectModelNotFoundException("Product variant not found")
      }

      const productVariant = product.variants[productVariantIndex]

      if (productVariant.amount < amount) {
        throw new ObjectModelOperationException("Product variant not enough")
      }

      productVariant.amount -= amount

      product.variants[productVariantIndex] = productVariant

      price = productVariant.price

      subTotal = productVariant.price * amount
    } else {
      subTotal = product.displayPrice * data.amount
      price = product.displayPrice
    }

    product.quantity -= data.amount

    if (product.isDiscount) {
      subTotal -= subTotal * product.discount
    }

    const orderItem = new OrderItem({
      ...data,
      price,
      subTotal
    })

    await orderItem.save()
    await product.save()

    return await orderItem.populate({
      path: "product",
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
    })
  }

  async removeOrderItem(id: string): Promise<DeleteResult> {
    const orderItem = await OrderItem.findById(id)
    if (!orderItem) {
      throw new ObjectModelNotFoundException("Order item not found")
    }

    const orderItemInOrders = await Order.findOne({
      "orderItems._id": id
    })

    if (orderItemInOrders) {
      return await orderItem.deleteOne()
    }

    const product = await Product.findById(orderItem.product)
    if (!product) {
      throw new ObjectModelNotFoundException("Product not found")
    }

    if (product.isVariation) {
      const { color, size, amount } = orderItem

      const productVariantIndex = product.variants.findIndex((v) => v.color === color && v.size === size)

      if (productVariantIndex === -1) {
        throw new ObjectModelNotFoundException("Product variant not found")
      }

      const productVariant = product.variants[productVariantIndex]

      productVariant.amount += amount

      product.variants[productVariantIndex] = productVariant
    }

    product.quantity += orderItem.amount

    const deleted = await orderItem.deleteOne()

    await product.save()

    return deleted
  }

  async updateOrderItemQuantity(id: string, quantity: number): Promise<IOrderItem> {
    const orderItem = await OrderItem.findById(id)
    if (!orderItem) {
      throw new ObjectModelNotFoundException("Order item not found")
    }

    const product = await Product.findById(orderItem.product)

    if (!product) {
      throw new ObjectModelNotFoundException("Product not found")
    }

    let subTotal = 0

    if (product.isVariation) {
      const { color, size, amount } = orderItem

      const productVariantIndex = product.variants.findIndex((v) => v.color === color && v.size === size)

      if (productVariantIndex === -1) {
        throw new ObjectModelNotFoundException("Product variant not found")
      }

      const productVariant = product.variants[productVariantIndex]

      if (productVariant.amount < quantity) {
        throw new ObjectModelOperationException("Product variant not enough")
      }

      productVariant.amount -= amount
      productVariant.amount += quantity
      orderItem.amount = quantity

      product.variants[productVariantIndex] = productVariant

      subTotal = orderItem.price * quantity
    } else {
      subTotal = product.displayPrice * quantity
      orderItem.amount = quantity
    }

    product.quantity += orderItem.amount - quantity

    if (product.isDiscount) {
      subTotal -= subTotal * product.discount
    }

    orderItem.subTotal = subTotal

    await orderItem.save()

    await product.save()

    return await orderItem.populate({
      path: "product",
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
    })
  }

  async createOrder(data: IOrder): Promise<IOrder> {
    if (data.coupon) {
      const coupon = await this.couponService.use(data.coupon.toString(), data.customer.toString())
      data.coupon = coupon._id!
    }

    const address = await Address.findById(data.shippingAddress)

    console.log({ address })

    const orderItems = await OrderItem.find({ customer: data.customer, _id: { $in: data.orderItems } })

    const order = new Order({
      ...data,
      orderItems,
      shippingAddress: address
    })

    order.orderGeneratedId = generateOrderId()

    order.status = EOrderStatus.PENDING

    await OrderItem.deleteMany({ _id: { $in: data.orderItems } })
    await order.save()

    return order
  }

  async createOrderMockData(data: IOrder): Promise<IOrder> {
    if (data.coupon) {
      const coupon = await this.couponService.use(data.coupon.toString(), data.customer.toString())
      data.coupon = coupon._id!
    }

    const order = new Order({
      ...data
    })

    order.orderGeneratedId = data.orderGeneratedId || generateOrderId()

    order.status = data.status || EOrderStatus.PENDING

    if (order.status === EOrderStatus.DELIVERED || order.status === EOrderStatus.COMPLETED) {
      ;(data.orderItems as IOrderItem[]).forEach(async (oi: IOrderItem) => {
        await Product.findByIdAndUpdate(oi.product, { $inc: { sold: oi.amount } })
      })
    }
    await order.save()

    return order
  }

  async getOrderItemsByCustomer(customerId: string): Promise<IOrderItem[]> {
    const orderItems = await OrderItem.find(
      { customer: customerId },
      {},
      {
        populate: [
          {
            path: "product",
            select: "name thumbnail isVariation slug shippingFee tax isDiscount discount",
            populate: [
              {
                path: "shippingFee"
              },
              {
                path: "tax",
                select: "name rate"
              }
            ]
          }
        ]
      }
    )
    return orderItems
  }

  async getOrdersByCustomer(
    customerId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<TotalAndData<IOrder>> {
    console.log({ page, limit, status })
    const orders = () =>
      Order.find(
        {
          customer: customerId,
          ...(status ? { status } : {})
        },
        {},
        {
          populate: [
            {
              path: "orderItems.product",
              select: "thumbnail"
            }
          ]
        }
      )

    const total = await orders().countDocuments()
    const data = await orders()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })

    return {
      total,
      data
    }
  }

  async getOrderById(id: string): Promise<IOrder> {
    const order = await Order.findById(id).populate([
      {
        path: "orderItems",
        populate: [
          {
            path: "product",
            select: "name thumbnail isVariation slug shippingFee tax isDiscount discount",
            populate: [
              {
                path: "shippingFee"
              },
              {
                path: "tax",
                select: "name rate"
              }
            ]
          }
        ]
      },
      {
        path: "customer",
        select: "name avatar"
      }
    ])

    if (!order) {
      throw new ObjectModelNotFoundException("Order not found")
    }

    return order
  }

  async getAllOrders(page: number, limit: number, keyword: string = ""): Promise<TotalAndData<IOrder>> {
    const orders = () =>
      Order.find({
        $or: [
          {
            orderGeneratedId: { $regex: keyword, $options: "i" }
          },
          {
            phoneNumber: { $regex: keyword, $options: "i" }
          },
          {
            emailAdress: { $regex: keyword, $options: "i" }
          }
        ]
      }).populate({
        path: "customer",
        select: "name avatar"
      })

    const total = await orders().countDocuments().exec()
    const data = await orders()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec()

    return {
      total,
      data
    }
  }

  async updateOrderStatus(id: string, status: EOrderStatus): Promise<IOrder> {
    const order = await Order.findById(id)
    if (!order) {
      throw new ObjectModelNotFoundException("Order not found")
    }

    if (order.status === EOrderStatus.COMPLETED) {
      throw new ObjectModelOperationException("Order already completed")
    }

    if (status === EOrderStatus.CANCELED) {
      if (order.status !== EOrderStatus.PENDING) {
        throw new ObjectModelOperationException("Order cannot be canceled")
      }
      order.canceledAt = new Date()
    } else {
      order.canceledAt = null
    }

    if (status === EOrderStatus.DELIVERED) {
      if (order.status !== EOrderStatus.DELIVERING) {
        throw new ObjectModelOperationException("Order cannot be delivered")
      }
      order.deliveredAt = new Date()
    }

    if (status === EOrderStatus.COMPLETED) {
      if (order.status !== EOrderStatus.DELIVERED) {
        throw new ObjectModelOperationException("Order cannot be completed")
      }
      order.completedAt = new Date()
      ;(order.orderItems as IOrderItem[]).forEach(async (oi: IOrderItem) => {
        await Product.findByIdAndUpdate(oi.product, { $inc: { sold: oi.amount } })
      })
    }
    order.status = status

    await order.save()

    return order
  }

  async getPaymentSheet(amount: number) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const customer = await stripe.customers.create()
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2025-01-27.acacia" }
    )

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: customer.id,
      payment_method_types: ["card"]
    })

    return {
      customer: customer.id,
      ephemeralKey: ephemeralKey.secret,
      paymentIntent: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }
  }
}
