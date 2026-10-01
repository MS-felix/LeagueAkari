<template>
  <NScrollbar class="h-full">
    <div class="flex flex-col gap-6">
      <SettingsSection :title="t('settings.misc.clientStartup.title')">
        <SettingsRow
          :label="t('settings.misc.clientStartup.enabled.label')"
          :label-description="t('settings.misc.clientStartup.enabled.description')"
          :label-width="400"
        >
          <NSwitch
            size="small"
            :value="cis.settings.launchRiotClientOnStartup"
            @update:value="ci.setLaunchRiotClientOnStartup"
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection :title="t('settings.misc.languageManager.title')">
        <SettingsRow
          :label="t('settings.misc.languageManager.enabled.label')"
          :label-description="t('settings.misc.languageManager.enabled.description')"
          :label-width="400"
        >
          <NSwitch size="small" :value="lms.settings.enabled" @update:value="lm.setEnabled" />
        </SettingsRow>
        <NCollapseTransition :show="lms.settings.enabled">
          <SettingsRow :label="t('settings.misc.languageManager.status')" :label-width="400">
            <div class="text-right text-xs leading-5">
              <div>
                {{ t('settings.misc.languageManager.target', { locale: lms.targetLocale }) }}
              </div>
              <div>
                {{
                  t('settings.misc.languageManager.detected', { locale: lms.detectedLocale ?? '-' })
                }}
              </div>
              <div>
                {{
                  t('settings.misc.languageManager.region', { region: lms.detectedRegion ?? '-' })
                }}
              </div>
            </div>
          </SettingsRow>
        </NCollapseTransition>
      </SettingsSection>
      <SettingsSection :title="t('settings.misc.respawnTimer.title')">
        <SettingsRow
          :label="t('settings.misc.respawnTimer.enabled.label')"
          :label-description="t('settings.misc.respawnTimer.enabled.description')"
          :label-width="400"
        >
          <NSwitch
            size="small"
            :value="rts.settings.enabled"
            @update:value="(val) => rt.setEnabled(val)"
          />
        </SettingsRow>
      </SettingsSection>
      <SettingsSection :title="t('settings.misc.streamerMode.title')">
        <SettingsRow
          :label="t('settings.misc.streamerMode.streamerMode.label')"
          :label-description="t('settings.misc.streamerMode.streamerMode.description')"
          :label-width="400"
        >
          <NSwitch
            size="small"
            :value="as.settings.streamerMode"
            @update:value="(val) => a.setStreamerMode(val)"
          />
        </SettingsRow>
        <NCollapseTransition :show="as.settings.streamerMode">
          <SettingsRow
            :label="t('settings.misc.streamerMode.useAkariStyledName.label')"
            :label-description="t('settings.misc.streamerMode.useAkariStyledName.description')"
            :label-width="400"
            style="border-bottom-width: 1px"
          >
            <NSwitch
              size="small"
              :value="as.settings.streamerModeUseAkariStyledName"
              @update:value="(val) => a.setStreamerModeUseAkariStyledName(val)"
            />
          </SettingsRow>
        </NCollapseTransition>
        <SettingsRow
          :label="t('settings.misc.streamerMode.contentProtection.label')"
          :label-description="t('settings.misc.streamerMode.contentProtection.description')"
          :label-width="400"
        >
          <NSwitch
            size="small"
            :value="wms.settings.contentProtection"
            @update:value="(val) => wm.setContentProtection(val)"
          />
        </SettingsRow>
      </SettingsSection>
    </div>
  </NScrollbar>
</template>

<script setup lang="ts">
import SettingsRow from '@renderer-shared/components/SettingsRow.vue'
import SettingsSection from '@renderer-shared/components/SettingsSection.vue'
import { useInstance } from '@renderer-shared/shards'
import { AppCommonRenderer } from '@renderer-shared/shards/app-common'
import { useAppCommonStore } from '@renderer-shared/shards/app-common/store'
import { ClientInstallationRenderer } from '@renderer-shared/shards/client-installation'
import { useClientInstallationStore } from '@renderer-shared/shards/client-installation/store'
import { LanguageManagerRenderer } from '@renderer-shared/shards/language-manager'
import { useLanguageManagerStore } from '@renderer-shared/shards/language-manager/store'
import { RespawnTimerRenderer } from '@renderer-shared/shards/respawn-timer'
import { useRespawnTimerStore } from '@renderer-shared/shards/respawn-timer/store'
import { WindowManagerRenderer } from '@renderer-shared/shards/window-manager'
import { useWindowManagerStore } from '@renderer-shared/shards/window-manager/store'
import { useTranslation } from 'i18next-vue'
import { NCollapseTransition, NScrollbar, NSwitch } from 'naive-ui'

const { t } = useTranslation()

const a = useInstance(AppCommonRenderer)
const as = useAppCommonStore()
const ci = useInstance(ClientInstallationRenderer)
const cis = useClientInstallationStore()
const lm = useInstance(LanguageManagerRenderer)
const lms = useLanguageManagerStore()
const rts = useRespawnTimerStore()
const rt = useInstance(RespawnTimerRenderer)

const wm = useInstance(WindowManagerRenderer)
const wms = useWindowManagerStore()
</script>
