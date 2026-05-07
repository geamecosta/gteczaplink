import { Outlet } from 'react-router-dom'
import { Phone, Github, Twitter } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <header className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 text-primary font-bold text-xl hover:opacity-80 transition-opacity cursor-pointer">
            <Phone className="w-6 h-6 fill-current" />
            <span>WhatsLink</span>
          </div>
          <nav>
            <a
              href="#como-funciona"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Como funciona
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <Outlet />
      </main>

      <footer className="w-full border-t bg-white py-8">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WhatsLink. Feito para produtividade.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
