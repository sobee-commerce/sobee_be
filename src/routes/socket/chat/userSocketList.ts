class UserSocketList {
  private userSocketList: Map<string, string> = new Map<string, string>()

  private static instance: UserSocketList

  private constructor() {}

  public static getInstance(): UserSocketList {
    return this.instance || (this.instance = new UserSocketList())
  }

  public getUserList(): Map<string, string> {
    return this.userSocketList
  }

  public addSocket(userId: string, socketId: string): void {
    this.userSocketList.set(userId, socketId)
  }

  public removeSocket(userId: string): void {
    this.userSocketList.delete(userId)
  }

  public getSocket(userId: string): string {
    return this.userSocketList.get(userId) || ""
  }
}

export default UserSocketList.getInstance()
