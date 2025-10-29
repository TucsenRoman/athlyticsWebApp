import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, User, Search, ChevronDown, Trophy, Award, ShirtIcon, IdCard, TrendingUp, Medal } from "lucide-react";
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
  team_position: string;
}

interface UniformAssignment {
  top_id: string;
  bottom_id: string;
  created_at: string;
}

interface MeetResult {
  id: string;
  meet_name: string;
  meet_date: string;
  event: string;
  mark: string;
  place: number | null;
  is_pr: boolean;
  notes: string | null;
}

interface AthleteDetails {
  uniforms: UniformAssignment[];
  attendanceRate: number;
  totalAttendance: number;
  presentCount: number;
  recentResults: MeetResult[];
}

export default function AthletesList() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [athleteDetails, setAthleteDetails] = useState<Record<string, AthleteDetails>>({});
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedAthleteForResults, setSelectedAthleteForResults] = useState<Athlete | null>(null);
  const [allResults, setAllResults] = useState<MeetResult[]>([]);
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

  const fetchAthleteDetails = async (athleteId: string) => {
    if (athleteDetails[athleteId]) return;

    try {
      // Fetch uniform assignments
      const { data: uniforms } = await supabase
        .from("uniforms")
        .select("top_id, bottom_id, created_at")
        .eq("athlete_id", athleteId)
        .order("created_at", { ascending: false });

      // Fetch attendance records
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("athlete_id", athleteId);

      const totalRecords = attendance?.length || 0;
      const presentRecords = attendance?.filter(a => a.status === "Present").length || 0;
      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      // Fetch recent meet results (last 3)
      const { data: results } = await supabase
        .from("results")
        .select(`
          id,
          event,
          mark,
          place,
          is_pr,
          notes,
          meets!inner(name, date)
        `)
        .eq("athlete_id", athleteId)
        .order("meets(date)", { ascending: false })
        .limit(3);

      const recentResults: MeetResult[] = results?.map((r: any) => ({
        id: r.id,
        meet_name: r.meets.name,
        meet_date: r.meets.date,
        event: r.event,
        mark: r.mark,
        place: r.place,
        is_pr: r.is_pr,
        notes: r.notes,
      })) || [];

      setAthleteDetails(prev => ({
        ...prev,
        [athleteId]: {
          uniforms: uniforms || [],
          attendanceRate,
          totalAttendance: totalRecords,
          presentCount: presentRecords,
          recentResults,
        }
      }));
    } catch (error) {
      console.error("Failed to fetch athlete details:", error);
    }
  };

  const toggleRow = (athleteId: string) => {
    if (expandedRow === athleteId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(athleteId);
      fetchAthleteDetails(athleteId);
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

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const openResultsModal = async (athlete: Athlete) => {
    setSelectedAthleteForResults(athlete);
    setIsResultsModalOpen(true);
    
    try {
      const { data: results } = await supabase
        .from("results")
        .select(`
          id,
          event,
          mark,
          place,
          is_pr,
          notes,
          meets!inner(name, date)
        `)
        .eq("athlete_id", athlete.id)
        .order("meets(date)", { ascending: false });

      const allMeetResults: MeetResult[] = results?.map((r: any) => ({
        id: r.id,
        meet_name: r.meets.name,
        meet_date: r.meets.date,
        event: r.event,
        mark: r.mark,
        place: r.place,
        is_pr: r.is_pr,
        notes: r.notes,
      })) || [];

      setAllResults(allMeetResults);
    } catch (error) {
      console.error("Failed to fetch all results:", error);
      toast.error("Failed to load results");
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAthletes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No athletes found. Add your first athlete to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAthletes.map((athlete) => (
                    <Collapsible
                      key={athlete.id}
                      open={expandedRow === athlete.id}
                      onOpenChange={() => toggleRow(athlete.id)}
                      asChild
                    >
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(athlete.id)}>
                          <TableCell>
                            <ChevronDown 
                              className={`w-4 h-4 transition-transform duration-200 ${expandedRow === athlete.id ? 'rotate-180' : ''}`} 
                            />
                          </TableCell>
                          <TableCell className="font-medium">{athlete.name}</TableCell>
                          <TableCell>{athlete.grade}th</TableCell>
                          <TableCell>{athlete.gender}</TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={4} className="bg-muted/30 p-0 border-b">
                              <div className="p-4 md:p-6 space-y-4 transition-all duration-200 ease-out">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Events & PRs */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        Events & Personal Records
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {athlete.events && athlete.events.length > 0 ? (
                                        <div className="space-y-2">
                                          {athlete.events.map((event, i) => {
                                            const pr = athlete.personal_records?.[event];
                                            return (
                                              <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 p-3 bg-background rounded-md border">
                                                <span className="font-medium text-sm">{event}</span>
                                                {pr ? (
                                                  <div className="flex flex-col items-start sm:items-end gap-0.5">
                                                    <Badge variant="secondary" className="text-xs font-semibold">
                                                      {typeof pr === 'string' ? pr : pr.time}
                                                    </Badge>
                                                    {typeof pr === 'object' && pr.date && (
                                                      <span className="text-xs text-muted-foreground">{pr.date}</span>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <span className="text-xs text-muted-foreground">No PR</span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No events assigned</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Uniforms */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <ShirtIcon className="w-4 h-4 text-primary" />
                                        Uniform Assignments
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {athleteDetails[athlete.id]?.uniforms && athleteDetails[athlete.id].uniforms.length > 0 ? (
                                        <div className="space-y-3">
                                          {athleteDetails[athlete.id].uniforms.map((uniform, i) => (
                                            <div key={i} className="p-3 bg-background rounded-md border">
                                              {i === 0 && athleteDetails[athlete.id].uniforms.length > 1 && (
                                                <Badge variant="default" className="text-xs mb-2">Current</Badge>
                                              )}
                                              <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                  <span className="text-xs text-muted-foreground">Top ID</span>
                                                  <div className="font-medium text-sm">{uniform.top_id}</div>
                                                </div>
                                                <div className="space-y-1">
                                                  <span className="text-xs text-muted-foreground">Bottom ID</span>
                                                  <div className="font-medium text-sm">{uniform.bottom_id}</div>
                                                </div>
                                              </div>
                                              <div className="text-xs text-muted-foreground mt-2">
                                                Assigned: {new Date(uniform.created_at).toLocaleDateString()}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No uniform assigned</p>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Team Position & Attendance */}
                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <IdCard className="w-4 h-4 text-primary" />
                                        Team Position
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <Badge variant={athlete.team_position !== 'None' ? 'default' : 'secondary'} className="w-fit">
                                        {athlete.team_position || 'None'}
                                      </Badge>
                                    </CardContent>
                                  </Card>

                                  <Card className="shadow-sm">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        Attendance Rate
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-semibold">
                                          {athleteDetails[athlete.id]?.attendanceRate ?? 0}%
                                        </span>
                                        {athleteDetails[athlete.id] && (
                                          <span className="text-sm text-muted-foreground">
                                            ({athleteDetails[athlete.id].presentCount}/{athleteDetails[athlete.id].totalAttendance})
                                          </span>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Recent Meet Results */}
                                  <Card className="shadow-sm lg:col-span-2">
                                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Medal className="w-4 h-4 text-primary" />
                                        Recent Meet Results
                                      </CardTitle>
                                      {athleteDetails[athlete.id]?.recentResults && athleteDetails[athlete.id].recentResults.length > 0 && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => openResultsModal(athlete)}
                                          className="text-xs"
                                        >
                                          View all results
                                        </Button>
                                      )}
                                    </CardHeader>
                                    <CardContent>
                                      {athleteDetails[athlete.id]?.recentResults && athleteDetails[athlete.id].recentResults.length > 0 ? (
                                        <div className="space-y-3">
                                          {athleteDetails[athlete.id].recentResults.map((result) => (
                                            <div key={result.id} className="p-3 bg-background rounded-md border">
                                              <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                  <div className="font-medium text-sm flex items-center gap-2">
                                                    {result.meet_name}
                                                    {result.is_pr && (
                                                      <Badge variant="default" className="text-xs">PR</Badge>
                                                    )}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">
                                                    {new Date(result.meet_date).toLocaleDateString()}
                                                  </div>
                                                </div>
                                                {result.place && result.place <= 3 && (
                                                  <Medal className="w-5 h-5 text-amber-500" />
                                                )}
                                              </div>
                                              <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Event</span>
                                                  <div className="font-medium">{result.event}</div>
                                                </div>
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Mark</span>
                                                  <div className="font-medium">{result.mark}</div>
                                                </div>
                                                <div>
                                                  <span className="text-xs text-muted-foreground">Place</span>
                                                  <div className="font-medium">
                                                    {result.place ? getOrdinal(result.place) : 'N/A'}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground py-2">No meet results recorded</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Results Modal */}
      <Dialog open={isResultsModalOpen} onOpenChange={setIsResultsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Meet Results - {selectedAthleteForResults?.name}</DialogTitle>
            <DialogDescription>
              Complete meet performance history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {allResults.length > 0 ? (
              allResults.map((result) => (
                <div key={result.id} className="p-4 bg-muted/30 rounded-md border">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {result.meet_name}
                        {result.is_pr && (
                          <Badge variant="default" className="text-xs">PR</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(result.meet_date).toLocaleDateString()}
                      </div>
                    </div>
                    {result.place && result.place <= 3 && (
                      <Medal className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Event</span>
                      <div className="font-medium">{result.event}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Mark</span>
                      <div className="font-medium">{result.mark}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Place</span>
                      <div className="font-medium">
                        {result.place ? getOrdinal(result.place) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  {result.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {result.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No results recorded</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}