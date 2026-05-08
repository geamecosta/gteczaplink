import { CheckCircle2, Copy, ExternalLink, QrCode, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function ResultBox({ link, onReset }: { link: string; onReset: () => void }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(link)
    toast.success('Link copiado com sucesso!', {
      description: 'Cole onde desejar. Para rastrear os cliques, conheça o plano PRO.',
    })
  }

  return (
    <Card className="h-full border-emerald-500/20 shadow-xl shadow-emerald-500/5 bg-white/80 backdrop-blur-md animate-fade-in-up flex flex-col overflow-hidden">
      <div className="h-2 w-full bg-gradient-to-r from-emerald-400 to-teal-500 absolute top-0 left-0" />
      <CardHeader className="pt-8">
        <CardTitle className="flex items-center gap-3 text-emerald-600 text-2xl font-extrabold">
          <CheckCircle2 className="w-8 h-8" />
          Pronto! Seu link foi gerado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Seu link oficial:
          </label>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 group hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-colors shadow-inner">
            <span className="text-sm font-semibold truncate text-slate-800 select-all">{link}</span>
            <Button
              size="icon"
              variant="secondary"
              className="shrink-0 bg-white shadow-sm border border-slate-200 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 shadow-md hover:shadow-lg transition-all text-base h-12 font-bold hover:scale-[1.02] duration-200"
            asChild
          >
            <a href={link} target="_blank" rel="noreferrer">
              <ExternalLink className="w-5 h-5 mr-2" />
              Testar Link
            </a>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 bg-white hover:bg-slate-50 border-slate-200 transition-all h-12 text-base font-bold hover:scale-[1.02] duration-200"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Ver QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">
                  QR Code do seu Link
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=10&data=${encodeURIComponent(link)}`}
                    alt="QR Code do WhatsApp"
                    className="w-56 h-56"
                  />
                </div>
                <p className="text-sm text-slate-500 font-medium text-center px-4 leading-relaxed">
                  Escaneie com a câmera do celular para iniciar a conversa imediatamente.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="pt-6 mt-auto flex flex-col gap-4 border-t border-slate-100">
          <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex gap-4 items-start relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Zap className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shrink-0 z-10">
              <Zap className="w-5 h-5" />
            </div>
            <div className="z-10">
              <h4 className="text-sm font-extrabold text-slate-900">Quer rastrear as vendas?</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                Faça upgrade para a versão PRO e tenha links curtos ilimitados, pixel de
                rastreamento e domínio próprio.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-emerald-600 text-xs font-bold mt-2 hover:text-emerald-700"
              >
                Conhecer a Plataforma PRO &rarr;
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-slate-500 font-bold hover:text-slate-900 w-full hover:bg-slate-50"
          >
            Criar outro link gratuito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
