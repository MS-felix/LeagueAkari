import type { ClientInstallationMain } from '../client-installation'
import type { LeagueClientMain } from '../league-client'
import type { AkariLogger } from '../logger-factory'
import type { LanguageManagerSettings, LanguageManagerState } from './state'

export const LANGUAGE_MANAGER_MAIN_NAMESPACE = 'language-manager-main'

export interface LanguageManagerMainContext {
  clientInstallation: ClientInstallationMain
  leagueClient: LeagueClientMain
  logger: AkariLogger
  settings: LanguageManagerSettings
  state: LanguageManagerState
}
