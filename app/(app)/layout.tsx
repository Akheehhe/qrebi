import TabBar from '@/components/TabBar'
import TimezoneSync from '@/components/TimezoneSync'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      {children}
      <TabBar />
      <TimezoneSync />
    </div>
  )
}
