import { useState, useEffect } from 'react'
import { getLinks, deleteLink } from '@/services/whatsapp-links'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, ExternalLink, Copy, History, Lock, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface LinkItem {
  id: string
  phone: string
  message: string | null
  url: string
  created_at: string
}

export function HistorySection() {
  const { user } = useAuth()
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadLinks()
    }
  }, [user])

  async function loadLinks() {
    setLoading(true)
    const { data, error } = await getLinks(user!.id)
    if (error) {
      toast.error('Erro ao carregar histórico')
    } else {
      setLinks(data || [])
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteLink(id)
    if (error) {
      toast.error('Erro ao excluir link')
    } else {
      toast.success('Link excluído')
      setLinks(links.filter((l) => l.id !== id))
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up mt-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-inner">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Histórico de Links</h2>
            <p className="text-slate-500 font-medium">Seus links gerados recentemente.</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="hidden sm:flex font-bold text-slate-600 hover:text-slate-900 bg-white"
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Ver Relatórios (PRO)
        </Button>
      </div>

      {links.length === 0 ? (
        <Card className="bg-white/50 border-dashed border-2 shadow-sm rounded-3xl">
          <CardContent className="flex flex-col items-center text-center p-16 space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-2">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Nenhum link gerado</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              Você ainda não salvou nenhum link. Os links que você gerar aparecerão aqui
              automaticamente.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <Card
              key={link.id}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border-slate-200 overflow-hidden flex flex-col bg-white"
            >
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                      {link.phone}
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {format(new Date(link.created_at), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  {link.message && (
                    <p className="text-sm text-slate-600 font-medium line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
                      "{link.message}"
                    </p>
                  )}

                  {/* Fake Analytics lock */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <BarChart2 className="w-4 h-4" />
                      <span className="text-xs font-bold">0 cliques</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PRO
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-slate-100 bg-slate-50">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-none h-12 text-slate-600 font-bold hover:text-emerald-600 hover:bg-emerald-50 border-r border-slate-100"
                    onClick={() => handleCopy(link.url)}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copiar
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-none h-12 text-slate-600 font-bold hover:text-slate-900 hover:bg-slate-100 border-r border-slate-100"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noreferrer">
                      Testar <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-12 shrink-0 rounded-none h-12 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
