import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Program {
  id: string;
  name: string;
  sport: string;
  level: string;
  gender: string;
  school: string;
  season_year: string;
}

interface ProgramSelectorProps {
  selectedProgramId: string | null;
  onProgramChange: (programId: string) => void;
}

export default function ProgramSelector({ selectedProgramId, onProgramChange }: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndPrograms();
  }, []);

  const fetchUserAndPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserName(profileData.full_name || user.email || "Coach");
      }

      // Fetch programs
      const { data: programsData } = await supabase
        .from("programs")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: true });

      if (programsData && programsData.length > 0) {
        setPrograms(programsData);
        
        // Set first program as default if none selected
        if (!selectedProgramId) {
          onProgramChange(programsData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProgram = programs.find(p => p.id === selectedProgramId);
  
  const formatProgramName = (program: Program) => {
    return `${program.gender} ${program.level} ${program.sport}`;
  };

  const formatProgramDetails = (program: Program) => {
    return `${program.school} • ${program.season_year}`;
  };

  if (loading || programs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{userName || "Loading..."}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto w-full md:w-auto px-3 py-2 md:px-2 md:py-1 hover:bg-muted/50 min-h-[48px] md:min-h-0 touch-manipulation justify-between md:justify-start"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="text-left flex-1">
              <div className="text-base md:text-sm font-medium">
                {userName}
              </div>
              {selectedProgram && (
                <div className="text-sm md:text-xs text-muted-foreground">
                  {formatProgramName(selectedProgram)}
                </div>
              )}
            </div>
            <ChevronDown className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[95vw] md:w-80 max-h-[250px] overflow-y-auto z-50"
      >
        {programs.map((program) => (
          <DropdownMenuItem
            key={program.id}
            onClick={() => onProgramChange(program.id)}
            className={`min-h-[44px] md:min-h-0 touch-manipulation ${selectedProgramId === program.id ? "bg-muted" : ""}`}
          >
            <div className="flex flex-col gap-0.5 w-full py-1">
              <span className="font-medium text-base md:text-sm">{formatProgramName(program)}</span>
              <span className="text-sm md:text-xs text-muted-foreground">
                {formatProgramDetails(program)}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
