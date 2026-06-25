import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'
import { Button } from './Button'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Bouton', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'ghostDanger', 'dangerSolid'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md'] },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary', children: 'Annuler' } }
export const Ghost: Story = { args: { variant: 'ghost', children: 'Dupliquer' } }
export const GhostDanger: Story = { args: { variant: 'ghostDanger', children: 'Supprimer' } }
export const DangerSolid: Story = { args: { variant: 'dangerSolid', children: 'Supprimer' } }
export const Loading: Story = { args: { loading: true, children: 'Enregistrer' } }
export const WithIcon: Story = { args: { icon: <Plus size={14} />, children: 'Ajouter un jeu' } }

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghostDanger">Ghost danger</Button>
      <Button variant="dangerSolid">Danger solid</Button>
    </div>
  ),
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
    </div>
  ),
}
