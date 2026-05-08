import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Users, TrendingUp, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [leads, setLeads] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) {
      fetchLeads()
    }
  }, [user])

  async function fetchLeads() {
    setFetching(true)
    const { data, error } = await supabase
      .from('waitlist' as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLeads(data)
    }
    setFetching(false)
  }

  const exportCSV = () => {
    const headers = ['Nome,Email,Telefone,Código Indicação,Indicações,Data']
    const rows = leads.map(
      (l) =>
        `"${l.name}","${l.email}","${l.phone}","${l.referral_code || ''}",${l.referral_count || 0},"${format(new Date(l.created_at), 'dd/MM/yyyy HH:mm')}"`,
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'leads_waitlist.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalReferrals = leads.reduce((acc, lead) => acc + (lead.referral_count || 0), 0)

  const sendNewsletter = async () => {
    if (!subject || !message) {
      toast.error('Preencha o assunto e a mensagem.')
      return
    }
    setSending(true)
    try {
      const { error } = await supabase.functions.invoke('send-newsletter', {
        body: { subject, message },
      })
      if (error) throw error
      toast.success('Comunicado enviado com sucesso para toda a base!')
      setSubject('')
      setMessage('')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar o comunicado.')
    } finally {
      setSending(false)
    }
  }

  if (loading || fetching) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Gerencie seus leads e envie comunicados.</p>
      </div>

      <Tabs defaultValue="leads" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="leads">Base de Leads</TabsTrigger>
          <TabsTrigger value="newsletter">Comunicações</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Button
              onClick={exportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Lista (CSV)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" /> Total de Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{leads.length}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-600" /> Indicações Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalReferrals}</div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/60 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Taxa de Viralidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-900">
                  {leads.length > 0 ? ((totalReferrals / leads.length) * 100).toFixed(1) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200/60">
            <CardHeader>
              <CardTitle>Base de Contatos</CardTitle>
              <CardDescription>
                Lista de espera completa com dados de contato e performance de indicações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Código Indicação</TableHead>
                      <TableHead className="text-center">Indicações</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                          Nenhum lead encontrado ainda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      leads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                          <TableCell className="text-slate-600">{lead.email}</TableCell>
                          <TableCell className="text-slate-600">{lead.phone}</TableCell>
                          <TableCell>
                            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-mono border border-slate-200">
                              {lead.referral_code || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {lead.referral_count > 0 ? (
                              <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
                                {lead.referral_count}
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-500">
                            {format(new Date(lead.created_at), 'dd/MM/yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter">
          <Card className="shadow-sm border-slate-200/60 max-w-3xl">
            <CardHeader>
              <CardTitle>Comunicação em Massa</CardTitle>
              <CardDescription>
                Envie um e-mail ou mensagem de WhatsApp para toda a sua base de contatos aprovados
                na lista de espera.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto (E-mail)</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Novidade GtecZap: Acesso Liberado!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (WhatsApp / Corpo do E-mail)</Label>
                <Textarea
                  id="message"
                  placeholder="Escreva sua mensagem aqui..."
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={sendNewsletter}
                disabled={sending}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
              >
                {sending ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar para {leads.length} contatos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
