import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getReferralStatus } from '@/services/waitlist'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy, Copy, Users } from 'lucide-react'
import { toast } from 'sonner'

const formSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

export default function ReferralStatus() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const origin = window.location.origin

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: any) {
    setLoading(true)
    try {
      const { data, error } = await getReferralStatus(values.email)
      if (error) throw error
      if (!data) {
        toast.error('E-mail não encontrado na lista de espera.')
      } else {
        setStatus(data)
      }
    } catch (err) {
      toast.error('Erro ao buscar status.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (status?.referral_code) {
      navigator.clipboard.writeText(`${origin}/?ref=${status.referral_code}`)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 min-h-[70vh]">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-6 shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Status da Indicação
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Acompanhe quantas pessoas já entraram na lista através do seu link exclusivo.
        </p>
      </div>

      {!status ? (
        <Card
          className="border-slate-200 shadow-xl rounded-3xl animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Consultar meu progresso</CardTitle>
            <CardDescription className="text-base">
              Digite o e-mail que você usou para se cadastrar na lista de espera.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="seu@email.com"
                          className="h-14 rounded-xl text-lg text-center"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-center" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  Ver Meu Status
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="pt-8">
              <div className="text-center mb-8">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">
                  Seu Desempenho, {status.name.split(' ')[0]}!
                </p>
                <div className="flex flex-col items-center justify-center bg-white w-32 h-32 mx-auto rounded-full shadow-md border border-emerald-100 mb-4">
                  <span className="text-5xl font-extrabold text-emerald-600">
                    {status.referral_count}
                  </span>
                  <Users className="w-5 h-5 text-emerald-400 mt-1" />
                </div>
                <p className="text-slate-600 font-medium text-lg">
                  amigos cadastrados pelo seu link
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative">
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-center">
                  Seu Link Exclusivo
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${origin}/?ref=${status.referral_code}`}
                    className="font-mono text-sm bg-slate-50 border-slate-200 text-slate-600 focus-visible:ring-emerald-500 text-center"
                  />
                  <Button
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 shadow-md text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setStatus(null)}
                  className="text-slate-500 hover:text-slate-700 font-medium"
                >
                  Consultar outro e-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
