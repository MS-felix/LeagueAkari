import { defineStore } from 'pinia'
import { ref, shallowReactive, shallowRef } from 'vue'

export const useClientInstallationStore = defineStore('shard:client-installation-renderer', () => {
  const settings = shallowReactive({ launchRiotClientOnStartup: true })
  const leagueClientExecutablePaths = shallowRef<string[]>([])
  const tencentInstallationPath = ref<string | null>(null)
  const weGameExecutablePath = ref<string | null>(null)
  const officialRiotClientExecutablePath = ref<string | null>(null)
  const detectedLiveStreamingClients = shallowRef<string[]>([])

  const tclsExecutablePath = ref<string | null>(null)
  const weGameLauncherExecutablePath = ref<string | null>(null)

  return {
    settings,
    leagueClientExecutablePaths,
    tencentInstallationPath,
    weGameExecutablePath,
    officialRiotClientExecutablePath,
    tclsExecutablePath,
    weGameLauncherExecutablePath,
    detectedLiveStreamingClients
  }
})
