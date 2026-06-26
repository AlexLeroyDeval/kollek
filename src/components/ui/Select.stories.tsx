import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Select } from './Select'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: {
    value: '',
    'aria-label': 'Plateforme',
    onChange: () => {},
    children: (
      <>
        <option value="">Toutes plateformes</option>
        <option value="gb">Game Boy</option>
        <option value="snes">SNES</option>
        <option value="ps1">PS1</option>
      </>
    ),
  },
  render: function Render(args) {
    const [value, setValue] = useState('')
    return <Select {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
