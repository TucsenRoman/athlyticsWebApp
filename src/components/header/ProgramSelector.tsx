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
        <Button variant="ghost" className="h-auto px-2 py-1 hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="text-left">
              <div className="text-sm font-medium">
                {userName}
              </div>
              {selectedProgram && (
                <div className="text-xs text-muted-foreground">
                  {formatProgramName(selectedProgram)}
                </div>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {programs.map((program) => (
          <DropdownMenuItem
            key={program.id}
            onClick={() => onProgramChange(program.id)}
            className={selectedProgramId === program.id ? "bg-muted" : ""}
          >
            <div className="flex flex-col">
              <span className="font-medium">{program.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatProgramName(program)}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
