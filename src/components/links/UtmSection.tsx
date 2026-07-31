import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UtmSectionProps {
  utmSource: string
  setUtmSource: (v: string) => void
  utmMedium: string
  setUtmMedium: (v: string) => void
  utmCampaign: string
  setUtmCampaign: (v: string) => void
}

export function UtmSection({
  utmSource,
  setUtmSource,
  utmMedium,
  setUtmMedium,
  utmCampaign,
  setUtmCampaign,
}: UtmSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700">UTM Source (Origem)</Label>
        <Input
          placeholder="ex: instagram, google"
          value={utmSource}
          onChange={(e) => setUtmSource(e.target.value)}
          className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700">UTM Medium (Meio)</Label>
        <Input
          placeholder="ex: bio, cpc, email"
          value={utmMedium}
          onChange={(e) => setUtmMedium(e.target.value)}
          className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700">UTM Campaign (Campanha)</Label>
        <Input
          placeholder="ex: promo_blackfriday"
          value={utmCampaign}
          onChange={(e) => setUtmCampaign(e.target.value)}
          className="rounded-xl border-slate-200 bg-slate-50 text-sm focus:bg-white"
        />
      </div>
    </div>
  )
}
