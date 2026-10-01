import fs from 'node:fs'
import path from 'node:path'
import { Document, isSeq, parseDocument } from 'yaml'

import type { ClientInstallationMain } from '../client-installation'
import type { AkariLogger } from '../logger-factory'

const FILE_NAME = 'league_of_legends.live.product_settings.yaml'

export class LanguageConfigExecutor {
  constructor(
    private readonly _clientInstallation: ClientInstallationMain,
    private readonly _logger: AkariLogger
  ) {}

  locate(): string | null {
    const candidates = new Set<string>()
    const riotExecutable = this._clientInstallation.state.officialRiotClientExecutablePath
    if (riotExecutable) {
      const riotRoot = path.resolve(path.dirname(riotExecutable), '..')
      candidates.add(path.join(riotRoot, 'Metadata', 'league_of_legends.live', FILE_NAME))
    }
    for (const executable of this._clientInstallation.state.leagueClientExecutablePaths) {
      let current = path.dirname(executable)
      for (let index = 0; index < 4; index += 1) {
        candidates.add(
          path.join(current, 'Riot Games', 'Metadata', 'league_of_legends.live', FILE_NAME)
        )
        candidates.add(path.join(current, 'Metadata', 'league_of_legends.live', FILE_NAME))
        current = path.dirname(current)
      }
    }
    if (process.env.PROGRAMDATA) {
      candidates.add(
        path.join(
          process.env.PROGRAMDATA,
          'Riot Games',
          'Metadata',
          'league_of_legends.live',
          FILE_NAME
        )
      )
    }
    return [...candidates].find((candidate) => fs.existsSync(candidate)) ?? null
  }

  async inspect(filePath: string) {
    const document = parseDocument(await fs.promises.readFile(filePath, 'utf8'))
    return {
      document,
      locale:
        document.getIn(['settings', 'locale'])?.toString() ??
        document.getIn(['locale_data', 'default_locale'])?.toString() ??
        null
    }
  }

  async apply(filePath: string, targetLocale: string) {
    const { document, locale } = await this.inspect(filePath)
    let changed = locale !== targetLocale
    changed = this._ensureAvailableLocale(document, targetLocale) || changed
    if (document.getIn(['locale_data', 'default_locale']) !== targetLocale) {
      document.setIn(['locale_data', 'default_locale'], targetLocale)
      changed = true
    }
    if (document.getIn(['settings', 'locale']) !== targetLocale) {
      document.setIn(['settings', 'locale'], targetLocale)
      changed = true
    }
    if (!changed) return false
    const temporaryPath = `${filePath}.akari-tmp`
    await fs.promises.writeFile(temporaryPath, document.toString(), 'utf8')
    await fs.promises.rename(temporaryPath, filePath)
    this._logger.info('League locale configuration updated', { filePath, targetLocale })
    return true
  }

  private _ensureAvailableLocale(document: Document, targetLocale: string) {
    const locales = document.getIn(['locale_data', 'available_locales'], true)
    if (isSeq(locales)) {
      if (locales.items.some((item) => item?.toString() === targetLocale)) return false
      locales.add(targetLocale)
      return true
    }
    document.setIn(['locale_data', 'available_locales'], [targetLocale])
    return true
  }
}
