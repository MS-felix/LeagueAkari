import { IAkariShardInitDispose, Shard } from '@shared/akari-shard'
import { z } from 'zod'

import { ClientInstallationMain } from '../client-installation'
import { LeagueClientMain } from '../league-client'
import { LoggerFactoryMain } from '../logger-factory'
import { MobxUtilsMain } from '../mobx-utils'
import { SettingFactoryMain } from '../setting-factory'
import { LANGUAGE_MANAGER_MAIN_NAMESPACE, type LanguageManagerMainContext } from './context'
import { LanguageConfigExecutor } from './language-config-executor'
import { LanguageManagerController } from './language-manager-controller'
import { LanguageManagerSettings, LanguageManagerState } from './state'

@Shard(LanguageManagerMain.id)
export class LanguageManagerMain implements IAkariShardInitDispose {
  static id = LANGUAGE_MANAGER_MAIN_NAMESPACE
  readonly settings = new LanguageManagerSettings()
  readonly state = new LanguageManagerState()
  private readonly _controller: LanguageManagerController
  private readonly _settingService

  constructor(
    clientInstallation: ClientInstallationMain,
    leagueClient: LeagueClientMain,
    loggerFactory: LoggerFactoryMain,
    private readonly _mobxUtils: MobxUtilsMain,
    settingFactory: SettingFactoryMain
  ) {
    const logger = loggerFactory.create(LanguageManagerMain.id)
    const context: LanguageManagerMainContext = {
      clientInstallation,
      leagueClient,
      logger,
      settings: this.settings,
      state: this.state
    }
    this._settingService = settingFactory.register(
      LanguageManagerMain.id,
      { enabled: { default: false, schema: z.boolean() } },
      this.settings
    )
    this._controller = new LanguageManagerController(
      context,
      new LanguageConfigExecutor(clientInstallation, logger)
    )
  }

  async onInit() {
    await this._settingService.applyToState()
    this._mobxUtils.propSync(LanguageManagerMain.id, 'settings', this.settings, ['enabled'])
    this._mobxUtils.propSync(LanguageManagerMain.id, 'state', this.state, [
      'targetLocale',
      'detectedLocale',
      'detectedRegion',
      'productSettingsPath',
      'lastError'
    ])
    this._controller.start()
  }

  ensureLocale() {
    return this._controller.ensureLocale()
  }
  async onDispose() {
    this._controller.dispose()
  }
}
