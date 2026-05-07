import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, ShieldCheck, Link as LinkIcon, Loader2 } from 'lucide-react'

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

  return (
    <div className="animate-fade-in-up">
      <div className="text-center space-y-4 mb-10 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Crie seu Link de WhatsApp em{' '}
          <span className="text-primary bg-primary/10 px-3 py-1 rounded-xl inline-block mt-2 md:mt-0 shadow-sm">
            Segundos
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
          Transforme seu número em um link curto e personalizado para facilitar suas vendas,
          contatos e redes sociais.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch mb-20">
        <Card className="shadow-xl shadow-black/5 border-muted/50 overflow-hidden bg-white/70 backdrop-blur-xl animate-fade-in">
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="sm:w-[140px]">
                        <FormLabel className="text-foreground/80 font-semibold">Código</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white h-12">
                              <SelectValue placeholder="País" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="55">🇧🇷 +55</SelectItem>
                            <SelectItem value="351">🇵🇹 +351</SelectItem>
                            <SelectItem value="1">🇺🇸 +1</SelectItem>
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
                        <FormLabel className="text-foreground/80 font-semibold">
                          Número de Telefone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(11) 99999-9999"
                            className="bg-white focus-visible:ring-primary text-base h-12"
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
                        <FormLabel className="text-foreground/80 font-semibold">
                          Mensagem (opcional)
                        </FormLabel>
                        <span
                          className={cn(
                            'text-xs transition-colors font-medium',
                            (field.value?.length || 0) > 900
                              ? 'text-destructive'
                              : 'text-muted-foreground',
                          )}
                        >
                          {field.value?.length || 0}/1000
                        </span>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Olá! Gostaria de saber mais sobre os seus serviços."
                          className="resize-none h-36 bg-white focus-visible:ring-primary text-base leading-relaxed"
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
                  className="w-full text-lg h-14 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary/25 rounded-xl font-semibold"
                  disabled={!form.formState.isValid || isGenerating || !!generatedLink}
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 mr-2" />
                  )}
                  {generatedLink ? 'Link Gerado!' : 'Gerar Link Grátis'}
                </Button>

                {!user && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Dica: Faça login para salvar seus links no histórico.
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="h-full relative">
          {generatedLink ? (
            <ResultBox link={generatedLink} onReset={() => setGeneratedLink(null)} />
          ) : (
            <PreviewBox message={messageValue} />
          )}
        </div>
      </div>

      {user && (
        <section className="mb-20">
          <HistorySection key={refreshKey} />
        </section>
      )}

      <section id="como-funciona" className="grid md:grid-cols-3 gap-8 pt-12 border-t border-muted">
        <FeatureCard
          icon={Sparkles}
          title="100% Gratuito"
          desc="Gere quantos links personalizados você precisar sem pagar um centavo sequer."
        />
        <FeatureCard
          icon={ShieldCheck}
          title="Seguro & Privado"
          desc="Seus links só são salvos se você criar uma conta, mantendo total controle sobre seus dados."
        />
        <FeatureCard
          icon={LinkIcon}
          title="Ideal para Redes Sociais"
          desc="Coloque o link na bio do seu Instagram, TikTok ou YouTube e atraia mais contatos."
        />
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-white shadow-sm border border-muted/50 hover:border-primary/30 transition-all duration-300 group hover:shadow-md">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-bold text-xl text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{desc}</p>
    </div>
  )
}
