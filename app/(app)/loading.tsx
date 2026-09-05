export default function Loading() {
  return (
    <div className="stack" aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 44, width: '60%' }} />
      <div className="skeleton" style={{ height: 220 }} />
      <div className="skeleton" style={{ height: 96 }} />
      <div className="skeleton" style={{ height: 96 }} />
    </div>
  )
}
