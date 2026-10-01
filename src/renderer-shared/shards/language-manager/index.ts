import { Dep, IAkariShardInitDispose, Shard } from '@shared/akari-shard'

import { PiniaMobxUtilsRenderer } from '../pinia-mobx-utils'
import { SettingUtilsRenderer } from '../setting-utils'
import { useLanguageManagerStore } from './store'

const MAIN_NAMESPACE = 'language-manager-main'

@Shard(LanguageManagerRenderer.id)
export class LanguageManagerRenderer implements IAkariShardInitDispose {
  static id = 'language-manager-renderer'
  constructor(
    @Dep(PiniaMobxUtilsRenderer) private readonly _piniaMobxUtils: PiniaMobxUtilsRenderer,
    @Dep(SettingUtilsRenderer) private readonly _settingUtils: SettingUtilsRenderer
  ) {}
  async onInit() {
    const store = useLanguageManagerStore()
    await this._piniaMobxUtils.sync(MAIN_NAMESPACE, 'settings', store.settings)
    await this._piniaMobxUtils.sync(MAIN_NAMESPACE, 'state', store)
  }
  setEnabled(enabled: boolean) {
    return this._settingUtils.set(MAIN_NAMESPACE, 'enabled', enabled)
  }
}
