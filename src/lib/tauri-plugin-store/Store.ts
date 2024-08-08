import { Store as TauriPluginStore } from 'tauri-plugin-store-api'

export class Store {
  private static store = new TauriPluginStore('.local.dat')
  private constructor() {}

  public static async save<T = null>(data: T, key: string) {
    await this.store.set(key, data)
    await this.store.save()
    return data
  }

  public static async get<T = null>(key: string) {
    return await this.store.get<T>(key)
  }

  public static async clearStore() {
    await this.store.clear()
    await this.store.save()
  }

  public static async remove(key: string) {
    await this.store.delete(key)
    await this.store.save()
  }
}
