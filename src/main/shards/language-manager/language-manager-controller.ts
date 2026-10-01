import { type IReactionDisposer, reaction, runInAction } from 'mobx'
import fs from 'node:fs'
import path from 'node:path'

import type { LanguageManagerMainContext } from './context'
import type { LanguageConfigExecutor } from './language-config-executor'
import { supportsLanguageManager } from './platform'

export class LanguageManagerController {
  private _watcher: fs.FSWatcher | null = null
  private _debounceTimer: NodeJS.Timeout | null = null
  private _reaction: IReactionDisposer | null = null
  private _removeLaunchHook: (() => boolean) | null = null
  private _writing = false

  constructor(
    private readonly _context: LanguageManagerMainContext,
    private readonly _executor: LanguageConfigExecutor
  ) {}

  start() {
    this._removeLaunchHook = this._context.clientInstallation.addBeforeRiotLaunchHook(async () => {
      if (this._context.settings.enabled) await this.ensureLocale()
    })
    this._reaction = reaction(
      () => this._context.settings.enabled,
      (enabled) => (enabled ? void this.ensureLocale() : this._stopWatcher()),
      { fireImmediately: true }
    )
  }

  dispose() {
    this._reaction?.()
    this._removeLaunchHook?.()
    this._stopWatcher()
  }

  async ensureLocale(attempt = 0): Promise<void> {
    if (!supportsLanguageManager() || !this._context.settings.enabled || this._writing) return
    const filePath = this._executor.locate()
    runInAction(() => {
      this._context.state.productSettingsPath = filePath
      this._context.state.detectedRegion = this._context.leagueClient.state.auth?.region ?? null
    })
    if (!filePath) {
      runInAction(() => (this._context.state.lastError = 'product-settings-not-found'))
      return
    }
    this._watch(filePath)
    try {
      this._writing = true
      const { locale } = await this._executor.inspect(filePath)
      runInAction(() => (this._context.state.detectedLocale = locale))
      await this._executor.apply(filePath, this._context.state.targetLocale)
      runInAction(() => {
        this._context.state.detectedLocale = this._context.state.targetLocale
        this._context.state.lastError = null
      })
    } catch (error) {
      if (attempt < 4) setTimeout(() => void this.ensureLocale(attempt + 1), 250 * 2 ** attempt)
      else {
        this._context.logger.warn('Failed to enforce League locale', error)
        runInAction(() => (this._context.state.lastError = String(error)))
      }
    } finally {
      this._writing = false
    }
  }

  private _watch(filePath: string) {
    if (this._watcher) return
    try {
      this._watcher = fs.watch(path.dirname(filePath), (_event, filename) => {
        if (filename?.toString() !== path.basename(filePath) || this._writing) return
        if (this._debounceTimer) clearTimeout(this._debounceTimer)
        this._debounceTimer = setTimeout(() => void this.ensureLocale(), 500)
      })
    } catch (error) {
      this._context.logger.warn('Could not watch League language configuration', error)
      return
    }
    this._watcher.on('error', (error) => {
      this._context.logger.warn('Language configuration watcher failed', error)
      this._stopWatcher()
      setTimeout(() => void this.ensureLocale(), 1000)
    })
  }

  private _stopWatcher() {
    this._watcher?.close()
    this._watcher = null
    if (this._debounceTimer) clearTimeout(this._debounceTimer)
    this._debounceTimer = null
  }
}
