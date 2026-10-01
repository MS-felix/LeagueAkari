import { defineStore } from 'pinia'
import { ref, shallowReactive } from 'vue'

export const useLanguageManagerStore = defineStore('shard:language-manager-renderer', () => {
  const settings = shallowReactive({ enabled: false })
  const targetLocale = ref('zh_CN')
  const detectedLocale = ref<string | null>(null)
  const detectedRegion = ref<string | null>(null)
  const productSettingsPath = ref<string | null>(null)
  const lastError = ref<string | null>(null)
  return { settings, targetLocale, detectedLocale, detectedRegion, productSettingsPath, lastError }
})
