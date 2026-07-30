export default function EmployeeConcernLoading(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading concerns">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-9 w-64 max-w-full rounded bg-muted" />
        <div className="h-4 w-120 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_item, index) => (
          <div key={index} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-120 rounded-xl border bg-card" />
        <div className="h-120 rounded-xl border bg-card" />
      </div>
    </div>
  );
}
