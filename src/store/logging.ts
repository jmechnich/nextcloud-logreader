/**
 * SPDX-FileCopyrightText: 2023 Ferdinand Thiessen <opensource@fthiessen.de>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { AxiosError } from 'axios'
import type { ILogEntry } from '../interfaces'

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getLog, pollLog } from '../api'
import { POLLING_INTERVAL } from '../constants'
import { showError } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'
import { debounce } from '../utils/debounce'
import { useSettingsStore } from './settings'
import { parseLogFile } from '../utils/logfile'
import { logger } from '../utils/logger'

/**
 * Store for handling log entries
 */
export const useLogStore = defineStore('logreader-logs', () => {
	const _settings = useSettingsStore()

	/**
	 * List of all log entries
	 */
	const allEntries = ref<ILogEntry[]>([])

	/**
	 * The current query to filter logs
	 */
	const query = ref<string>('')

	/**
	 * List of filtered log entries (search query)
	 */
	const entries = computed(() => query.value ? allEntries.value.filter(entry => JSON.stringify(entry).includes(query.value)) : allEntries.value)

	/**
	 * Whether there are more remaining (older) log entries on the server
	 */
	const hasRemainingEntries = ref(true)

	/**
	 * Whether polling service is currently running
	 */
	const _polling = ref(false)

	/**
	 * Whether we are currently loading, used to prevent multiple loading requests at the same time
	 */
	const _loading = ref(false)

	/**
	 * Load more entries from server
	 *
	 * @param older Load older entries (default: true)
	 */
	async function loadMore(older = true) {
		// Nothing to do if local file
		if (_settings.localFile) return

		// Only load any entries if there is no previous unfinished request
		if (!(_loading.value = !_loading.value)) return

		try {
			if (older) {
				const { data } = await getLog({ offset: allEntries.value.length })
				allEntries.value.push(...data.data)
				hasRemainingEntries.value = data.remain
			} else {
				const { data } = await pollLog({ lastReqId: allEntries.value?.[0]?.reqId || '' })
				allEntries.value.splice(0, 0, ...data)
			}
		} finally {
			// Handle any error to prevent a dead lock of the _loading property
			_loading.value = false
		}
	}

	/**
	 * Load entries from log file
	 */
	async function loadFile() {
		if (!_settings.localFile) {
			logger.debug('Can not read file, no file was uploaded')
			return
		}

		allEntries.value = await parseLogFile(_settings.localFile)
		hasRemainingEntries.value = false
	}

	/**
	 * Stop polling entries
	 */
	function stopPolling() {
		_polling.value = false
	}

	/**
	 * Start polling new entries from server
	 */
	function startPolling() {
		if (_polling.value) {
			// Already polling, nothing to do
			return
		}

		const doPolling = async () => {
			try {
				// Only poll if not using a local file
				if (!_settings.localFile) {
					const { data } = await pollLog({ lastReqId: allEntries.value?.[0]?.reqId || '' })
					allEntries.value.splice(0, 0, ...data)
				}
			} catch (e) {
				logger.warn('Unexpected error while polling for new log entries', { error: e })
				const error = e as AxiosError
				if ((error.status || 0) >= 500) {
					showError(t('logreader', 'Could not fetch new log entries (server unavailable)'))
				} else {
					showError(t('logreader', 'Could not fetch new entries'))
				}
			} finally {
				if (_polling.value) {
					window.setTimeout(doPolling, POLLING_INTERVAL)
				}
			}
		}

		_polling.value = true
		window.setTimeout(doPolling, POLLING_INTERVAL)
	}

	/**
	 * Search the logs for a string
	 *
	 * First it sets the query string so the filtered entries are updated,
	 * then it searched on the server for other logs
	 *
	 * @param search The query string
	 */
	function searchLogs(search = '') {
		query.value = search
		if (search !== '') {
			// Actual server side search
			debounce(() => loadMore(), 500)
		}
	}

	return { allEntries, entries, hasRemainingEntries, query, loadMore, loadFile, startPolling, stopPolling, searchLogs }
})
