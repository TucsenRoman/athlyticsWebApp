import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Locker {
  id: string;
  locker_number: string;
  status: string;
  athlete_id: string | null;
  combination: string | null;
}

interface Athlete {
  id: string;
  name: string;
}

export default function LockersView({ searchQuery }: { searchQuery: string }) {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lockersRes, athletesRes] = await Promise.all([
        supabase.from("lockers").select("*").order("locker_number"),
        supabase.from("athletes").select("id, name").order("name"),
      ]);

      if (lockersRes.error) throw lockersRes.error;
      if (athletesRes.error) throw athletesRes.error;

      setLockers(lockersRes.data || []);
      setAthletes(athletesRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load lockers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this locker?")) return;

    try {
      const { error } = await supabase.from("lockers").delete().eq("id", id);
      if (error) throw error;

      toast.success("Locker deleted successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete locker");
    }
  };

  const getAthleteName = (athleteId: string | null) => {
    if (!athleteId) return "—";
    const athlete = athletes.find((a) => a.id === athleteId);
    return athlete?.name || "—";
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Assigned":
        return "default";
      case "Available":
        return "secondary";
      case "Out of Service":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredLockers = lockers.filter(locker => {
    const athleteName = getAthleteName(locker.athlete_id);
    return (
      locker.locker_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athleteName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) {
    return <div className="text-center py-8">Loading lockers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Locker #</TableHead>
              <TableHead>Athlete Assigned</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLockers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No lockers found" : "No lockers yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLockers.map((locker) => (
                <TableRow key={locker.id}>
                  <TableCell className="font-medium">{locker.locker_number}</TableCell>
                  <TableCell>{getAthleteName(locker.athlete_id)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(locker.status)}>
                      {locker.status}
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
                        onClick={() => handleDelete(locker.id)}
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
