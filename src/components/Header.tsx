import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AuthDialog } from '@/components/AuthDialog'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">GtecZap Link</span>
        </Link>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
          ) : (
            <AuthDialog />
          )}
        </div>
      </div>
    </header>
  )
}
