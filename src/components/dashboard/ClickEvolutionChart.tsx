import { useState, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart3 } from 'lucide-react'
import { format, startOfWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface ClickEvolutionChartProps {
  clicks: { clicked_at: string }[]
}

const chartConfig = {
  count: { label: 'Cliques', color: 'hsl(158, 64%, 52%)' },
} satisfies ChartConfig

export function ClickEvolutionChart({ clicks }: ClickEvolutionChartProps) {
  const [mode, setMode] = useState<'daily' | 'weekly'>('daily')

  const chartData = useMemo(() => {
    if (!clicks || clicks.length === 0) return []
    const map = new Map<string, number>()
    for (const click of clicks) {
      const date = new Date(click.clicked_at)
      const key =
        mode === 'daily'
          ? format(date, 'yyyy-MM-dd')
          : format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({
        date,
        label: format(new Date(date), 'dd/MM'),
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [clicks, mode])

  if (!clicks || clicks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Evolução de Cliques
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Acompanhe o desempenho dos seus links ao longo do tempo.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <BarChart3 className="w-12 h-12 mb-4 text-slate-300" />
          <p className="text-lg font-medium text-slate-900 mb-1">No clicks yet.</p>
          <p className="text-sm">
            Os cliques nos seus links aparecerão aqui assim que forem registrados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Evolução de Cliques
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Acompanhe o desempenho dos seus links ao longo do tempo.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setMode('daily')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold transition-all',
              mode === 'daily'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            Diário
          </button>
          <button
            onClick={() => setMode('weekly')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-bold transition-all',
              mode === 'weekly'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            )}
          >
            Semanal
          </button>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(158, 64%, 52%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            width={30}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(158, 64%, 52%)"
            strokeWidth={2}
            fill="url(#clickGradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
