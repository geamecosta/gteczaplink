import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { createShortLink, checkSlugAvailable, generateRandomSlug } from '@/services/links'
import { UtmSection } from '@/components/links/UtmSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AuthDialog } from '@/components/AuthDialog'
import {
  Link as LinkIcon,
  QrCode,
  Sparkles,
  ArrowLeft,
  Wand2,
  CheckCircle2,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag as TagIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

export default function CreateLink() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [destinationUrl, setDestinationUrl] = useState('')
  const [title, setTitle] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [qrCodeEnabled, setQrCodeEnabled] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')

  const [hasExpiration, setHasExpiration] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!customSlug.trim()) {
      setSlugStatus('idle')
      return
    }
    const timer = setTimeout(async () => {
      setSlugStatus('checking')
      const available = await checkSlugAvailable(customSlug.trim())
      setSlugStatus(available ? 'available' : 'taken')
    }, 400)
    return () => clearTimeout(timer)
  }, [customSlug])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim().replace(/^#/, '')
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setTagInput('')
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleGenerateSlug = () => {
    const random = generateRandomSlug(6)
    setCustomSlug(random)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destinationUrl.trim()) {
      toast.error('Insira a URL de destino.')
      return
    }

    if (slugStatus === 'taken') {
      toast.error('O apelido personalizado (back-half) já está em uso.')
      return
    }

    setIsSubmitting(true)

    const { error } = await createShortLink({
      destination_url: destinationUrl,
      title: title.trim() || undefined,
      short_slug: customSlug.trim() || undefined,
      tags,
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      expires_at: hasExpiration && expiresAt ? new Date(expiresAt).toISOString() : null,
      qr_code_enabled: qrCodeEnabled,
    })

    setIsSubmitting(false)

    if (error) {
      toast.error(error.message || 'Erro ao criar o link.')
    } else {
      toast.success('Link criado com sucesso!')
      navigate('/dashboard')
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <LinkIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Acesso Necessário</h2>
        <p className="text-slate-500 font-medium">
          Você precisa estar conectado para criar e personalizar seus links avançados.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/')} className="rounded-xl font-bold">
            Voltar
          </Button>
          <AuthDialog
            defaultMode="login"
            trigger={
              <Button className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                Entrar na Conta
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </button>

        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
          Link Personalizado
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Criar um novo link</h1>
        <p className="text-slate-500 font-medium mt-1">
          Gere links curtos, adicione parâmetros de rastreamento e crie QR Codes instantâneos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: LINK DETAILS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-600" /> Detalhes do Link
            </h3>
            <span className="text-xs text-slate-400 font-medium">Campos principais</span>
          </div>

          {/* Destination URL */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              URL de Destino <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              required
              placeholder="https://exemplo.com/sua-pagina-de-vendas"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="h-12 rounded-xl border-slate-200 text-slate-900 font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 text-base"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">
              Título do Link <span className="text-slate-400 font-normal">(Opcional)</span>
            </Label>
            <Input
              type="text"
              placeholder="Ex: Campanha de Lançamento Maio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:border-emerald-500"
            />
          </div>

          {/* Custom Back-half */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-800">
                Link Curto / Apelido (Back-half)
              </Label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" /> Gerar Aleatório
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-3 rounded-xl border border-slate-200 shrink-0">
                {typeof window !== 'undefined' ? `${window.location.host}/r/` : 'app/r/'}
              </div>
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="meu-link-especial"
                  value={customSlug}
                  onChange={(e) =>
                    setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  className="h-11 rounded-xl border-slate-200 text-slate-900 font-medium focus:border-emerald-500 pr-10"
                />
                {slugStatus === 'checking' && (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400 absolute right-3 top-3.5" />
                )}
                {slugStatus === 'available' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3.5" />
                )}
                {slugStatus === 'taken' && (
                  <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3.5" />
                )}
              </div>
            </div>
            {slugStatus === 'taken' && (
              <p className="text-xs text-red-500 font-medium">
                Este link personalizado já está em uso. Tente outro.
              </p>
            )}
            {slugStatus === 'available' && (
              <p className="text-xs text-emerald-600 font-medium">Este apelido está disponível!</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <TagIcon className="w-4 h-4 text-slate-500" /> Tags de Categoria
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1.5"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Pressione Enter ou vírgula para adicionar tag (ex: lancamento, instagram)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="h-11 rounded-xl border-slate-200 text-sm focus:border-emerald-500"
            />
          </div>
        </div>

        {/* SECTION 2: SHARING OPTIONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-4">
            <QrCode className="w-5 h-5 text-emerald-600" /> Opções de Compartilhamento
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <Label className="text-base font-bold text-slate-900 cursor-pointer">
                Gerar um QR Code
              </Label>
              <p className="text-xs text-slate-500 font-medium">
                Cria automaticamente um QR Code dinâmico vinculado a este link curto.
              </p>
            </div>
            <Switch checked={qrCodeEnabled} onCheckedChange={setQrCodeEnabled} />
          </div>

          {qrCodeEnabled && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-4 animate-fade-in">
              <div className="w-16 h-16 bg-white p-2 rounded-xl shadow-sm border border-emerald-200 flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    destinationUrl || 'https://gteczap.link',
                  )}`}
                  alt="QR Code Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">QR Code Ativado!</h4>
                <p className="text-xs text-slate-600 font-medium">
                  Você poderá visualizar e baixar a imagem em alta resolução no painel.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: ADVANCED SETTINGS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-6 md:px-8 text-left flex items-center justify-between font-extrabold text-slate-900 hover:bg-slate-50/80 transition-colors"
          >
            <span className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Configurações Avançadas de Campanha
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-6 md:p-8 pt-0 border-t border-slate-100 space-y-6 animate-fade-in">
              {/* UTM Parameters */}
              <div className="space-y-3 pt-4">
                <h4 className="font-bold text-slate-900 text-sm">Parâmetros UTM de Rastreamento</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Adicione tags UTM ao link de destino para analisar no Google Analytics ou Pixel.
                </p>
                <UtmSection
                  utmSource={utmSource}
                  setUtmSource={setUtmSource}
                  utmMedium={utmMedium}
                  setUtmMedium={setUtmMedium}
                  utmCampaign={utmCampaign}
                  setUtmCampaign={setUtmCampaign}
                />
              </div>

              {/* Link Expiration */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" /> Expiração do Link
                    </Label>
                    <p className="text-xs text-slate-500 font-medium">
                      Defina uma data/hora limite para o link permanecer ativo.
                    </p>
                  </div>
                  <Switch checked={hasExpiration} onCheckedChange={setHasExpiration} />
                </div>

                {hasExpiration && (
                  <div className="pt-2">
                    <Input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="rounded-xl border-slate-200 max-w-xs font-medium text-slate-900 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || slugStatus === 'taken'}
            className="w-full sm:w-auto h-12 px-8 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Criando...
              </>
            ) : (
              'Criar seu Link'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
