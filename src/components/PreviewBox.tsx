import { MessageCircle, MoreVertical, Phone, Video } from 'lucide-react'

export function PreviewBox({ message }: { message?: string }) {
  return (
    <div className="bg-[#EFEAE2] rounded-3xl flex flex-col h-full min-h-[500px] border border-slate-200/60 shadow-xl relative overflow-hidden bg-[url('https://img.usecurling.com/i?q=whatsapp-pattern&color=gray&shape=outline')] bg-cover bg-center bg-blend-soft-light animate-fade-in ring-1 ring-white/50">
      <div className="bg-[#008069] flex items-center justify-between px-4 py-3 shadow-md z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[16px] leading-tight">Sua Empresa</span>
            <span className="text-[12px] text-white/80 font-medium">online</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <Video className="w-5 h-5" />
          <Phone className="w-5 h-5" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-8 flex-1 flex flex-col justify-end p-4 pb-6 space-y-4">
        {/* Placeholder for incoming message */}
        <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%] self-start relative text-[15px] text-slate-800">
          Olá! Tudo bem? 😊
          <div className="text-[11px] text-slate-400 text-right mt-1 font-medium">11:58</div>
          <svg
            viewBox="0 0 8 13"
            className="absolute top-0 -left-2 w-2 h-3 text-white fill-current transform scale-x-[-1]"
          >
            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
          </svg>
        </div>

        {/* User preview message */}
        <div className="bg-[#D9FDD3] rounded-2xl rounded-tr-none p-3 shadow-sm max-w-[85%] self-end relative animate-slide-up transform transition-all duration-300">
          <p className="text-[15px] text-slate-900 break-words whitespace-pre-wrap leading-relaxed">
            {message || (
              <span className="text-slate-500 italic">Comece a digitar sua mensagem...</span>
            )}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[11px] text-slate-500 font-medium">12:00</span>
            <svg viewBox="0 0 16 15" className="w-4 h-4 text-[#53bdeb] fill-current">
              <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
            </svg>
          </div>
          <svg
            viewBox="0 0 8 13"
            className="absolute top-0 -right-2 w-2 h-3 text-[#D9FDD3] fill-current"
          >
            <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
