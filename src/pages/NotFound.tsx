import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent animate-fade-in-up px-4 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-8xl font-black text-primary drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Página não encontrada</h2>
      </div>
      <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
        Ops! Parece que você tentou acessar uma página que não existe ou foi movida para outro
        endereço.
      </p>
      <Button
        asChild
        size="lg"
        className="h-12 px-8 text-base shadow-md hover:scale-105 transition-all duration-300"
      >
        <Link to="/">
          <Home className="w-5 h-5 mr-2" />
          Voltar para o Início
        </Link>
      </Button>
    </div>
  )
}

export default NotFound
