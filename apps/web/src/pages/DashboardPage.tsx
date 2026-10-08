// import { useEffect, useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { ClipboardList, Users, CalendarDays, BarChart3 } from "lucide-react";

// interface Program {
//   id: string;
//   sport: string;
//   level: string;
//   gender: string;
//   school: string;
//   season_year: string;
// }

// export default function Dashboard() {
//   const [programs, setPrograms] = useState<Program[]>([]);
//   const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchPrograms = async () => {
//       const { data, error } = await supabase.from("programs").select("*").order("season_year", { ascending: false });
//       if (error) console.error("Error fetching programs:", error);
//       else setPrograms(data || []);
//     };
//     fetchPrograms();
//   }, []);

//   const handleProgramChange = (id: string) => {
//     setSelectedProgram(id);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Program Selector */}
//       {/* needs coach_id attached */}
//       <Card className="bg-card border-border">
//         <CardHeader>
//           <CardTitle>Select a Program</CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col sm:flex-row items-center gap-3">
//           <Select value={selectedProgram || ""} onValueChange={handleProgramChange}>
//             <SelectTrigger className="w-full sm:w-[280px]">
//               <SelectValue placeholder="Choose program..." />
//             </SelectTrigger>
//             <SelectContent>
//               {programs.map((program) => (
//                 <SelectItem key={program.id} value={program.id}>
//                   {program.school} {program.sport} {program.level} ({program.season_year})
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Button disabled={!selectedProgram} onClick={() => navigate(`/ledger?program=${selectedProgram}`)}>
//             Open Ledger
//           </Button>
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Card className="hover:shadow-md transition-all">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Athletes</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <Button variant="outline" className="w-full" onClick={() => navigate("/athletes")}>
//               View Roster
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="hover:shadow-md transition-all">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Performance Logs</CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <Button variant="outline" className="w-full" onClick={() => navigate("/ledger")}>
//               View Ledger
//             </Button>
//           </CardContent>
//         </Card>

//         <Card className="hover:shadow-md transition-all">
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Upcoming Meets</CardTitle>
//             <CalendarDays className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <p className="text-sm text-muted-foreground">No events scheduled.</p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
