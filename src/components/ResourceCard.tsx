import { openFile } from "@/lib/store";
import type { Resource } from "@/lib/useResources";

function open(r: Resource, download: boolean) {
  void openFile(r.id, download);
}

export function ResourceCard({
  resource,
  actions,
}: {
  resource: Resource;
  actions?: React.ReactNode;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground">
          {resource.type}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          {resource.year}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          {resource.batch}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-card-foreground">{resource.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {resource.subject}
        {resource.teacher ? ` · ${resource.teacher}` : ""}
      </p>
      {resource.description && (
        <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
      )}
      {resource.contributor && (
        <p className="mt-2 text-xs text-muted-foreground">
          Notes provided by <span className="font-medium">{resource.contributor}</span>
        </p>
      )}
      {resource.notes_captured_by && (
        <p className="mt-1 text-xs text-muted-foreground">
          Notes captured by <span className="font-medium">{resource.notes_captured_by}</span>
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => open(resource, false)}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          View
        </button>
        <button
          onClick={() => open(resource, true)}
          className="rounded-lg border border-input px-3 py-1.5 text-sm font-medium hover:bg-secondary"
        >
          Download
        </button>
        {actions}
      </div>
    </article>
  );
}
