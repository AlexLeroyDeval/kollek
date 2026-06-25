import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Chip } from './Chip'

const meta = {
  title: 'UI/Chip',
  component: Chip,
  args: { children: 'Bon', active: false, onClick: () => {} },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {}
export const Active: Story = { args: { active: true } }

export const Toggle: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState(false)
    return (
      <Chip active={active} onClick={() => setActive((v) => !v)}>
        Cliquable
      </Chip>
    )
  },
}
