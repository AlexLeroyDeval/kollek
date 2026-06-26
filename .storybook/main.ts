import type { StorybookConfig } from '@storybook/react-vite'
import { fileURLToPath } from 'node:url'

const config: StorybookConfig = {
  stories: ['../src/components/ui/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Tailwind v4 doit traiter globals.css (importé dans preview) pour générer
  // les utilitaires et exposer nos tokens dans le canvas Storybook.
  // @tailwindcss/vite est ESM-only : import dynamique obligatoire ici.
  // L'alias @/ (paths tsconfig) doit être redéclaré : le Vite de Storybook ne le lit pas.
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite')
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    })
  },
}

export default config
