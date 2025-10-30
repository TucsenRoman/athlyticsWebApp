import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import RosterControls from "../RosterControls";

interface Uniform {
  id: string;
  top_id: string;
  bottom_id: string;
  status: string;
  athlete_id: string | null;
  assigned_to: string | null;
}

interface Athlete {
  id: string;
  name: string;
}

export default function UniformsView({ searchQuery }: { searchQuery: string }) {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uniformsRes, athletesRes] = await Promise.all([
        supabase.from("uniforms").select("*").order("top_id"),
        supabase.from("athletes").select("id, name").order("name"),
      ]);

      if (uniformsRes.error) throw uniformsRes.error;
      if (athletesRes.error) throw athletesRes.error;

      setUniforms(uniformsRes.data || []);
      setAthletes(athletesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load uniforms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this uniform?")) return;

    try {
      const { error } = await supabase.from("uniforms").delete().eq("id", id);
      if (error) throw error;

      toast.success("Uniform deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete uniform");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Checked Out":
        return "default";
      case "Returned":
        return "secondary";
      case "Lost":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredUniforms = uniforms.filter(uniform =>
    uniform.top_id.toLowerCase().includes(localSearch.toLowerCase()) ||
    uniform.bottom_id.toLowerCase().includes(localSearch.toLowerCase()) ||
    (uniform.assigned_to && uniform.assigned_to.toLowerCase().includes(localSearch.toLowerCase()))
  );

  if (loading) {
    return <div className="text-center py-8">Loading uniforms...</div>;
  }

  return (
    <div className="space-y-4">
      <RosterControls
        placeholder="Search uniforms..."
        searchValue={localSearch}
        onSearchChange={setLocalSearch}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Uniform ID</TableHead>
              <TableHead>Athlete Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUniforms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {localSearch ? "No uniforms found" : "No uniforms yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUniforms.map((uniform) => (
                <TableRow key={uniform.id}>
                  <TableCell className="font-medium">
                    {uniform.top_id}/{uniform.bottom_id}
                  </TableCell>
                  <TableCell>{uniform.assigned_to || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(uniform.status)}>
                      {uniform.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(uniform.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
