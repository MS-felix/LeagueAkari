import { makeAutoObservable } from 'mobx'

export class LanguageManagerSettings {
  enabled = false
  constructor() {
    makeAutoObservable(this)
  }
}

export class LanguageManagerState {
  targetLocale = 'zh_CN'
  detectedLocale: string | null = null
  detectedRegion: string | null = null
  productSettingsPath: string | null = null
  lastError: string | null = null
  constructor() {
    makeAutoObservable(this)
  }
}
