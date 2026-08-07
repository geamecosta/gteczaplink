import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { getLinks, deleteLink as deleteWhatsappLink } from '@/services/whatsapp-links'
import { getUserLinks, deleteUserLink, getLinkClicksForUser } from '@/services/links'
import { getUserLinkLeads, type LinkLead } from '@/services/leads'
import { ClickEvolutionChart } from '@/components/dashboard/ClickEvolutionChart'
import { EditLinkDialog } from '@/components/dashboard/EditLinkDialog'
import { Link, useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Download,
  Mail,
  Users,
  Loader2,
  Link as LinkIcon,
  QrCode,
  PlusCircle,
  BarChart3,
  ExternalLink,
  Trash2,
  Copy,
  Home,
  CheckCircle2,
  Sparkles,
  Megaphone,
  TrendingUp,
  Clock,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getShortUrl } from '@/lib/short-url'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')

  const [leads, setLeads] = useState<any[]>([])
  const [linkLeads, setLinkLeads] = useState<LinkLead[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [selectedQrCodeUrl, setSelectedQrCodeUrl] = useState<string | null>(null)
  const [clicks, setClicks] = useState<any[]>([])
  const [editLink, setEditLink] = useState<any | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    const [leadsRes, customLinksRes, waLinksRes, clicksRes, linkLeadsRes] = await Promise.all([
      supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
      getUserLinks(),
      getLinks(user!.id),
      getLinkClicksForUser(),
      getUserLinkLeads(),
    ])

    if (leadsRes.data) setLeads(leadsRes.data)
    if (clicksRes.data) setClicks(clicksRes.data)
    if (linkLeadsRes.data) setLinkLeads(linkLeadsRes.data)

    const unifiedCustomLinks = (customLinksRes.data || []).map((item: any) => ({
      id: item.id,
      destination_url: item.destination_url,
      short_slug: item.short_slug,
      url: getShortUrl(item.short_slug),
      click_count: item.click_count || 0,
      title: item.title || 'Link Curto',
      tags: item.tags || [],
      utm_source: item.utm_source,
      utm_medium: item.utm_medium,
      utm_campaign: item.utm_campaign,
      expires_at: item.expires_at,
      qr_code_enabled: item.qr_code_enabled,
      created_at: item.created_at,
      is_custom: true,
    }))

    const unifiedWaLinks = (waLinksRes.data || []).map((item: any) => ({
      id: item.id,
      destination_url: item.phone,
      short_slug: item.phone,
      url: item.url,
      title: 'WhatsApp Direto',
      tags: ['whatsapp'],
      created_at: item.created_at,
      click_count: 0,
      is_custom: false,
    }))

    setLinks([...unifiedCustomLinks, ...unifiedWaLinks])
    setLoading(false)
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copiado para a área de transferência!')
  }

  const handleDeleteLink = async (linkItem: any) => {
    if (linkItem.is_custom) {
      const { error } = await deleteUserLink(linkItem.id)
      if (error) {
        toast.error('Erro ao deletar link')
      } else {
        toast.success('Link removido')
        setLinks(links.filter((l) => l.id !== linkItem.id))
      }
    } else {
      const { error } = await deleteWhatsappLink(linkItem.id)
      if (error) {
        toast.error('Erro ao deletar link')
      } else {
        toast.success('Link removido')
        setLinks(links.filter((l) => l.id !== linkItem.id))
      }
    }
  }

  const handleExport = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Código', 'Cadastrados por ele', 'Data']
    const csvData = leads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.referral_code,
      l.referral_count,
      format(new Date(l.created_at), 'dd/MM/yyyy'),
    ])

    const csvContent = [headers, ...csvData].map((e) => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'leads_waitlist.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendNewsletter = async () => {
    setSending(true)
    try {
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: 'Novidades incríveis do GtecZap Link!',
          message: 'Estamos preparando algo especial para você que está na nossa lista de espera.',
        },
      })
      if (error) throw error
      toast.success('Comunicado enviado com sucesso para toda a lista!')
    } catch (err) {
      toast.error('Erro ao enviar comunicado')
    } finally {
      setSending(false)
    }
  }

  const handleEditSaved = (updatedLink: any) => {
    setLinks(
      links.map((l) => {
        if (l.id === updatedLink.id) {
          return {
            ...l,
            title: updatedLink.title || 'Link Curto',
            destination_url: updatedLink.destination_url,
            utm_source: updatedLink.utm_source,
            utm_medium: updatedLink.utm_medium,
            utm_campaign: updatedLink.utm_campaign,
          }
        }
        return l
      }),
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500 mt-2">Faça login para acessar o painel.</p>
        <Button
          onClick={() => navigate('/')}
          className="mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 h-12 font-bold shadow-xl shadow-slate-900/20"
        >
          Ir para a Home
        </Button>
      </div>
    )
  }

  if (loading && leads.length === 0 && links.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  const todayClicksByLink: Record<string, number> = {}
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  for (const click of clicks) {
    if (!click.link_id) continue
    if (new Date(click.clicked_at) < todayStart) continue
    todayClicksByLink[click.link_id] = (todayClicksByLink[click.link_id] || 0) + 1
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in pb-12 w-full">
      {/* MOBILE NAVIGATION */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-4 scrollbar-hide border-b border-slate-200 w-full">
        <MobileNavButton
          icon={Home}
          label="Início"
          active={activeTab === 'home'}
          onClick={() => setActiveTab('home')}
        />
        <MobileNavButton
          icon={LinkIcon}
          label="Meus Links"
          active={activeTab === 'links'}
          onClick={() => setActiveTab('links')}
        />
        <MobileNavButton
          icon={Users}
          label="Leads"
          active={activeTab === 'leads'}
          onClick={() => setActiveTab('leads')}
        />
        <MobileNavButton
          icon={Mail}
          label="Campanhas"
          active={activeTab === 'campaigns'}
          onClick={() => setActiveTab('campaigns')}
        />
      </div>

      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2">
          <Button
            onClick={() => navigate('/links/create')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md rounded-2xl h-14 mb-4 text-base transition-transform hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Criar Novo Link
          </Button>

          <NavButton
            icon={Home}
            label="Início"
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
          />
          <NavButton
            icon={LinkIcon}
            label="Meus Links"
            active={activeTab === 'links'}
            onClick={() => setActiveTab('links')}
          />
          <NavButton
            icon={Users}
            label="Leads Capturados"
            active={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
          />
          <NavButton
            icon={Mail}
            label="Campanhas"
            active={activeTab === 'campaigns'}
            onClick={() => setActiveTab('campaigns')}
          />

          <div className="my-2 border-t border-slate-100" />

          <NavButton
            icon={BarChart3}
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            disabled
          />
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-24 h-24" />
          </div>
          <h4 className="font-bold mb-2 text-lg relative z-10">Upgrade para PRO</h4>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10">
            Desbloqueie links ilimitados, domínio próprio e integrações avançadas.
          </p>
          <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-12 relative z-10 transition-transform hover:scale-[1.02]">
            Ver Planos
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            leads={leads}
            links={links}
            clicks={clicks}
            navigate={navigate}
            setActiveTab={setActiveTab}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        )}
        {activeTab === 'links' && (
          <LinksTab
            links={links}
            todayClicksByLink={todayClicksByLink}
            handleCopy={handleCopy}
            handleDeleteLink={handleDeleteLink}
            navigate={navigate}
            onOpenQrCode={(url: string) => setSelectedQrCodeUrl(url)}
            onEditLink={(link: any) => {
              setEditLink(link)
              setIsEditOpen(true)
            }}
          />
        )}
        {activeTab === 'leads' && (
          <LeadsTab leads={leads} linkLeads={linkLeads} handleExport={handleExport} />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsTab
            leads={leads}
            handleSendNewsletter={handleSendNewsletter}
            sending={sending}
          />
        )}
      </main>

      {/* CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-0 bg-white">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
            <DialogTitle className="text-2xl font-extrabold mb-2">
              O que você deseja criar?
            </DialogTitle>
            <DialogDescription className="text-emerald-50 text-base font-medium">
              Escolha uma das opções abaixo para começar a gerar mais conversões.
            </DialogDescription>
          </div>
          <div className="p-6 grid gap-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(false)
                navigate('/links/create')
              }}
              className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 text-left group"
            >
              <div className="w-14 h-14 bg-white shadow-sm rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Link Personalizado Avançado</h4>
                <p className="text-sm text-slate-500 font-medium">
                  Crie link curto com UTMs, expiração e QR Code
                </p>
              </div>
            </button>
            <button
              onClick={() => {
                setIsCreateModalOpen(false)
                navigate('/')
              }}
              className="flex items-center gap-5 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-300 text-left group"
            >
              <div className="w-14 h-14 bg-white shadow-sm rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Link Rápido de WhatsApp</h4>
                <p className="text-sm text-slate-500 font-medium">
                  Gerador direto para conversas de WhatsApp
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR CODE MODAL */}
      <Dialog
        open={!!selectedQrCodeUrl}
        onOpenChange={(open) => !open && setSelectedQrCodeUrl(null)}
      >
        <DialogContent className="sm:max-w-sm rounded-[2rem] p-6 bg-white text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              QR Code do Link
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500">
              Escaneie ou baixe este QR Code para compartilhar.
            </DialogDescription>
          </DialogHeader>
          {selectedQrCodeUrl && (
            <div className="my-4 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    selectedQrCodeUrl,
                  )}`}
                  alt="QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg truncate max-w-full">
                {selectedQrCodeUrl}
              </p>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                  selectedQrCodeUrl,
                )}`}
                target="_blank"
                rel="noreferrer"
                download="qrcode.png"
                className="mt-4 w-full"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl h-11">
                  <Download className="w-4 h-4 mr-2" /> Baixar Imagem HD
                </Button>
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT LINK MODAL */}
      <EditLinkDialog
        link={editLink}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaved={handleEditSaved}
      />
    </div>
  )
}

// --- TAB COMPONENTS ---

function HomeTab({ user, leads, links, clicks, navigate, setActiveTab }: any) {
  const totalClicks = links.reduce((sum: number, l: any) => sum + (l.click_count || 0), 0)
  return (
    <div className="space-y-10 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Bem-vindo de volta, {user?.user_metadata?.name || 'Empreendedor'}! 👋
        </h2>
        <p className="text-slate-500 text-lg mt-2 font-medium">
          Aqui está o resumo do seu desempenho e atalhos rápidos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Links Ativos" value={links.length} icon={LinkIcon} trend="+2 hoje" />
        <StatCard title="Leads Capturados" value={leads.length} icon={Users} trend="Crescendo" />
        <StatCard
          title="Cliques Totais"
          value={totalClicks}
          icon={BarChart3}
          trend={totalClicks > 0 ? 'Ao vivo' : 'Sem dados'}
        />
      </div>

      {/* Click Evolution Chart */}
      <ClickEvolutionChart clicks={clicks} />

      {/* Quick Create Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <Sparkles className="w-64 h-64 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
            O que você quer criar hoje?
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            Simplifique seu fluxo de trabalho com nossos atalhos de alta conversão.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            <QuickActionCard
              title="Novo Link Personalizado"
              description="Com UTMs, apelido customizado e expiração."
              icon={LinkIcon}
              onClick={() => navigate('/links/create')}
            />
            <QuickActionCard
              title="Link de WhatsApp"
              description="Gerador direto de mensagem preenchida."
              icon={QrCode}
              onClick={() => navigate('/')}
            />
            <QuickActionCard
              title="Nova Campanha"
              description="Envie um e-mail para sua base de leads."
              icon={Mail}
              onClick={() => setActiveTab('campaigns')}
            />
          </div>
        </div>
      </div>

      {/* Recommended Integrations / Next Steps */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-3xl shadow-sm border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Conecte sua conta</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Potencialize seus resultados com integrações nativas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <img
                src="https://img.usecurling.com/i?q=chrome&color=multicolor"
                className="w-10 h-10 object-contain drop-shadow-sm"
                alt="Chrome"
              />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Extensão do Chrome</h4>
                <p className="text-sm text-slate-500 font-medium">Crie links de qualquer lugar</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold bg-white shadow-sm"
              >
                Instalar
              </Button>
            </div>
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <img
                src="https://img.usecurling.com/i?q=zapier&color=multicolor"
                className="w-10 h-10 object-contain drop-shadow-sm"
                alt="Zapier"
              />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Integração Zapier</h4>
                <p className="text-sm text-slate-500 font-medium">Automatize o fluxo de leads</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold bg-white shadow-sm"
              >
                Conectar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Dicas de Sucesso</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Aprenda a converter mais com seus links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-[15px] text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                Sempre adicione UTM Source e UTM Medium para saber de qual canal vieram suas vendas.
              </li>
              <li className="flex items-start gap-3 text-[15px] text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                Compartilhe QR Codes em cartões de visita, balcões e anúncios impressos.
              </li>
              <li className="flex items-start gap-3 text-[15px] text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                Utilize datas de expiração em promoções relâmpago ou ofertas por tempo limitado.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LinksTab({
  links,
  todayClicksByLink,
  handleCopy,
  handleDeleteLink,
  navigate,
  onOpenQrCode,
  onEditLink,
}: any) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Meus Links</h2>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie todos os seus links curtos, UTMs e QR Codes.
          </p>
        </div>
        <Button
          onClick={() => navigate('/links/create')}
          className="bg-emerald-600 hover:bg-emerald-700 h-12 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Novo Link Personalizado
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-extrabold text-slate-700 h-14">
                  Título / Destino
                </TableHead>
                <TableHead className="font-extrabold text-slate-700 h-14">Link Curto</TableHead>
                <TableHead className="font-extrabold text-slate-700 h-14 hidden lg:table-cell">
                  Tags & Extras
                </TableHead>
                <TableHead className="font-extrabold text-slate-700 h-14 text-center">
                  Cliques
                </TableHead>
                <TableHead className="font-extrabold text-slate-700 h-14 text-center">
                  Hoje
                </TableHead>
                <TableHead className="font-extrabold text-slate-700 h-14 hidden md:table-cell">
                  Criado em
                </TableHead>
                <TableHead className="text-right font-extrabold text-slate-700 h-14">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <LinkIcon className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium text-slate-900 mb-1">Nenhum link gerado</p>
                      <p className="text-sm">Você ainda não gerou nenhum link no GtecZap.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {links.map((link: any) => (
                <TableRow key={link.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-slate-900">{link.title || 'Link Curto'}</div>
                    <div className="text-slate-400 text-xs truncate max-w-[220px]">
                      {link.destination_url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 font-bold truncate max-w-[240px] bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex"
                    >
                      {link.url.replace('https://', '')}
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1 items-center">
                      {link.tags && link.tags.length > 0 ? (
                        link.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] bg-slate-100 text-slate-600 border-slate-200"
                          >
                            #{tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs font-medium">-</span>
                      )}
                      {link.utm_source && (
                        <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                          utm: {link.utm_source}
                        </Badge>
                      )}
                      {link.expires_at && (
                        <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Expira
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center font-extrabold px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700">
                      {link.click_count || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center font-bold px-3 py-1.5 rounded-full text-sm bg-blue-50 text-blue-700">
                      {todayClicksByLink[link.id] || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium text-xs hidden md:table-cell">
                    {format(new Date(link.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Ver QR Code"
                        onClick={() => onOpenQrCode(link.url)}
                        className="text-slate-700 hover:text-emerald-600 rounded-lg h-9 w-9 p-0 bg-white"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Copiar Link"
                        onClick={() => handleCopy(link.url)}
                        className="text-slate-700 hover:text-emerald-600 rounded-lg h-9 w-9 p-0 bg-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      {link.is_custom && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Editar Link"
                          onClick={() => onEditLink(link)}
                          className="text-slate-700 hover:text-emerald-600 rounded-lg h-9 w-9 p-0 bg-white transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {link.is_custom && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Ver relatório"
                          onClick={() => navigate(`/relatorio/${link.short_slug}`)}
                          className="text-slate-700 hover:text-emerald-600 rounded-lg h-9 w-9 p-0 bg-white transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        title="Excluir Link"
                        onClick={() => handleDeleteLink(link)}
                        className="text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg h-9 w-9 p-0 bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function LeadsTab({ leads, linkLeads, handleExport }: any) {
  const groupedByLink = (linkLeads as LinkLead[]).reduce(
    (acc: Record<string, LinkLead[]>, lead) => {
      const key = lead.short_slug || lead.links?.short_slug || 'sem-link'
      if (!acc[key]) acc[key] = []
      acc[key].push(lead)
      return acc
    },
    {},
  )

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Números por Link</h2>
        <p className="text-slate-500 font-medium mt-1">
          Quem mandou mensagem no WhatsApp depois de clicar em cada link, agrupado por origem.
        </p>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedByLink).length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-16 text-center text-slate-500">
            <Users className="w-12 h-12 mb-4 text-slate-300 mx-auto" />
            <p className="text-lg font-medium text-slate-900 mb-1">Nenhum lead por link ainda</p>
            <p className="text-sm">
              Assim que alguém mandar mensagem pelo WhatsApp após clicar em um link, o número
              aparece aqui.
            </p>
          </div>
        )}

        {Object.entries(groupedByLink).map(([slug, groupLeads]) => {
          const title = groupLeads[0]?.links?.title || slug
          return (
            <div
              key={slug}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div>
                  <div className="font-extrabold text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500 font-mono">/{slug}</div>
                </div>
                <span className="inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                  {groupLeads.length} {groupLeads.length === 1 ? 'contato' : 'contatos'}
                </span>
              </div>
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-extrabold text-slate-700 h-12">Número</TableHead>
                    <TableHead className="font-extrabold text-slate-700 h-12">Mensagem</TableHead>
                    <TableHead className="font-extrabold text-slate-700 h-12 text-right">
                      Quando
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-900">{lead.phone}</TableCell>
                      <TableCell className="text-slate-600 text-sm max-w-xs truncate">
                        {lead.message || '—'}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 font-medium">
                        {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Leads Capturados</h2>
          <p className="text-slate-500 font-medium mt-1">
            Sua lista de espera e usuários engajados.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={leads.length === 0}
          className="bg-white hover:bg-slate-50 h-12 px-6 rounded-xl font-bold shadow-sm border-slate-200 text-slate-700"
        >
          <Download className="w-5 h-5 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-100">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-extrabold text-slate-700 h-14">Contato</TableHead>
              <TableHead className="font-extrabold text-slate-700 h-14">Email / Info</TableHead>
              <TableHead className="font-extrabold text-slate-700 h-14 text-center">
                Indicações
              </TableHead>
              <TableHead className="font-extrabold text-slate-700 h-14 text-right">
                Data de Entrada
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-16 text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-900 mb-1">Nenhum lead ainda</p>
                    <p className="text-sm">
                      Compartilhe seus links para começar a capturar contatos.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {leads.map((lead: any) => (
              <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="font-bold text-slate-900">{lead.name}</div>
                  <div className="text-slate-500 text-sm font-medium">{lead.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-700 font-medium">{lead.email}</div>
                  {lead.referral_code && (
                    <div className="font-mono text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                      Ref: {lead.referral_code}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center font-bold px-3 py-1 rounded-full text-xs',
                      lead.referral_count > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {lead.referral_count} {lead.referral_count === 1 ? 'amigo' : 'amigos'}
                  </span>
                </TableCell>
                <TableCell className="text-right text-slate-500 font-medium">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function CampaignsTab({ leads, handleSendNewsletter, sending }: any) {
  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Campanhas</h2>
        <p className="text-slate-500 font-medium mt-1">
          Envie comunicados em massa para sua base de leads.
        </p>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
        <CardHeader className="pt-8 px-8 pb-6 border-b border-slate-100">
          <CardTitle className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Megaphone className="w-6 h-6" />
            </div>
            Nova Mensagem de Transmissão
          </CardTitle>
          <CardDescription className="text-base font-medium mt-2">
            Alcance todos os seus <strong className="text-slate-900">{leads.length} leads</strong>{' '}
            com apenas um clique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900">Assunto do E-mail</label>
            <input
              type="text"
              placeholder="Ex: Oferta exclusiva liberada para você!"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-lg placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900">Conteúdo da Mensagem</label>
            <textarea
              rows={6}
              placeholder="Olá! Estamos trazendo novidades incríveis..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none font-medium text-base leading-relaxed placeholder:text-slate-400"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleSendNewsletter}
              disabled={sending || leads.length === 0}
              className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-10 rounded-xl font-bold text-lg w-full sm:w-auto shadow-xl shadow-slate-900/10 transition-transform hover:scale-[1.02]"
            >
              {sending ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                <Mail className="w-6 h-6 mr-3" />
              )}
              {sending ? 'Disparando...' : `Enviar para ${leads.length} contatos`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- UTILS ---

function NavButton({ icon: Icon, label, active, onClick, disabled = false }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 text-left text-[15px]',
        active
          ? 'bg-emerald-50 text-emerald-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
      )}
    >
      <Icon className={cn('w-5 h-5', active ? 'text-emerald-600' : 'text-slate-400')} />
      <span>{label}</span>
      {disabled && (
        <span className="ml-auto text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">
          PRO
        </span>
      )}
    </button>
  )
}

function MobileNavButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors',
        active
          ? 'bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200'
          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> {trend}
          </span>
        )}
      </div>
      <p className="text-slate-500 font-semibold text-sm mb-1">{title}</p>
      <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
    </div>
  )
}

function QuickActionCard({ title, description, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left p-6 md:p-8 rounded-[2rem] border border-slate-100 bg-slate-50 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group h-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-emerald-400 transition-colors" />
      <div className="w-14 h-14 bg-white shadow-sm text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300 shrink-0">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="font-extrabold text-slate-900 text-xl mb-2">{title}</h4>
      <p className="text-[15px] font-medium text-slate-500 leading-relaxed">{description}</p>
    </button>
  )
}
