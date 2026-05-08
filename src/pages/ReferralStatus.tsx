import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Share2, Copy, Search, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function ReferralStatus() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const origin = window.location.origin

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    const { data: lead, error } = await supabase
      .from('waitlist' as any)
      .select('*')
      .eq('email', email)
      .single()

    setLoading(false)

    if (error || !lead) {
      toast.error('Cadastro não encontrado com este e-mail.')
      setData(null)
    } else {
      setData(lead)
    }
  }

  const handleCopy = () => {
    if (data?.referral_code) {
      navigator.clipboard.writeText(`${origin}/?ref=${data.referral_code}`)
      toast.success('Link copiado!')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16 animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Status da Indicação
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Acompanhe quantas pessoas se cadastraram pelo seu link e garanta seus meses de acesso PRO
          gratuito.
        </p>
      </div>

      {!data ? (
        <Card className="max-w-md mx-auto shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Consultar meu status</CardTitle>
            <CardDescription>
              Digite o e-mail que você usou no cadastro da lista de espera.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                {loading ? (
                  <Search className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md border-0">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-1">Amigos Indicados</h3>
                <p className="text-5xl font-extrabold">{data.referral_count || 0}</p>
                <p className="text-emerald-100 text-sm mt-2">
                  Continue indicando para ganhar o PRO!
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">Sua Posição</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Você está na lista de espera. Quanto mais indicar, mais rápido terá acesso às
                  novidades.
                </p>
                <Button
                  variant="outline"
                  className="w-full text-slate-700"
                  onClick={() => setData(null)}
                >
                  Consultar outro e-mail
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200 bg-slate-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Share2 className="w-5 h-5 text-emerald-600" /> Seu Link Exclusivo
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-md border border-slate-200">
                <Input
                  readOnly
                  value={`${origin}/?ref=${data.referral_code}`}
                  className="font-mono text-sm border-0 focus-visible:ring-0 px-2 bg-transparent"
                />
                <Button
                  onClick={handleCopy}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 shadow-sm shrink-0"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
