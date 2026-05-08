import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Sparkles,
  Loader2,
  ArrowRight,
  BarChart3,
  Globe,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Lock,
  MessageSquare,
} from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { PreviewBox } from '@/components/PreviewBox'
import { ResultBox } from '@/components/ResultBox'
import { HistorySection } from '@/components/HistorySection'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { saveLink } from '@/services/whatsapp-links'
import { toast } from 'sonner'
import { AuthDialog } from '@/components/AuthDialog'

const formSchema = z.object({
  countryCode: z.string().min(1),
  phone: z.string().min(14, 'Número inválido. Digite o DDD + telefone.'),
  message: z.string().max(1000, 'A mensagem deve ter no máximo 1000 caracteres.').optional(),
})

type FormValues = z.infer<typeof formSchema>

function applyPhoneMask(value: string) {
  value = value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)

  if (value.length > 2) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`
  }
  if (value.length > 10) {
    value = `${value.slice(0, 10)}-${value.slice(10)}`
  }
  return value
}

export default function Index() {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const { user } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { countryCode: '55', phone: '', message: '' },
    mode: 'onChange',
  })

  const messageValue = useWatch({ control: form.control, name: 'message' })

  useEffect(() => {
    const subscription = form.watch(() => {
      if (generatedLink) setGeneratedLink(null)
    })
    return () => subscription.unsubscribe()
  }, [form, generatedLink])

  async function onSubmit(values: FormValues) {
    setIsGenerating(true)
    try {
      const cleanPhone = values.phone.replace(/\D/g, '')
      let url = `https://wa.me/${values.countryCode}${cleanPhone}`
      if (values.message && values.message.trim() !== '') {
        url += `?text=${encodeURIComponent(values.message.trim())}`
      }

      const formattedPhone = `+${values.countryCode} ${values.phone}`
      const { error } = await saveLink(user?.id, formattedPhone, values.message, url)

      if (error) {
        console.error('Erro ao salvar no histórico:', error)
      }

      setGeneratedLink(url)
      if (user) {
        setRefreshKey((k) => k + 1)
      }
    } catch (err) {
      toast.error('Erro ao gerar o link. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScroll = () => {
    document.getElementById('gerador')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="pb-20">
      {/* HERO SECTION */}
      <div className="text-center space-y-6 mb-16 md:mb-24 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm mb-4 animate-fade-in-up">
          <Zap className="w-4 h-4 fill-emerald-600" />
          <span>Novo: Rastreamento avançado de UTMs disponível na versão PRO</span>
        </div>
        <h1
          className="text-5xl md:text-6xl lg:text-[5rem] font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          Transforme seu WhatsApp em uma{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-700">
            máquina de vendas
          </span>
          .
        </h1>
        <p
          className="text-xl text-slate-600 max-w-2xl mx-auto font-medium animate-fade-in-up leading-relaxed"
          style={{ animationDelay: '200ms' }}
        >
          Pare de perder clientes com links feios e desorganizados. Crie links profissionais, com
          aparência premium e prontos para conversão em segundos.
        </p>
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <Button
            size="lg"
            onClick={handleScroll}
            className="h-14 px-8 text-lg font-bold rounded-full shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            Criar Link Grátis
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg font-bold rounded-full border-slate-200 hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto bg-white"
          >
            Ver Plataforma Completa <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* GENERATOR TOOL */}
      <div
        id="gerador"
        className="scroll-mt-32 grid lg:grid-cols-12 gap-8 items-stretch mb-32 max-w-6xl mx-auto"
      >
        <div className="lg:col-span-7">
          <Card className="shadow-2xl shadow-slate-200/50 border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-xl animate-fade-in h-full flex flex-col rounded-3xl">
            <CardContent className="p-8 sm:p-10 flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Crie seu Link Grátis</h3>
                <p className="text-slate-500 font-medium">
                  Preencha os dados abaixo e visualize a prévia ao lado.
                </p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="sm:w-[140px]">
                          <FormLabel className="text-slate-700 font-bold">Código</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-50 border-slate-200 h-14 font-semibold text-slate-700 rounded-xl focus:ring-emerald-500">
                                <SelectValue placeholder="País" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="55" className="font-semibold">
                                🇧🇷 +55
                              </SelectItem>
                              <SelectItem value="351" className="font-semibold">
                                🇵🇹 +351
                              </SelectItem>
                              <SelectItem value="1" className="font-semibold">
                                🇺🇸 +1
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-slate-700 font-bold">
                            Número do WhatsApp
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(11) 99999-9999"
                              className="bg-slate-50 border-slate-200 h-14 font-semibold text-slate-900 rounded-xl focus-visible:ring-emerald-500 text-lg placeholder:text-slate-400 placeholder:font-normal"
                              {...field}
                              onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-slate-700 font-bold">
                            Mensagem (opcional)
                          </FormLabel>
                          <span
                            className={cn(
                              'text-xs font-bold transition-colors',
                              (field.value?.length || 0) > 900 ? 'text-red-500' : 'text-slate-400',
                            )}
                          >
                            {field.value?.length || 0}/1000
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Olá! Gostaria de saber mais sobre os seus serviços."
                            className="resize-none h-36 bg-slate-50 border-slate-200 font-medium text-slate-900 rounded-xl focus-visible:ring-emerald-500 text-base leading-relaxed p-4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg h-14 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-emerald-500/20 rounded-xl font-bold mt-4 bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={!form.formState.isValid || isGenerating || !!generatedLink}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 mr-2" />
                    )}
                    {generatedLink ? 'Link Gerado!' : 'Gerar Link Profissional'}
                  </Button>

                  {!user && (
                    <div className="flex justify-center pt-2">
                      <AuthDialog
                        defaultMode="register"
                        trigger={
                          <button
                            type="button"
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            Quer salvar este link no histórico? Crie uma conta.
                          </button>
                        }
                      />
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 h-full relative">
          {generatedLink ? (
            <ResultBox link={generatedLink} onReset={() => setGeneratedLink(null)} />
          ) : (
            <PreviewBox message={messageValue} />
          )}
        </div>
      </div>

      {user && (
        <section className="mb-32">
          <HistorySection key={refreshKey} />
        </section>
      )}

      {/* SOCIAL PROOF */}
      <section className="mb-32">
        <div className="py-12 border-y border-slate-200/60 bg-white/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/50 to-transparent"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4">
            <p className="text-center text-sm font-extrabold text-slate-400 mb-8 uppercase tracking-widest">
              Mais de 10.000 empresas confiam na nossa tecnologia
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <img
                src="https://img.usecurling.com/i?q=stripe&color=black"
                className="h-7 object-contain"
                alt="Company"
              />
              <img
                src="https://img.usecurling.com/i?q=spotify&color=black"
                className="h-8 object-contain"
                alt="Company"
              />
              <img
                src="https://img.usecurling.com/i?q=amazon&color=black"
                className="h-8 object-contain"
                alt="Company"
              />
              <img
                src="https://img.usecurling.com/i?q=google&color=black"
                className="h-7 object-contain"
                alt="Company"
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="mb-32 max-w-5xl mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            A diferença é inegável
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Veja porque profissionais abandonam os links comuns e escolhem nossa ferramenta.
          </p>
        </div>
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 grid md:grid-cols-2 gap-12 md:gap-20 relative overflow-hidden">
          <div className="space-y-8 z-10 relative">
            <div className="flex items-center gap-3 text-slate-400 font-bold mb-8 text-xl uppercase tracking-wider">
              <XCircle className="w-6 h-6" /> O jeito antigo
            </div>
            <ul className="space-y-6 text-slate-500 font-medium text-lg">
              <li className="flex gap-4">
                <XCircle className="w-6 h-6 text-slate-300 shrink-0" /> URL feia, longa e amadora
              </li>
              <li className="flex gap-4">
                <XCircle className="w-6 h-6 text-slate-300 shrink-0" /> Nenhum rastreamento de
                cliques
              </li>
              <li className="flex gap-4">
                <XCircle className="w-6 h-6 text-slate-300 shrink-0" /> Impossível alterar link após
                enviado
              </li>
              <li className="flex gap-4">
                <XCircle className="w-6 h-6 text-slate-300 shrink-0" /> Perde leads pelo aspecto
                suspeito
              </li>
            </ul>
          </div>
          <div className="space-y-8 z-10 relative bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-8 -m-8 md:m-0 border border-emerald-100/50 shadow-inner">
            <div className="flex items-center gap-3 text-emerald-600 font-extrabold mb-8 text-xl uppercase tracking-wider">
              <CheckCircle2 className="w-6 h-6" /> GtecZap Link
            </div>
            <ul className="space-y-6 text-slate-800 font-bold text-lg">
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> Links curtos, limpos
                e premium
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> Analytics completo e
                UTMs (PRO)
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> QR Code dinâmico
                incluso
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> Aumenta a taxa de
                conversão em 40%
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* PRO FEATURES / ECOSYSTEM */}
      <section className="mb-32">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-sm font-bold tracking-widest uppercase mb-2">
            Ecossistema Completo
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold max-w-4xl mx-auto leading-[1.1] tracking-tight">
            Vá muito além de um simples gerador.
          </h2>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Evolua para nossa plataforma completa e desbloqueie o verdadeiro potencial de vendas e
            atendimento via WhatsApp.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          <ProCard
            icon={BarChart3}
            title="Analytics Avançado"
            desc="Métricas detalhadas de cliques, origens, dispositivos e conversão total."
            locked
          />
          <ProCard
            icon={Globe}
            title="Domínio Próprio"
            desc="Use 'link.suaempresa.com.br' ao invés do tradicional 'wa.me'."
            locked
          />
          <ProCard
            icon={Users}
            title="CRM e Equipe"
            desc="Atendimento multiusuário. Distribua os leads gerados entre seu time."
            locked
          />
          <ProCard
            icon={MessageSquare}
            title="Automação & IA"
            desc="Chatbots inteligentes para atender seus clientes 24h por dia."
            locked
          />
        </div>
        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="h-14 px-10 text-lg font-bold rounded-full bg-slate-900 hover:bg-slate-800 shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Conhecer Planos Premium
          </Button>
          <p className="mt-6 text-slate-500 font-medium">
            Ou comece usando o gerador gratuitamente, sem compromisso.
          </p>
        </div>
      </section>
    </div>
  )
}

function ProCard({
  icon: Icon,
  title,
  desc,
  locked = false,
}: {
  icon: any
  title: string
  desc?: string
  locked?: boolean
}) {
  return (
    <div className="relative p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-start text-left">
      {locked && (
        <div className="absolute top-6 right-6 bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wider">
          <Lock className="w-3 h-3" /> PRO
        </div>
      )}
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-bold text-xl text-slate-900 mb-3">{title}</h3>
      {desc && <p className="text-slate-500 text-[15px] font-medium leading-relaxed">{desc}</p>}
    </div>
  )
}
