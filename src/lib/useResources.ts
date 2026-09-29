import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["resources"],
    queryFn: async (): Promise<Resource[]> => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });
}
