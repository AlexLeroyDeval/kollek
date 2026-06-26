import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Badge', tone: 'muted', size: 'sm' },
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'muted', 'edition', 'overlay'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge tone="accent" className="font-semibold uppercase tracking-wide">Vendu</Badge>
      <Badge tone="accent" className="font-semibold">×2</Badge>
      <Badge tone="success" size="md">En collection</Badge>
      <Badge tone="muted" size="md">Vendu</Badge>
      <Badge tone="edition">Platinum</Badge>
      <Badge tone="overlay">Édition</Badge>
    </div>
  ),
}
