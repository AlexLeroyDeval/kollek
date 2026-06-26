import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConditionBadge } from './ConditionBadge'
import { CONDITIONS } from '@/lib/condition'

const meta = {
  title: 'UI/ConditionBadge',
  component: ConditionBadge,
  args: { condition: 'Mint' },
  argTypes: {
    condition: { control: 'select', options: CONDITIONS.map((c) => c.value) },
  },
} satisfies Meta<typeof ConditionBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Scale: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {CONDITIONS.map((c) => (
        <ConditionBadge key={c.value} condition={c.value} />
      ))}
    </div>
  ),
}
