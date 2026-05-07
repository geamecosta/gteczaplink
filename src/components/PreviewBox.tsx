import { MessageCircle } from 'lucide-react'

export function PreviewBox({ message }: { message?: string }) {
  return (
    <div className="bg-[#EFEAE2] p-6 rounded-2xl flex flex-col h-full min-h-[400px] border shadow-inner relative overflow-hidden bg-[url('https://img.usecurling.com/i?q=whatsapp-background&color=gray&shape=lineal-color')] bg-cover bg-center bg-blend-soft-light animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-12 bg-[#075E54] flex items-center px-4 shadow-md z-10">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] leading-tight">Visualização</span>
            <span className="text-[11px] text-white/70 leading-tight">online</span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex-1 flex flex-col justify-end pb-2">
        <div className="bg-[#DCF8C6] rounded-lg p-3 rounded-tr-none shadow-sm max-w-[85%] self-end relative animate-slide-up">
          <p className="text-[15px] text-gray-800 break-words whitespace-pre-wrap leading-relaxed">
            {message || 'Sua mensagem aparecerá aqui...'}
          </p>
          <div className="text-[11px] text-gray-500 text-right mt-1 font-medium select-none">
            12:00
          </div>
          <svg
            viewBox="0 0 8 13"
            className="absolute top-0 -right-2 w-2 h-3 text-[#DCF8C6] fill-current"
          >
            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
