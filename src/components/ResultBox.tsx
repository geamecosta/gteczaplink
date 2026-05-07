import { CheckCircle2, Copy, ExternalLink, QrCode } from 'lucide-react'
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
    toast.success('Link copiado para a área de transferência!', {
      description: 'Agora é só colar onde quiser e começar a usar.',
    })
  }

  return (
    <Card className="h-full border-primary/20 shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in-up flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary text-2xl font-bold">
          <CheckCircle2 className="w-7 h-7" />
          Pronto! Link Gerado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Seu link de WhatsApp:</label>
          <div className="p-4 bg-white border border-muted-foreground/20 rounded-xl flex items-center justify-between gap-4 group hover:border-primary/50 transition-colors shadow-sm">
            <span className="text-sm font-medium truncate text-foreground select-all">{link}</span>
            <Button
              size="icon"
              variant="secondary"
              className="shrink-0 hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 shadow-md hover:shadow-lg transition-all text-base h-12 hover:scale-105 duration-200"
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
                className="flex-1 bg-white hover:bg-gray-50 transition-colors h-12 text-base hover:scale-105 duration-200"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Ver QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">QR Code do seu Link</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&margin=10&data=${encodeURIComponent(link)}`}
                    alt="QR Code do WhatsApp"
                    className="w-56 h-56"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center px-4 leading-relaxed">
                  Escaneie com a câmera do celular para abrir a conversa instantaneamente no
                  WhatsApp.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="pt-6 mt-auto text-center">
          <Button
            variant="ghost"
            onClick={onReset}
            className="text-muted-foreground hover:text-primary"
          >
            Criar outro link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
