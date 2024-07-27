import { invoke } from '@tauri-apps/api'

export async function uuidv4() {
  return await invoke('uuid_v4')
}
