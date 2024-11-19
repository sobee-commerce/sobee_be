import { IChatRoom, IUser } from "@/interface"
import { ChatRoomRepository } from "./chat-room.repository"
import { ChatRoom, Order, Role, Staff, User } from "@/models"
import { ObjectModelNotFoundException, UnauthorizedException } from "@/common/exceptions"
import { ERole } from "@/enum"

export class ChatRoomService implements ChatRoomRepository {
  async create(orderId: string, userId: string) {
    const order = await Order.findById(orderId)

    if (!order) throw new ObjectModelNotFoundException("Order not found")

    const orderSupportRole = await Role.findOne({ role_name: "Order Supporter" })
    if (!orderSupportRole) throw new ObjectModelNotFoundException("Role Order Supporter not found")

    const orderSupporter = await Staff.findOne({ staffRole: orderSupportRole._id })
    if (!orderSupporter) throw new ObjectModelNotFoundException("Order Supporter not found")

    const supporterUser = await User.findOne({
      _user: orderSupporter._id
    })

    if (!supporterUser) throw new ObjectModelNotFoundException("Supporter User not found")

    return await ChatRoom.create({
      order: order._id,
      title: order.orderGeneratedId,
      createdBy: userId,
      staff: {
        user: supporterUser._id,
        isDeleted: false
      },
      customer: {
        user: userId,
        isDeleted: false
      }
    })
  }
  async delete(id: string): Promise<IChatRoom> {
    const deleted = await ChatRoom.findByIdAndDelete(id)
    if (!deleted) throw new ObjectModelNotFoundException()
    return deleted
  }
  async getRoomById(id: string) {
    const room = await ChatRoom.findOne({
      $or: [
        { _id: id },
        {
          order: id
        }
      ]
    })
    if (!room) throw new ObjectModelNotFoundException()
    return await room.populate("customer.user staff.user order product")
  }
  async getRoomsByUser(userId: string): Promise<IChatRoom[]> {
    const rooms = await ChatRoom.find({
      $or: [{ "customer.user": userId }, { "staff.user": userId }]
    }).populate("customer.user staff.user lastMessage.sender")

    const updateRooms = rooms.map((room) => {
      const lastSender = room.lastMessage?.sender as IUser
      if (room.isHaveNew && lastSender?._id?.toString() == userId) {
        room.isHaveNew = false
      }
      return room
    })

    return updateRooms
  }
  async getAll(): Promise<IChatRoom[]> {
    const rooms = await ChatRoom.find().populate("customer.user staff.user order product").lean()
    return rooms
  }
}
