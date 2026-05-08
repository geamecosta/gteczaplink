import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AuthDialog } from '@/components/AuthDialog'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="container max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            GtecZap<span className="text-emerald-600 font-medium">Link</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            onClick={() =>
              document.getElementById('plataforma')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="hidden md:flex font-semibold text-slate-600 hover:text-slate-900"
          >
            Recursos
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="hidden md:flex font-semibold text-slate-600 hover:text-slate-900"
          >
            Planos
          </Button>
          <div className="w-px h-6 bg-slate-200 hidden md:block mx-2" />
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm font-medium text-slate-400 hidden lg:inline-block border-l border-slate-200 pl-4">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="rounded-full font-semibold"
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AuthDialog
                defaultMode="login"
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    className="font-semibold rounded-full hidden sm:flex"
                  >
                    Entrar
                  </Button>
                }
              />
              <AuthDialog
                defaultMode="register"
                trigger={
                  <Button
                    type="button"
                    className="rounded-full font-semibold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform duration-300"
                  >
                    Começar Grátis
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
