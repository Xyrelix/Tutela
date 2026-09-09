export default function AlertsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col gap-4 px-6 py-8">
      <h1 className="text-xl font-semibold">Alerts</h1>
      <p className="text-sm text-zinc-500">
        Alert history will appear here once the backend exposes an alert-listing endpoint.
      </p>
    </div>
  );
}
