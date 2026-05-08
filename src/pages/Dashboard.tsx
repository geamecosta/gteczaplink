import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, Mail, Users, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchLeads()
  }, [user])

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('waitlist' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Erro ao carregar leads')
    } else {
      setLeads(data || [])
    }
    setLoading(false)
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
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'leads_waitlist.csv')
    link.style.visibility = 'hidden'
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-slate-500 mt-2">Faça login para acessar o painel.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Leads</h1>
          <p className="text-slate-500 mt-1">Gerencie sua lista de espera e campanhas.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={leads.length === 0}
            className="shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar CSV
          </Button>
          <Button
            onClick={handleSendNewsletter}
            disabled={sending || leads.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-md"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Enviar Comunicado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Total de Leads</p>
            <h3 className="text-3xl font-extrabold text-slate-900">{leads.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <ArrowRight className="w-7 h-7" />
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Leads por Indicação</p>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {leads.filter((l) => l.referred_by).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Código Indicação</TableHead>
                  <TableHead className="text-center">Cadastrados</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                    <TableCell className="text-slate-500">{lead.email}</TableCell>
                    <TableCell className="text-slate-500">{lead.phone}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {lead.referral_code}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                        {lead.referral_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                      Nenhum lead encontrado na base.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
