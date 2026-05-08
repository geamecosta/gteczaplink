import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail, Phone, User as UserIcon, Check, Copy, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { joinWaitlist } from '@/services/waitlist'

const formSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone incompleto'),
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

interface WaitlistDialogProps {
  trigger: React.ReactNode
}

export function WaitlistDialog({ trigger }: WaitlistDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')
  const origin = window.location.origin

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', phone: '' },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const { data, error } = await joinWaitlist(values.name, values.email, values.phone, refCode)

      if (error) throw error

      toast.success('Você entrou na lista de espera!')
      setSuccessData(data)
    } catch (err: any) {
      console.error('Waitlist submit error:', err)
      toast.error('Erro ao entrar na lista de espera. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setTimeout(() => {
        setSuccessData(null)
        form.reset()
      }, 300)
    }
  }

  const handleCopyLink = () => {
    if (successData?.referral_code) {
      navigator.clipboard.writeText(`${origin}/?ref=${successData.referral_code}`)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {successData ? (
          <div className="py-6 text-center space-y-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-full flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              Você está na lista!
            </h3>
            <p className="text-sm text-slate-500 px-4">
              Seu lugar está garantido. Fique de olho no seu WhatsApp e e-mail para novidades
              exclusivas.
            </p>

            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 mt-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Share2 className="w-24 h-24" />
              </div>
              <p className="text-sm font-bold text-emerald-900 mb-1">🎁 Ganhe meses PRO grátis!</p>
              <p className="text-xs text-emerald-700/80 mb-4">
                Compartilhe seu link exclusivo. Quem trouxer mais pessoas para a lista ganha meses
                de acesso PRO gratuito.
              </p>
              <div className="flex items-center gap-2 relative z-10">
                <Input
                  readOnly
                  value={`${origin}/?ref=${successData.referral_code}`}
                  className="text-xs font-mono bg-white border-emerald-200 focus-visible:ring-emerald-500"
                />
                <Button
                  size="icon"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-md"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full mt-2" variant="ghost" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Entrar na Lista de Espera</DialogTitle>
              <DialogDescription>
                Deixe seus contatos para ser um dos primeiros a usar o GtecZap PRO com condições
                exclusivas.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input placeholder="Seu nome completo" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="seu@email.com"
                            type="email"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (WhatsApp)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="(11) 99999-9999"
                            className="pl-9"
                            {...field}
                            onChange={(e) => field.onChange(applyPhoneMask(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full shadow-lg shadow-emerald-500/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Garantir minha vaga
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
