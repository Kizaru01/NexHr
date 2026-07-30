export default function EmployeeConcernsLoading(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading concerns">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-9 w-72 max-w-full rounded bg-muted" />
        <div className="h-4 w-120 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_item, index) => (
          <div key={index} className="h-28 rounded-xl border bg-card" />
        ))}
      </div>
      <div className="h-120 rounded-xl border bg-card" />
    </div>
  );
}
