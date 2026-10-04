import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getFileUrl } from "@/lib/resources.functions";
import { openFile } from "@/lib/store";
import type { Resource } from "@/lib/useResources";

export function TimetableImage({ resource, actions }: { resource: Resource; actions?: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["file-url", resource.id, resource.file_path],
    queryFn: () => getFileUrl({ data: { id: resource.id, download: false } }),
    staleTime: 30 * 60_000,
  });
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex min-h-48 items-center justify-center bg-muted">
        {isLoading && <p className="text-sm text-muted-foreground">Loading timetable…</p>}
        {data && <img src={data.url} alt="Today's timetable" className="max-h-[70vh] w-full object-contain" />}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        <button onClick={() => openFile(resource.id, false)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Open</button>
        <button onClick={() => openFile(resource.id, true)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-secondary">Download</button>
        {actions}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">{children}</div>
  );
}
