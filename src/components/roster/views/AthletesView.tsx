import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Athlete {
  id: string;
  name: string;
  grade: number;
  gender: string;
}

interface Locker {
  locker_number: string;
}

interface Uniform {
  top_id: string;
  bottom_id: string;
}

interface AthleteWithDetails extends Athlete {
  locker?: Locker;
  uniform?: Uniform;
}

export default function AthletesView({ 
  searchQuery,
  onSwitchToAttendance 
}: { 
  searchQuery: string;
  onSwitchToAttendance?: () => void;
}) {
  const [athletes, setAthletes] = useState<AthleteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data: athletesData, error: athletesError } = await supabase
        .from("athletes")
        .select("*")
        .order("name");

      if (athletesError) throw athletesError;

      // Fetch lockers
      const { data: lockersData } = await supabase
        .from("lockers")
        .select("athlete_id, locker_number");

      // Fetch uniforms
      const { data: uniformsData } = await supabase
        .from("uniforms")
        .select("athlete_id, top_id, bottom_id")
        .eq("status", "Checked Out");

      // Combine data
      const athletesWithDetails: AthleteWithDetails[] = (athletesData || []).map(athlete => ({
        ...athlete,
        locker: lockersData?.find(l => l.athlete_id === athlete.id),
        uniform: uniformsData?.find(u => u.athlete_id === athlete.id),
      }));

      setAthletes(athletesWithDetails);
    } catch (error: any) {
      toast.error("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this athlete?")) return;

    try {
      const { error } = await supabase.from("athletes").delete().eq("id", id);
      if (error) throw error;

      toast.success("Athlete deleted successfully");
      fetchAthletes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete athlete");
    }
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.locker?.locker_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.uniform?.top_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.uniform?.bottom_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading athletes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            className="w-full"
            readOnly
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="default" size="sm">
            Edit
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No athletes found" : "No athletes yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell className="font-medium">{athlete.name}</TableCell>
                  <TableCell>{athlete.grade}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{athlete.gender}</Badge>
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
                        onClick={() => handleDelete(athlete.id)}
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
