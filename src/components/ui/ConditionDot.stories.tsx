import type { Meta, StoryObj } from '@storybook/react-vite'
import { ConditionDot } from './ConditionDot'
import { CONDITIONS, conditionLabel } from '@/lib/condition'

const meta = {
  title: 'UI/ConditionDot',
  component: ConditionDot,
  args: { condition: 'Mint', ring: false },
  argTypes: {
    condition: { control: 'select', options: CONDITIONS.map((c) => c.value) },
    ring: { control: 'boolean' },
  },
} satisfies Meta<typeof ConditionDot>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Scale: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      {CONDITIONS.map((c) => (
        <span key={c.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <ConditionDot condition={c.value} />
          {conditionLabel(c.value)}
        </span>
      ))}
    </div>
  ),
}
