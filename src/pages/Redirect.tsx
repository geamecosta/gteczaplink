import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLinkBySlug, recordClick } from '@/services/links'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Redirect() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) {
      setError(true)
      return
    }
    const doRedirect = async () => {
      const { data, error: queryError } = await getLinkBySlug(slug)

      if (queryError || !data) {
        setError(true)
        return
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError(true)
        return
      }

      await recordClick(slug)
      window.location.href = data.destination_url
    }
    doRedirect()
  }, [slug])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Link não encontrado</h2>
        <p className="text-slate-500 font-medium mb-6 max-w-sm">
          Este link pode ter expirado, sido removido ou simplesmente não existe em nossa base.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-12 px-8"
        >
          Voltar para a página inicial
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
      <p className="text-slate-500 font-medium">Redirecionando...</p>
    </div>
  )
}
