import { getPidsByName } from '@main/native'
import cp from 'node:child_process'
import util from 'node:util'

import type { ClientInstallationMainContext } from './context'
import { shouldAllowWindowsOnlyLaunch } from './platform'

const execFileAsync = util.promisify(cp.execFile)

export class ClientInstallationLauncher {
  private readonly _beforeRiotLaunchHooks = new Set<() => Promise<void>>()
  constructor(private readonly _context: ClientInstallationMainContext) {}

  async launchOnStartup() {
    if (!this._context.settings.launchRiotClientOnStartup) return
    await this._launchDefaultRiotClientUnlessRunning()
  }

  launchTencentTcls() {
    if (!shouldAllowWindowsOnlyLaunch()) {
      this._context.logger.info('Skip TCLS launch on unsupported platform', {
        platform: process.platform
      })
      return
    }

    if (!this._context.state.tclsExecutablePath) {
      return
    }

    return this._spawnDetachedShell(this._context.state.tclsExecutablePath, 'TCLS client')
  }

  launchWeGameLeagueOfLegends() {
    if (!shouldAllowWindowsOnlyLaunch()) {
      this._context.logger.info('Skip WeGame League of Legends launch on unsupported platform', {
        platform: process.platform
      })
      return
    }

    if (!this._context.state.weGameLauncherExecutablePath) {
      return
    }

    return this._spawnDetachedShell(
      this._context.state.weGameLauncherExecutablePath,
      'WeGame (LoL) client'
    )
  }

  launchWeGame() {
    if (!shouldAllowWindowsOnlyLaunch()) {
      this._context.logger.info('Skip WeGame launch on unsupported platform', {
        platform: process.platform
      })
      return
    }

    if (!this._context.state.weGameExecutablePath) {
      return
    }

    return this._spawnDetachedShell(this._context.state.weGameExecutablePath, 'WeGame client')
  }

  async launchDefaultRiotClient() {
    const executablePath = this._context.state.officialRiotClientExecutablePath

    if (!executablePath) {
      return
    }

    for (const hook of this._beforeRiotLaunchHooks) {
      await hook()
    }

    const args = ['--launch-product=league_of_legends', '--launch-patchline=live']

    if (process.platform === 'win32') {
      return this._spawnDetachedShell(executablePath, 'Riot client', args)
    }

    if (process.platform === 'darwin' && executablePath.endsWith('.app')) {
      await execFileAsync('open', ['-a', executablePath, '--args', ...args])
      return
    }

    await execFileAsync(executablePath, args)
  }

  addBeforeRiotLaunchHook(hook: () => Promise<void>) {
    this._beforeRiotLaunchHooks.add(hook)
    return () => this._beforeRiotLaunchHooks.delete(hook)
  }

  private async _launchDefaultRiotClientUnlessRunning() {
    if (!this._context.state.officialRiotClientExecutablePath) return
    try {
      const [riotClientPids, leagueClientPids] = await Promise.all([
        getPidsByName('RiotClientServices.exe'),
        getPidsByName('LeagueClient.exe')
      ])
      if (riotClientPids.length || leagueClientPids.length) {
        this._context.logger.info('Skip startup Riot client launch because it is already running')
        return
      }
      await this.launchDefaultRiotClient()
    } catch (error) {
      this._context.logger.warn('Failed to launch Riot client on application startup', error)
    }
  }

  private _spawnDetachedShell(executablePath: string, label: string, args: string[] = []) {
    return new Promise<void>((resolve, reject) => {
      const child = cp.spawn(`"${executablePath}"`, args, {
        detached: true,
        stdio: 'ignore',
        shell: true
      })

      let hasError = false
      child.on('error', (error) => {
        hasError = true
        this._context.logger.warn(`Failed to launch ${label}`, executablePath, error)
        reject(error)
      })

      setImmediate(() => {
        if (hasError) {
          return
        }

        child.unref()
        resolve()
      })
    })
  }
}
