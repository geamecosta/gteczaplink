import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Loader2,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
  Users,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { getShortUrl } from '@/lib/short-url'
import { downloadCsv } from '@/lib/export-csv'

interface ClickRow {
  clicked_at: string
  user_agent: string | null
}

interface LeadRow {
  id: string
  phone: string
  message: string | null
  created_at: string
}

export default function StoreReport() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [link, setLink] = useState<any | null>(null)
  const [clicks, setClicks] = useState<ClickRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])

  useEffect(() => {
    if (!user || !slug) return

    const load = async () => {
      setLoading(true)
      const { data: linkData } = await supabase
        .from('links')
        .select('*')
        .eq('short_slug', slug)
        .maybeSingle()

      if (!linkData) {
        setLoading(false)
        return
      }
      setLink(linkData)

      const [clicksRes, leadsRes] = await Promise.all([
        supabase
          .from('link_clicks')
          .select('clicked_at, user_agent')
          .eq('link_id', linkData.id)
          .order('clicked_at', { ascending: false }),
        supabase
          .from('leads')
          .select('id, phone, message, created_at')
          .eq('link_id', linkData.id)
          .order('created_at', { ascending: false }),
      ])

      setClicks((clicksRes.data as ClickRow[]) || [])
      setLeads((leadsRes.data as LeadRow[]) || [])
      setLoading(false)
    }

    load()
  }, [user, slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Link não encontrado</h2>
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold h-11 px-6"
        >
          Voltar para o painel
        </Button>
      </div>
    )
  }

  const totalClicks = link.click_count || 0
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const clicksToday = clicks.filter((c) => new Date(c.clicked_at) >= todayStart).length
  const conversionRate = totalClicks > 0 ? (leads.length / totalClicks) * 100 : 0

  const mobileClicks = clicks.filter((c) => /mobile|android|iphone/i.test(c.user_agent || '')).length
  const desktopClicks = clicks.length - mobileClicks

  const clicksByDay: Record<string, number> = {}
  for (const click of clicks) {
    const day = format(new Date(click.clicked_at), 'dd/MM/yyyy')
    clicksByDay[day] = (clicksByDay[day] || 0) + 1
  }
  const dayEntries = Object.entries(clicksByDay).slice(0, 14)

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-emerald-600 font-bold text-sm flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o painel
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {link.title || 'Relatório do link'}
          </h1>
          <p className="text-slate-500 font-medium mt-1 break-all">{getShortUrl(link.short_slug)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MousePointerClick}
          label="Cliques totais"
          value={String(totalClicks)}
          hint="Desde a criação do link"
        />
        <StatCard
          icon={TrendingUp}
          label="Cliques hoje"
          value={String(clicksToday)}
          hint="Registrados a partir de hoje"
        />
        <StatCard
          icon={MessageCircle}
          label="Leads capturados"
          value={String(leads.length)}
          hint="Mandaram mensagem no WhatsApp"
        />
        <StatCard
          icon={Users}
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          hint="Cliques que viraram conversa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4">Cliques por dia</h2>
          {dayEntries.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Nenhum clique detalhado registrado ainda. Cliques antigos só têm o total acumulado.
            </p>
          ) : (
            <div className="space-y-2">
              {dayEntries.map(([day, count]) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{day}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4">Dispositivos</h2>
          {clicks.length === 0 ? (
            <p className="text-slate-500 text-sm">Sem dados de dispositivo ainda.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Celular</span>
                <span className="font-bold text-slate-900">{mobileClicks}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Computador</span>
                <span className="font-bold text-slate-900">{desktopClicks}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Contatos capturados ({leads.length})
            </h2>
            <p className="text-sm text-slate-500">
              Quem clicou no link e mandou mensagem no WhatsApp.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={leads.length === 0}
            onClick={() =>
              downloadCsv(
                `leads-${link.short_slug}.csv`,
                ['Numero', 'Mensagem', 'Data'],
                leads.map((lead) => [
                  lead.phone,
                  lead.message || '',
                  format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
                ]),
              )
            }
            className="bg-white hover:bg-slate-50 h-11 px-5 rounded-xl font-bold shadow-sm border-slate-200 text-slate-700 shrink-0"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-extrabold text-slate-700 h-12">Número</TableHead>
                <TableHead className="font-extrabold text-slate-700 h-12 hidden md:table-cell">
                  Mensagem
                </TableHead>
                <TableHead className="font-extrabold text-slate-700 h-12 text-right">
                  Quando
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className="text-center py-12 text-slate-500">
                    Nenhum contato capturado ainda para este link.
                  </TableCell>
                </TableRow>
              )}
              {leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-bold text-slate-900">{lead.phone}</TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-xs truncate hidden md:table-cell">
                    {lead.message || '—'}
                  </TableCell>
                  <TableCell className="text-right text-slate-500 font-medium text-sm">
                    {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm')}
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

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: any
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="text-sm font-bold text-slate-700 mt-1">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{hint}</div>
    </div>
  )
}
