import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parse } from 'yaml'

import type { ClientInstallationMain } from '../client-installation'
import type { AkariLogger } from '../logger-factory'
import { LanguageConfigExecutor } from './language-config-executor'

describe('LanguageConfigExecutor', () => {
  const temporaryDirectories: string[] = []
  afterEach(async () => {
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => fs.promises.rm(directory, { recursive: true, force: true }))
    )
  })
  it('updates only locale settings and keeps existing locales and unrelated values', async () => {
    const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'league-akari-language-'))
    temporaryDirectories.push(directory)
    const filePath = path.join(directory, 'product_settings.yaml')
    await fs.promises.writeFile(
      filePath,
      [
        'locale_data:',
        '  available_locales:',
        '    - en_US',
        '    - zh_TW',
        '  default_locale: en_US',
        'settings:',
        '  locale: en_US',
        '  region: EUW',
        'patchline: live'
      ].join('\n')
    )
    const executor = new LanguageConfigExecutor(
      {
        state: { officialRiotClientExecutablePath: null, leagueClientExecutablePaths: [] }
      } as unknown as ClientInstallationMain,
      { info: vi.fn() } as unknown as AkariLogger
    )
    expect(await executor.apply(filePath, 'zh_CN')).toBe(true)
    const result = parse(await fs.promises.readFile(filePath, 'utf8'))
    expect(result.locale_data.available_locales).toEqual(['en_US', 'zh_TW', 'zh_CN'])
    expect(result.locale_data.default_locale).toBe('zh_CN')
    expect(result.settings).toEqual({ locale: 'zh_CN', region: 'EUW' })
    expect(result.patchline).toBe('live')
    expect(await executor.apply(filePath, 'zh_CN')).toBe(false)
  })
})
