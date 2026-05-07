import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  )
}
