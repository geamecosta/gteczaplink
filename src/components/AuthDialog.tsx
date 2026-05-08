import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function AuthDialog({
  trigger,
  defaultMode = 'login',
}: {
  trigger?: React.ReactNode
  defaultMode?: 'login' | 'register'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(defaultMode === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultMode === 'login')
      setEmail('')
      setPassword('')
    }
  }, [isOpen, defaultMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Preencha todos os campos')

    setLoading(true)
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!')
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm">
            Entrar / Cadastrar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isLogin ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-slate-700">
              Email profissional
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com.br"
              disabled={loading}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold text-slate-700">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="h-12"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-bold shadow-md"
            disabled={loading}
          >
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {isLogin ? 'Entrar' : 'Criar minha conta'}
          </Button>
          <div className="text-center text-sm mt-4">
            <button
              type="button"
              className="text-slate-500 font-medium hover:text-slate-900 transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
