import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Pencil, AlertCircle } from 'lucide-react'
import { updateLink } from '@/services/links'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface EditLinkDialogProps {
  link: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updatedLink: any) => void
}

export function EditLinkDialog({ link, open, onOpenChange, onSaved }: EditLinkDialogProps) {
  const [title, setTitle] = useState('')
  const [destinationUrl, setDestinationUrl] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    if (link && open) {
      let cleanUrl = link.destination_url || ''
      try {
        const urlToCheck = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`
        const urlObj = new URL(urlToCheck)
        urlObj.searchParams.delete('utm_source')
        urlObj.searchParams.delete('utm_medium')
        urlObj.searchParams.delete('utm_campaign')
        cleanUrl = urlObj.toString()
      } catch {
        // keep raw value if URL parsing fails
      }
      setTitle(link.title || '')
      setDestinationUrl(cleanUrl)
      setUtmSource(link.utm_source || '')
      setUtmMedium(link.utm_medium || '')
      setUtmCampaign(link.utm_campaign || '')
      setTags(Array.isArray(link.tags) ? link.tags.join(', ') : '')
      setUrlError('')
    }
  }, [link, open])

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false
    try {
      const urlToCheck =
        url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
      new URL(urlToCheck)
      return true
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    if (!link) return
    if (!destinationUrl.trim()) {
      setUrlError('A URL de destino é obrigatória.')
      return
    }
    if (!validateUrl(destinationUrl)) {
      setUrlError('Por favor, insira uma URL válida.')
      return
    }
    setSaving(true)
    const { data, error } = await updateLink(link.id, {
      title: title.trim() || null,
      destination_url: destinationUrl.trim(),
      tags: tags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean),
      utm_source: utmSource.trim() || null,
      utm_medium: utmMedium.trim() || null,
      utm_campaign: utmCampaign.trim() || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Erro ao salvar alterações. Tente novamente.')
    } else {
      toast.success('Link atualizado com sucesso!')
      onSaved(data)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] p-0 overflow-hidden border-0 bg-white">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
          <DialogTitle className="text-2xl font-extrabold mb-1 flex items-center gap-2">
            <Pencil className="w-6 h-6" /> Editar Link
          </DialogTitle>
          <DialogDescription className="text-emerald-50 text-sm font-medium">
            Atualize os detalhes do seu link. O slug e a URL curta permanecem inalterados.
          </DialogDescription>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              Título <span className="text-slate-400 font-normal">(Opcional)</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Campanha de Lançamento"
              className="h-11 rounded-xl border-slate-200 text-slate-900 focus:border-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              URL de Destino <span className="text-red-500">*</span>
            </Label>
            <Input
              value={destinationUrl}
              onChange={(e) => {
                setDestinationUrl(e.target.value)
                setUrlError('')
              }}
              placeholder="https://exemplo.com/pagina"
              className={cn(
                'h-11 rounded-xl text-slate-900 focus:border-emerald-500',
                urlError ? 'border-red-400' : 'border-slate-200',
              )}
            />
            {urlError && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {urlError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              Tags <span className="text-slate-400 font-normal">(separadas por vírgula)</span>
            </Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: dpimenta, parceiros44"
              className="h-11 rounded-xl border-slate-200 text-slate-900 focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500">
              Etiquetas para organizar seus links na listagem.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">UTM Source</Label>
              <Input
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="instagram"
                className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">UTM Medium</Label>
              <Input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="bio"
                className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">UTM Campaign</Label>
              <Input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="promo_blackfriday"
                className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold border-slate-200 text-slate-700 h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-8"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
