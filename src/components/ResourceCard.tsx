import { openFile } from "@/lib/store";
import type { Resource } from "@/lib/useResources";

const typeBadge: Record<string, string> = {
  Notes: "bg-sky-soft text-sky",
  Homework: "bg-accent-soft text-accent-foreground",
  PPT: "bg-violet-soft text-violet",
  "Class Overview": "bg-success-soft text-success",
};

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
    <article className="card-lift flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-1 font-semibold ${typeBadge[resource.type] ?? "bg-primary-soft text-primary"}`}>
          {resource.type}
        </span>
        <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary">
          {resource.year}
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
          {resource.batch}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-card-foreground">{resource.title}</h3>
      <p className="mt-1 text-sm font-medium text-primary">
        {resource.subject}
        {resource.teacher ? ` · ${resource.teacher}` : ""}
      </p>
      {resource.description && (
        <p className="mt-2 text-sm text-muted-foreground">{resource.description}</p>
      )}
      {resource.contributor && (
        <p className="mt-2 text-xs text-muted-foreground">
          Notes provided by <span className="font-semibold text-foreground">{resource.contributor}</span>
        </p>
      )}
      {resource.captured_by && (
        <p className="mt-1 text-xs text-muted-foreground">
          Notes captured by <span className="font-semibold text-foreground">{resource.captured_by}</span>
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          onClick={() => open(resource, false)}
          className="btn-primary rounded-lg px-3.5 py-1.5 text-sm font-semibold"
        >
          View
        </button>
        <button
          onClick={() => open(resource, true)}
          className="btn-outline rounded-lg px-3.5 py-1.5 text-sm font-semibold"
        >
          Download
        </button>
        {actions}
      </div>
    </article>
  );
}
