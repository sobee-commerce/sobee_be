import { IRole, IStaff, IUser } from "@/interface"

type CreateStaffRequest = Omit<IUser, "_user"> & IStaff

type CreateStaffResponse = IUser<IStaff>

export { CreateStaffRequest, CreateStaffResponse }
