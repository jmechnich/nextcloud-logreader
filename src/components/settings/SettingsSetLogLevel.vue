<template>
	<fieldset>
		<legend>{{ t('logreader', 'Set backend loglevel') }}</legend>
		<NcCheckboxRadioSwitch v-for="levelName, levelId in LOGGING_LEVEL_NAMES"
			:key="levelId"
			:checked="logLevel"
			:value="`${levelId}`"
			type="radio"
			name="loglevel"
			@update:checked="setLogLevel">
			{{ levelName }}
		</NcCheckboxRadioSwitch>
	</fieldset>
</template>

<script setup lang="ts">
import type { IAppSettings } from '../../interfaces'

import { computed } from 'vue'
import { showError } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { useSettingsStore } from '../../store/settings'
import { logger } from '../../utils/logger'
import { LOGGING_LEVEL_NAMES } from '../../constants'

import NcCheckboxRadioSwitch from '@nextcloud/vue/dist/Components/NcCheckboxRadioSwitch.js'

const settingsStore = useSettingsStore()

/**
 * Get currently set loglevel
 */
const logLevel = computed(() => `${settingsStore.logLevel}`)

const setLogLevel = (level: string) => {
	const numericLevel = parseInt(level) as IAppSettings['logLevel']
	settingsStore.setSetting('logLevel', numericLevel)
		.catch(e => {
			showError(t('logreader', 'Could not set logging level'))
			logger.error(e as Error)
		})
}
</script>

<style scoped>
fieldset {
	padding: 6px;
}
</style>
