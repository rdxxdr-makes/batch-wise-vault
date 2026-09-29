import { useQuery } from "@tanstack/react-query";
import { listResources } from "./store";

export type Resource = {
  id: string;
  title: string;
  year: string;
  batch: string;
  subject: string;
  teacher: string | null;
  type: string;
  description: string | null;
  contributor: string | null;
  file_path: string;
  file_name: string;
};

export function useResources() {
  return useQuery({ queryKey: ["resources"], queryFn: listResources });
}
