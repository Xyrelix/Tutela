export default function ApprovalsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Approvals</h1>
      <p className="text-sm text-zinc-500">
        Active approvals and one-click revoke will appear here once the backend exposes an
        approval-listing endpoint. The revoke flow itself (prepare + confirm) is already live at
        <code className="mx-1 rounded bg-black/[.06] px-1 py-0.5 font-mono text-xs dark:bg-white/[.08]">
          /api/actions/revoke/:approvalId
        </code>
        on the API.
      </p>
    </div>
  );
}
