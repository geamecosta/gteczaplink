import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-slate-900 selection:bg-emerald-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-[0.15] pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-transparent blur-3xl rounded-full mix-blend-multiply" />
      </div>

      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 md:py-12 relative z-0">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-16 mt-20 relative z-10">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 font-medium">
            © {new Date().getFullYear()} GtecZap Link. Uma ferramenta da Plataforma GtecZap.
          </p>
        </div>
      </footer>
    </div>
  )
}
