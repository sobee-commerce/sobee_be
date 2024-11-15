import { Review } from "@/models"
import { AccessControl } from "accesscontrol"

export const ac = new AccessControl()

// const grantList = [
//     {role: 'admin', resource:'profile', action:'update:any', attributes:'*'},
//     {role: 'admin', resource:'balance', action:'update:any', attributes:'*, !mount'},

//     {role: 'shop', resource:'profile', action:'update:own', attributes:'*'},
//     {role: 'shop', resource:'balance', action:'update:own', attributes:'*, !mount'},

//     {role: 'user', resource:'profile', action:'update:own', attributes:'*'},
//     {role: 'user', resource:'balance', action:'update:own', attributes:'*'}
// ]
export enum EActionPermissions {
  CREATE = "create",
  CREATEANY = "createAny",
  CREATEOWN = "createOwn",
  READ = "read",
  READANY = "readAny",
  READOWN = "readOwn",
  UPDATE = "update",
  UPDATEANY = "updateAny",
  UPDATEOWN = "updateOwn",
  DELETE = "delete",
  DELETEANY = "deleteAny",
  DELETEOWN = "deleteOwn"
}

export enum ERolePermissions {
  CREATE = "create",
  CREATEANY = "create:any",
  CREATEOWN = "create:own",
  READ = "read",
  READANY = "read:any",
  READOWN = "read:own",
  UPDATE = "update",
  UPDATEANY = "update:any",
  UPDATEOWN = "update:own",
  DELETE = "delete",
  DELETEANY = "delete:any",
  DELETEOWN = "delete:own"
}

export enum EResourcePermissions {
  REVIEW = "REVIEW",
  FAVORITE = "FAVORITE",
  PRODUCT = "PRODUCT",
  COUPON = "COUPON",
  ADDRESS = "ADDRESS",
  VARIANT = "VARIANT",
  CATEGORY = "CATEGORY",
  ASSET = "ASSET",
  MESSAGE = "MESSAGE",
  TAX = "TAX"
}

export const EResourceToModel = {
  REVIEW: Review
}
