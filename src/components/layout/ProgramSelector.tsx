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
  onProgramChange: (programId: string) => void;
}

export default function ProgramSelector({ onProgramChange }: ProgramSelectorProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [userFullName, setUserFullName] = useState<string>("");

  useEffect(() => {
    fetchPrograms();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      
      if (profile?.full_name) {
        setUserFullName(profile.full_name);
      }
    }
  };

  const fetchPrograms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      setPrograms(data);
      setSelectedProgram(data[0]);
      onProgramChange(data[0].id);
    }
  };

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    onProgramChange(program.id);
  };

  const formatProgramName = (program: Program) => {
    return `${program.gender} ${program.level} ${program.sport}`;
  };

  if (!selectedProgram) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2">
          <div className="text-left">
            <div className="text-sm font-medium">
              {userFullName || "Coach"}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatProgramName(selectedProgram)}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-background">
        {programs.map((program) => (
          <DropdownMenuItem
            key={program.id}
            onClick={() => handleProgramSelect(program)}
            className={selectedProgram.id === program.id ? "bg-muted" : ""}
          >
            <div>
              <div className="font-medium">{formatProgramName(program)}</div>
              <div className="text-xs text-muted-foreground">{program.name}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
