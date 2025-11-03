// import React, { useState, useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { CalendarIcon, Filter, Edit, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { z } from "zod";
// // import { useLedger } from "@/contexts/LedgerContext";

// interface AttendanceRecord {
//   id: string;
//   athlete_id: string;
//   date: string;
//   status: "Present" | "Absent" | "Excused";
//   notes: string | null;
// }

// const AttendanceTracker = () => {
//   const { athletes, loading: athletesLoading, refreshAthletes } = useLedger();
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [filterStatus, setFilterStatus] = useState<string[]>(["all"]);
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(true);
//   const [noteDialogOpen, setNoteDialogOpen] = useState(false);
//   const [currentNoteAthleteId, setCurrentNoteAthleteId] = useState<string | null>(null);
//   const [currentNoteText, setCurrentNoteText] = useState("");
//   const { toast } = useToast();

//   useEffect(() => {
//     // Reset states when date changes
//     setNoteDialogOpen(false);
//     setCurrentNoteAthleteId(null);
//     if (athletes.length > 0) {
//       fetchAttendance();
//       checkSubmissionStatus();
//     }
//   }, [selectedDate, athletes.length]);
//   const checkSubmissionStatus = async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       const dateStr = format(selectedDate, "yyyy-MM-dd");
//       const { data, error } = await supabase
//         .from("attendance_submissions")
//         .select("*")
//         .eq("coach_id", user.id)
//         .eq("date", dateStr)
//         .maybeSingle();
//       if (error) throw error;
//       const submitted = !!data;
//       setIsSubmitted(submitted);
//       setIsEditMode(!submitted);
//     } catch (error) {
//       console.error("Error checking submission status:", error);
//     }
//   };
//   const fetchAttendance = async () => {
//     try {
//       setLoading(true);
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       const dateStr = format(selectedDate, "yyyy-MM-dd");
//       const { data, error } = await supabase.from("attendance").select("*").eq("coach_id", user.id).eq("date", dateStr);
//       if (error) throw error;
//       setAttendance((data || []) as AttendanceRecord[]);
//     } catch (error) {
//       console.error("Error fetching attendance:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const updateAttendance = async (athleteId: string, status: "Present" | "Absent" | "Excused", notes?: string) => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       const dateStr = format(selectedDate, "yyyy-MM-dd");
//       const existingRecord = attendance.find((a) => a.athlete_id === athleteId);
//       if (existingRecord) {
//         const { error } = await supabase
//           .from("attendance")
//           .update({
//             status,
//             notes: notes || null,
//           })
//           .eq("id", existingRecord.id);
//         if (error) throw error;
//       } else {
//         const { error } = await supabase.from("attendance").insert({
//           athlete_id: athleteId,
//           coach_id: user.id,
//           date: dateStr,
//           status,
//           notes: notes || null,
//         });
//         if (error) throw error;
//       }
//       await fetchAttendance();
//       await refreshAthletes(); // Refresh attendance rates in Ledger
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update attendance",
//         variant: "destructive",
//       });
//     }
//   };
//   const attendanceNotesSchema = z.object({
//     notes: z
//       .string()
//       .max(500, "Notes must be less than 500 characters")
//       .optional()
//       .nullable()
//       .transform((val) => val || null),
//   });
//   const openNoteDialog = (athleteId: string) => {
//     const record = attendance.find((a) => a.athlete_id === athleteId);
//     setCurrentNoteAthleteId(athleteId);
//     setCurrentNoteText(record?.notes || "");
//     setNoteDialogOpen(true);
//   };

//   const saveNoteFromDialog = async () => {
//     if (!currentNoteAthleteId) return;

//     // Validate notes length
//     const validation = attendanceNotesSchema.safeParse({
//       notes: currentNoteText || null,
//     });
//     if (!validation.success) {
//       toast({
//         title: "Validation Error",
//         description: validation.error.errors[0].message,
//         variant: "destructive",
//       });
//       return;
//     }
//     const record = attendance.find((a) => a.athlete_id === currentNoteAthleteId);
//     const currentStatus = record?.status || "Present";
//     await updateAttendance(currentNoteAthleteId, currentStatus, validation.data.notes || undefined);

//     setNoteDialogOpen(false);
//     setCurrentNoteAthleteId(null);
//     setCurrentNoteText("");
//   };

//   const cancelNoteDialog = () => {
//     setNoteDialogOpen(false);
//     setCurrentNoteAthleteId(null);
//     setCurrentNoteText("");
//   };
//   const submitAttendance = async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       const dateStr = format(selectedDate, "yyyy-MM-dd");
//       const promises = athletes.map((athlete) => {
//         const existingRecord = attendance.find((a) => a.athlete_id === athlete.id);
//         if (existingRecord) {
//           return supabase
//             .from("attendance")
//             .update({
//               status: existingRecord.status,
//               notes: existingRecord.notes,
//             })
//             .eq("id", existingRecord.id);
//         } else {
//           return supabase.from("attendance").insert({
//             athlete_id: athlete.id,
//             coach_id: user.id,
//             date: dateStr,
//             status: "Present",
//             notes: null,
//           });
//         }
//       });
//       await Promise.all(promises);

//       // Mark as submitted in attendance_submissions
//       await supabase.from("attendance_submissions").upsert(
//         {
//           coach_id: user.id,
//           date: dateStr,
//           submitted_at: new Date().toISOString(),
//         },
//         {
//           onConflict: "coach_id,date",
//         },
//       );
//       await fetchAttendance();
//       await refreshAthletes(); // Refresh attendance rates in Ledger
//       setIsEditMode(false);
//       setIsSubmitted(true);
//       toast({
//         title: "Success",
//         description: "Attendance submitted successfully",
//       });
//     } catch (error) {
//       console.error("Error submitting attendance:", error);
//       toast({
//         title: "Error",
//         description: "Failed to submit attendance",
//         variant: "destructive",
//       });
//     }
//   };
//   const clearAllAttendance = async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!user) return;
//       const dateStr = format(selectedDate, "yyyy-MM-dd");

//       // Delete all attendance records for this date
//       const { error: attendanceError } = await supabase
//         .from("attendance")
//         .delete()
//         .eq("coach_id", user.id)
//         .eq("date", dateStr);
//       if (attendanceError) throw attendanceError;

//       // Delete submission marker
//       const { error: submissionError } = await supabase
//         .from("attendance_submissions")
//         .delete()
//         .eq("coach_id", user.id)
//         .eq("date", dateStr);
//       if (submissionError) throw submissionError;

//       // Reset UI state
//       setAttendance([]);
//       setIsSubmitted(false);
//       setIsEditMode(true);
//       await refreshAthletes(); // Refresh attendance rates in Ledger
//       toast({
//         title: "Cleared",
//         description: "All attendance for this date has been cleared",
//       });
//     } catch (error) {
//       console.error("Error clearing attendance:", error);
//       toast({
//         title: "Error",
//         description: "Failed to clear attendance",
//         variant: "destructive",
//       });
//     }
//   };
//   const enableEditMode = () => {
//     setIsEditMode(true);
//     setIsSubmitted(false);
//   };
//   const getStatusBadge = (status: "Present" | "Absent" | "Excused") => {
//     const variants = {
//       Present: "default",
//       Absent: "destructive",
//       Excused: "secondary",
//     } as const;
//     return <Badge variant={variants[status]}>{status}</Badge>;
//   };
//   const handlePreviousDay = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setDate(newDate.getDate() - 1);
//     setSelectedDate(newDate);
//   };
//   const handleNextDay = () => {
//     const newDate = new Date(selectedDate);
//     newDate.setDate(newDate.getDate() + 1);
//     setSelectedDate(newDate);
//   };
//   const filteredAthletes = athletes.filter((athlete) => {
//     if (filterStatus.includes("all")) return true;
//     const record = attendance.find((a) => a.athlete_id === athlete.id);
//     const status = record?.status || "Present";
//     const hasNotes = !!record?.notes;
//     return filterStatus.some((filter) => {
//       if (filter === "Present") return status === "Present";
//       if (filter === "Absent") return status === "Absent";
//       if (filter === "Excused") return status === "Excused";
//       if (filter === "Noted Reason") return hasNotes;
//       return false;
//     });
//   });

//   if (loading || athletesLoading) {
//     return <div className="text-center p-8">Loading...</div>;
//   }

//   if (athletes.length === 0) {
//     return (
//       <Card>
//         <CardContent className="p-8 text-center">
//           <p className="text-muted-foreground">
//             No athletes found for this program. Add athletes in Ledger first.
//           </p>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex flex-col items-center gap-4">
//           <CardTitle className="text-xl font-semibold text-center">Attendance for</CardTitle>

//           {/* Date Navigation Bar */}
//           <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg w-full max-w-md mx-auto">
//             <Button variant="ghost" size="icon" onClick={handlePreviousDay} className="h-8 w-8">
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             <span className="text-lg font-bold min-w-[120px] text-center">{format(selectedDate, "MM/dd/yyyy")}</span>

//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-8 w-8">
//                   <CalendarIcon className="h-4 w-4" />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0 bg-popover z-50" align="center">
//                 <Calendar
//                   mode="single"
//                   selected={selectedDate}
//                   onSelect={(date) => date && setSelectedDate(date)}
//                   initialFocus
//                   className={cn("p-3 pointer-events-auto")}
//                 />
//               </PopoverContent>
//             </Popover>

//             <Button variant="ghost" size="icon" onClick={handleNextDay} className="h-8 w-8">
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>

//           {/* Controls Bar */}
//           <div className="flex flex-nowrap items-center justify-center gap-3 w-full max-w-md mx-auto">
//             <div className="flex-1 min-w-0">
//               <Select
//                 value={filterStatus.includes("all") ? "all" : filterStatus[0] || "all"}
//                 onValueChange={(value) => {
//                   if (value === "all") setFilterStatus(["all"]);
//                   else setFilterStatus([value]);
//                 }}
//               >
//                 <SelectTrigger className="w-full">
//                   <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
//                   <SelectValue placeholder="Filter" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-popover z-50">
//                   <SelectItem value="all">All</SelectItem>
//                   <SelectItem value="Present">Present</SelectItem>
//                   <SelectItem value="Absent">Absent</SelectItem>
//                   <SelectItem value="Excused">Excused</SelectItem>
//                   <SelectItem value="Noted Reason">Noted Reason</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex-1 min-w-0">
//               {isSubmitted && !isEditMode ? (
//                 <Button onClick={enableEditMode} variant="outline" size="sm" className="w-full whitespace-nowrap">
//                   <Edit className="w-4 h-4 mr-2 flex-shrink-0" />
//                   Edit
//                 </Button>
//               ) : (
//                 <Button onClick={submitAttendance} variant="default" size="sm" className="w-full whitespace-nowrap">
//                   Submit
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Name</TableHead>
//               <TableHead className="w-[160px] text-center">Status</TableHead>
//               <TableHead className="w-[80px] text-center">Notes</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredAthletes.map((athlete) => {
//               const record = attendance.find((a) => a.athlete_id === athlete.id);
//               const currentStatus = record?.status || "Present";
//               const hasNote = !!record?.notes;
//               return (
//                 <TableRow key={athlete.id} className={cn(!isEditMode && "opacity-60")}>
//                   <TableCell className="font-medium">{athlete.name}</TableCell>
//                   <TableCell className="text-center">
//                     <Select
//                       value={currentStatus}
//                       onValueChange={(value) =>
//                         updateAttendance(
//                           athlete.id,
//                           value as "Present" | "Absent" | "Excused",
//                           record?.notes || undefined,
//                         )
//                       }
//                       disabled={!isEditMode}
//                     >
//                       <SelectTrigger className="w-full max-w-[140px] mx-auto">
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent className="bg-popover z-50">
//                         <SelectItem value="Present">Present</SelectItem>
//                         <SelectItem value="Absent">Absent</SelectItem>
//                         <SelectItem value="Excused">Excused</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell className="text-center">
//                     <Button variant="ghost" size="icon" onClick={() => openNoteDialog(athlete.id)} className="h-8 w-8">
//                       <MessageSquare
//                         className={cn("h-4 w-4", hasNote ? "fill-current text-primary" : "text-muted-foreground")}
//                       />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>

//         {/* Note Dialog */}
//         <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
//           <DialogContent className="bg-popover">
//             <DialogHeader>
//               <DialogTitle>Add/Edit Note</DialogTitle>
//               <DialogDescription>Add or edit attendance notes for this athlete (max 500 characters).</DialogDescription>
//             </DialogHeader>
//             <Textarea
//               placeholder="Enter note..."
//               value={currentNoteText}
//               onChange={(e) => setCurrentNoteText(e.target.value)}
//               className="min-h-[100px]"
//               maxLength={500}
//               disabled={!isEditMode}
//             />
//             <DialogFooter>
//               <Button variant="outline" onClick={cancelNoteDialog}>
//                 {isEditMode ? "Cancel" : "Close"}
//               </Button>
//               {isEditMode && <Button onClick={saveNoteFromDialog}>Save</Button>}
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {filteredAthletes.length === 0 && (
//           <div className="text-center p-8 text-muted-foreground">No athletes found</div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };
// export default AttendanceTracker;
