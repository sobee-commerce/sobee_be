// const grantList = [
//     {role: 'admin', resource:'profile', action:'update:any', attributes:'*'},
//     {role: 'admin', resource:'balance', action:'update:any', attributes:'*, !mount'},

// import { EResourcePermissions, ERolePermissions } from "@/common/utils/rbac"

//     {role: 'shop', resource:'profile', action:'update:own', attributes:'*'},
//     {role: 'shop', resource:'balance', action:'update:own', attributes:'*, !mount'},

//     {role: 'user', resource:'profile', action:'update:own', attributes:'*'},
//     {role: 'user', resource:'balance', action:'update:own', attributes:'*'}
// ]
// export interface IGrantListItem {
//     role?: string
//     resource: string
//     actions: ERolePermissions[]
//     attributes: string
// }
export interface IPermission {
  // role_name: string
  // role_slug: string
  // grant_lists: IGrantListItem[]
}
