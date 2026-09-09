export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Alerts</h1>
      <p className="text-sm text-zinc-500">
        Alert history will appear here once the backend exposes an alert-listing endpoint.
      </p>
    </div>
  );
}
