import type { UserConfig } from 'vitest/config'
import { createAppConfig } from '@susnux/nextcloud-vite-config'

const config = createAppConfig({
	main: 'src/index.ts',
}, {
	// Build the css/logreader-style.css instead of inlineing the styles in the js bundle
	inlineCSS: false,
	// Configuration for vitest unit tests
	config: {
		test: {
			coverage: {
				all: true,
				include: ['src/**'],
				provider: 'istanbul',
				reporter: ['lcov', 'text'],
			},
			environment: 'happy-dom',
			alias: [{ find: /^vue$/, replacement: 'vue/dist/vue.runtime.common.js' }],
		},
	} as UserConfig,
})

export default config
