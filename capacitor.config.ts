import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.calmspend.app',
  appName: 'Calm Spend',
  webDir: 'dist',
  backgroundColor: '#dce1f1',
  ios: {
    // Let content sit under the status bar; the app draws its own safe padding.
    contentInset: 'always',
  },
}

export default config
