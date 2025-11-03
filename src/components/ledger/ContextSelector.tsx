// import { useState, useEffect } from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Plus } from "lucide-react";
// import { toast } from "sonner";

// export interface LedgerContext {
//   school: string;
//   program: string;
//   season: string;
// }

// interface ContextSelectorProps {
//   currentContext: LedgerContext;
//   onContextChange: (context: LedgerContext) => void;
// }

// interface ContextOptions {
//   schools: string[];
//   programs: string[];
//   seasons: string[];
// }

// export default function ContextSelector({ currentContext, onContextChange }: ContextSelectorProps) {
//   const [options, setOptions] = useState<ContextOptions>({ schools: [], programs: [], seasons: [] });
//   const [isAddingSchool, setIsAddingSchool] = useState(false);
//   const [isAddingProgram, setIsAddingProgram] = useState(false);
//   const [isAddingSeason, setIsAddingSeason] = useState(false);
//   const [newSchool, setNewSchool] = useState("");
//   const [newProgram, setNewProgram] = useState("");
//   const [newSeason, setNewSeason] = useState("");

//   useEffect(() => {
//     // Load context options from localStorage
//     const stored = localStorage.getItem("ledger_context_options");
//     if (stored) {
//       try {
//         setOptions(JSON.parse(stored));
//       } catch {
//         initializeDefaultOptions();
//       }
//     } else {
//       initializeDefaultOptions();
//     }
//   }, []);

//   const initializeDefaultOptions = () => {
//     const defaultOptions: ContextOptions = {
//       schools: ["Zimmerman High School"],
//       programs: ["Basketball", "Football", "Track & Field"],
//       seasons: ["2023-2024", "2024-2025", "2025-2026"],
//     };
//     setOptions(defaultOptions);
//     localStorage.setItem("ledger_context_options", JSON.stringify(defaultOptions));
//   };

//   const saveOptions = (newOptions: ContextOptions) => {
//     setOptions(newOptions);
//     localStorage.setItem("ledger_context_options", JSON.stringify(newOptions));
//   };

//   const handleAddSchool = () => {
//     if (!newSchool.trim()) {
//       toast.error("School name cannot be empty");
//       return;
//     }
//     if (options.schools.includes(newSchool.trim())) {
//       toast.error("School already exists");
//       return;
//     }
//     const updatedOptions = { ...options, schools: [...options.schools, newSchool.trim()] };
//     saveOptions(updatedOptions);
//     onContextChange({ ...currentContext, school: newSchool.trim() });
//     setNewSchool("");
//     setIsAddingSchool(false);
//     toast.success("School added");
//   };

//   const handleAddProgram = () => {
//     if (!newProgram.trim()) {
//       toast.error("Program name cannot be empty");
//       return;
//     }
//     if (options.programs.includes(newProgram.trim())) {
//       toast.error("Program already exists");
//       return;
//     }
//     const updatedOptions = { ...options, programs: [...options.programs, newProgram.trim()] };
//     saveOptions(updatedOptions);
//     onContextChange({ ...currentContext, program: newProgram.trim() });
//     setNewProgram("");
//     setIsAddingProgram(false);
//     toast.success("Program added");
//   };

//   const handleAddSeason = () => {
//     if (!newSeason.trim()) {
//       toast.error("Season name cannot be empty");
//       return;
//     }
//     if (options.seasons.includes(newSeason.trim())) {
//       toast.error("Season already exists");
//       return;
//     }
//     const updatedOptions = { ...options, seasons: [...options.seasons, newSeason.trim()] };
//     saveOptions(updatedOptions);
//     onContextChange({ ...currentContext, season: newSeason.trim() });
//     setNewSeason("");
//     setIsAddingSeason(false);
//     toast.success("Season added");
//   };

//   return (
//     <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
//       <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
//         <span>Context:</span>
//         <span className="text-foreground font-semibold">
//           {currentContext.school} – {currentContext.program} {currentContext.season}
//         </span>
//       </div>
      
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <Label className="text-xs text-muted-foreground">School</Label>
//             <Dialog open={isAddingSchool} onOpenChange={setIsAddingSchool}>
//               <DialogTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-6 px-2">
//                   <Plus className="w-3 h-3" />
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-md bg-card">
//                 <DialogHeader>
//                   <DialogTitle>Add School</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <Input
//                     placeholder="School name"
//                     value={newSchool}
//                     onChange={(e) => setNewSchool(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleAddSchool()}
//                     autoFocus
//                   />
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setIsAddingSchool(false)}>Cancel</Button>
//                   <Button onClick={handleAddSchool}>Add School</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//           <Select
//             value={currentContext.school}
//             onValueChange={(value) => onContextChange({ ...currentContext, school: value })}
//           >
//             <SelectTrigger className="bg-background">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {options.schools.map((school) => (
//                 <SelectItem key={school} value={school}>
//                   {school}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <Label className="text-xs text-muted-foreground">Program</Label>
//             <Dialog open={isAddingProgram} onOpenChange={setIsAddingProgram}>
//               <DialogTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-6 px-2">
//                   <Plus className="w-3 h-3" />
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-md bg-card">
//                 <DialogHeader>
//                   <DialogTitle>Add Program</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <Input
//                     placeholder="Program name (e.g., Football)"
//                     value={newProgram}
//                     onChange={(e) => setNewProgram(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleAddProgram()}
//                     autoFocus
//                   />
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setIsAddingProgram(false)}>Cancel</Button>
//                   <Button onClick={handleAddProgram}>Add Program</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//           <Select
//             value={currentContext.program}
//             onValueChange={(value) => onContextChange({ ...currentContext, program: value })}
//           >
//             <SelectTrigger className="bg-background">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {options.programs.map((program) => (
//                 <SelectItem key={program} value={program}>
//                   {program}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <Label className="text-xs text-muted-foreground">Season</Label>
//             <Dialog open={isAddingSeason} onOpenChange={setIsAddingSeason}>
//               <DialogTrigger asChild>
//                 <Button variant="ghost" size="sm" className="h-6 px-2">
//                   <Plus className="w-3 h-3" />
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-md bg-card">
//                 <DialogHeader>
//                   <DialogTitle>Add Season</DialogTitle>
//                 </DialogHeader>
//                 <div className="space-y-4 py-4">
//                   <Input
//                     placeholder="Season (e.g., 2024-2025)"
//                     value={newSeason}
//                     onChange={(e) => setNewSeason(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleAddSeason()}
//                     autoFocus
//                   />
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setIsAddingSeason(false)}>Cancel</Button>
//                   <Button onClick={handleAddSeason}>Add Season</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </div>
//           <Select
//             value={currentContext.season}
//             onValueChange={(value) => onContextChange({ ...currentContext, season: value })}
//           >
//             <SelectTrigger className="bg-background">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {options.seasons.map((season) => (
//                 <SelectItem key={season} value={season}>
//                   {season}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </div>
//   );
// }
