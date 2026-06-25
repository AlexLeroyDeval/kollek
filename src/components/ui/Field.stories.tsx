import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'

const meta = {
  title: 'UI/Field',
  component: Field,
  args: { label: 'État', value: 'Très bon' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Accent: Story = { args: { label: 'Prix de vente', value: '45 €', accent: true } }
