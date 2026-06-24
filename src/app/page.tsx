import { Header } from '@/components/layout/Header'
import { CollectionView } from '@/components/collection/CollectionView'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <CollectionView />
      </main>
    </>
  )
}
