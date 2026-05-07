import { useState, useEffect } from 'react'
import { getLinks, deleteLink } from '@/services/whatsapp-links'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, ExternalLink, Copy, History } from 'lucide-react'
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <History className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Seu Histórico</h2>
      </div>

      {links.length === 0 ? (
        <Card className="bg-white/50 border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center text-center p-12 space-y-3">
            <p className="text-muted-foreground">Você ainda não salvou nenhum link.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {links.map((link) => (
            <Card key={link.id} className="group hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 flex flex-col h-full space-y-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{link.phone}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(link.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  {link.message && (
                    <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md">
                      "{link.message}"
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-muted/50">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopy(link.url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Testar
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
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
