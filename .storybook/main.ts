import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/components/ui/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Tailwind v4 doit traiter globals.css (importé dans preview) pour générer
  // les utilitaires et exposer nos tokens dans le canvas Storybook.
  // @tailwindcss/vite est ESM-only : import dynamique obligatoire ici.
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import('vite')
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    return mergeConfig(viteConfig, { plugins: [tailwindcss()] })
  },
}

export default config
