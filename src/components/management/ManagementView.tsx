import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Athlete {
  id: string;
  name: string;
  grade: number;
  gender: string;
}

interface Locker {
  locker_number: string;
  combination?: string;
  location?: string;
  status?: string;
}

interface Uniform {
  top_id: string;
  bottom_id: string;
  status: string;
}

interface AthleteWithDetails extends Athlete {
  locker?: Locker;
  uniform?: Uniform;
}

const availableHeaders = [
  { id: "name", label: "Name" },
  { id: "grade", label: "Grade" },
  { id: "gender", label: "Gender" },
  { id: "locker", label: "Locker #" },
  { id: "uniform", label: "Uniform" },
];

export default function ManagementView() {
  const [athletes, setAthletes] = useState<AthleteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(["name", "grade", "gender"]);
  const [showHeaderSelect, setShowHeaderSelect] = useState(false);

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

      const { data: lockersData } = await supabase
        .from("lockers")
        .select("athlete_id, locker_number, combination, location, status");

      const { data: uniformsData } = await supabase
        .from("uniforms")
        .select("athlete_id, top_id, bottom_id, status")
        .eq("status", "Checked Out");

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

  const toggleHeader = (headerId: string) => {
    setSelectedHeaders(prev =>
      prev.includes(headerId)
        ? prev.filter(h => h !== headerId)
        : [...prev, headerId]
    );
  };

  const searchedAthlete = searchQuery.trim()
    ? athletes.find(a => a.name.toLowerCase() === searchQuery.toLowerCase())
    : null;

  const filteredAthletes = searchQuery.trim() && !searchedAthlete
    ? athletes.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : athletes;

  const renderCellValue = (athlete: AthleteWithDetails, headerId: string) => {
    switch (headerId) {
      case "name":
        return athlete.name;
      case "grade":
        return athlete.grade;
      case "gender":
        return <Badge variant="outline">{athlete.gender}</Badge>;
      case "locker":
        return athlete.locker?.locker_number || "—";
      case "uniform":
        return athlete.uniform ? `${athlete.uniform.top_id} / ${athlete.uniform.bottom_id}` : "—";
      default:
        return "—";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-1">
          <Label htmlFor="headers" className="mb-2 block">Headers</Label>
          <div className="relative">
            <button
              onClick={() => setShowHeaderSelect(!showHeaderSelect)}
              className="w-full flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <span>{selectedHeaders.length} selected</span>
              <span>▼</span>
            </button>
            {showHeaderSelect && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                {availableHeaders.map(header => (
                  <div key={header.id} className="flex items-center gap-2 py-2">
                    <Checkbox
                      id={header.id}
                      checked={selectedHeaders.includes(header.id)}
                      onCheckedChange={() => toggleHeader(header.id)}
                    />
                    <label htmlFor={header.id} className="text-sm cursor-pointer flex-1">
                      {header.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <Label htmlFor="search" className="mb-2 block">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {searchedAthlete ? (
        <Card>
          <CardHeader>
            <CardTitle>{searchedAthlete.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Grade</p>
                <p className="font-medium">{searchedAthlete.grade}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{searchedAthlete.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locker #</p>
                <p className="font-medium">{searchedAthlete.locker?.locker_number || "Not assigned"}</p>
              </div>
              {searchedAthlete.locker?.combination && (
                <div>
                  <p className="text-sm text-muted-foreground">Combination</p>
                  <p className="font-medium">{searchedAthlete.locker.combination}</p>
                </div>
              )}
              {searchedAthlete.locker?.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{searchedAthlete.locker.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Uniform</p>
                <p className="font-medium">
                  {searchedAthlete.uniform
                    ? `Top: ${searchedAthlete.uniform.top_id}, Bottom: ${searchedAthlete.uniform.bottom_id}`
                    : "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {selectedHeaders.map(headerId => {
                  const header = availableHeaders.find(h => h.id === headerId);
                  return <TableHead key={headerId}>{header?.label}</TableHead>;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAthletes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedHeaders.length} className="text-center text-muted-foreground py-8">
                    No athletes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAthletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    {selectedHeaders.map(headerId => (
                      <TableCell key={headerId}>
                        {renderCellValue(athlete, headerId)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
