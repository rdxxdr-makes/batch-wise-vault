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
    <div className="card-lift overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex min-h-48 items-center justify-center bg-primary-soft">
        {isLoading && <p className="text-sm text-muted-foreground">Loading timetable…</p>}
        {data && <img src={data.url} alt="Today's timetable" className="max-h-[70vh] w-full object-contain" />}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/60 p-3">
        <button onClick={() => openFile(resource.id, false)} className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold">Open</button>
        <button onClick={() => openFile(resource.id, true)} className="btn-outline rounded-lg px-4 py-2 text-sm font-semibold">Download</button>
        {actions}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state rounded-xl px-4 py-8 text-center text-sm">{children}</div>
  );
}
