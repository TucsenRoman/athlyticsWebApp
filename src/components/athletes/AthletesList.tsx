import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Award, Trophy, User, Search } from "lucide-react";
import { toast } from "sonner";

interface Athlete {
  id: string;
  name: string;
  grade: number;
  gender: string;
  events: string[];
  personal_records: any;
  achievements: string[];
  athlete_of_week: boolean;
  athlete_of_meet: boolean;
}

export default function AthletesList() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: "",
    grade: "9",
    gender: "Male",
  });

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("name");

      if (error) throw error;
      setAthletes(data || []);
    } catch (error: any) {
      toast.error("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("athletes").insert({
        coach_id: user.id,
        name: newAthlete.name,
        grade: parseInt(newAthlete.grade),
        gender: newAthlete.gender,
      });

      if (error) throw error;

      toast.success("Athlete added successfully!");
      setIsAddDialogOpen(false);
      setNewAthlete({ name: "", grade: "9", gender: "Male" });
      fetchAthletes();
    } catch (error: any) {
      toast.error(error.message || "Failed to add athlete");
    }
  };

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading athletes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Athlete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Athlete</DialogTitle>
              <DialogDescription>
                Enter the athlete's information to add them to your roster.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAthlete} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newAthlete.name}
                  onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={newAthlete.grade}
                  onValueChange={(value) => setNewAthlete({ ...newAthlete, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={newAthlete.gender}
                  onValueChange={(value) => setNewAthlete({ ...newAthlete, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Athlete</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Athletes Roster
          </CardTitle>
          <CardDescription>
            {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? 's' : ''} in your program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Awards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAthletes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No athletes found. Add your first athlete to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredAthletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">{athlete.name}</TableCell>
                    <TableCell>{athlete.grade}th</TableCell>
                    <TableCell>{athlete.gender}</TableCell>
                    <TableCell>
                      {athlete.events.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {athlete.events.slice(0, 2).map((event, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {athlete.events.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{athlete.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No events</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {athlete.athlete_of_week && (
                          <Badge variant="default" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Week
                          </Badge>
                        )}
                        {athlete.athlete_of_meet && (
                          <Badge className="text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            Meet
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}