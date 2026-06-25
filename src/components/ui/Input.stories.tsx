import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Input } from './Input'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { label: "Prix d'achat (€)", type: 'number', value: '', placeholder: '0.00', onChange: () => {} },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'number', 'date'] },
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return (
      <div style={{ width: 240 }}>
        <Input {...args} value={value} onChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
