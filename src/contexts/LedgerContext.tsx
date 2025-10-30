import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LedgerContext {
  school: string;
  program: string;
  season: string;
}

export interface HeaderDefinition {
  id: string;
  label: string;
  isHardwired: boolean;
}

export interface AthleteData {
  id: string;
  name: string;
  grade: number | null;
  gender: string | null;
  team_position: string | null;
  events: string[];
  achievements: string[];
  personal_records: any;
  athlete_of_week: boolean;
  athlete_of_meet: boolean;
  program_id?: string;
  coach_id?: string;
  context_school?: string;
  context_program?: string;
  context_season?: string;
  [key: string]: any; // For custom fields
}

interface LedgerContextType {
  currentContext: LedgerContext;
  setCurrentContext: (context: LedgerContext) => void;
  headers: HeaderDefinition[];
  athletes: AthleteData[];
  loading: boolean;
  addHeader: (label: string) => void;
  editHeader: (id: string, newLabel: string) => void;
  deleteHeader: (id: string) => void;
  addAthlete: (athleteData: Partial<AthleteData>) => Promise<void>;
  updateAthlete: (id: string, field: string, value: any) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;
  refreshAthletes: () => Promise<void>;
  getCustomFieldValue: (athleteId: string, fieldId: string) => string;
  getAttendanceRate: (athleteId: string) => string;
}

const LedgerReactContext = createContext<LedgerContextType | undefined>(undefined);

// Hardwired headers that cannot be deleted
const HARDWIRED_HEADERS: HeaderDefinition[] = [
  { id: "name", label: "Name", isHardwired: true },
  { id: "gender", label: "Gender", isHardwired: true },
  { id: "grade", label: "Grade", isHardwired: true },
  { id: "attendance_rate", label: "Attendance Rate", isHardwired: true },
];

// Additional default headers that CAN be deleted
const DEFAULT_HEADERS: HeaderDefinition[] = [
  { id: "team_position", label: "Position", isHardwired: false },
  { id: "events", label: "Events", isHardwired: false },
  { id: "achievements", label: "Achievements", isHardwired: false },
  { id: "athlete_of_week", label: "Athlete of Week", isHardwired: false },
  { id: "athlete_of_meet", label: "Athlete of Meet", isHardwired: false },
];

export function LedgerProvider({ children }: { children: React.ReactNode}) {
  const [currentContext, setCurrentContext] = useState<LedgerContext>({
    school: "Zimmerman High School",
    program: "Basketball",
    season: "2024-2025",
  });
  const [headers, setHeaders] = useState<HeaderDefinition[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, { total: number; present: number }>>({});
  const [currentProgramId, setCurrentProgramId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize user
  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    initUser();
  }, []);

  // Load or create program based on current context
  useEffect(() => {
    if (!userId) return;
    
    const loadOrCreateProgram = async () => {
      try {
        // Try to find existing program
        const { data: existingProgram, error: findError } = await supabase
          .from("programs")
          .select("id")
          .eq("coach_id", userId)
          .eq("school", currentContext.school)
          .eq("sport", currentContext.program)
          .eq("season_year", currentContext.season)
          .maybeSingle();

        if (findError) throw findError;

        if (existingProgram) {
          setCurrentProgramId(existingProgram.id);
        } else {
          // Create new program for this context
          const { data: newProgram, error: insertError } = await supabase
            .from("programs")
            .insert({
              coach_id: userId,
              school: currentContext.school,
              sport: currentContext.program,
              season_year: currentContext.season,
              name: `${currentContext.program} ${currentContext.season}`,
              gender: "Mixed",
              level: "Varsity",
            })
            .select("id")
            .single();

          if (insertError) throw insertError;
          setCurrentProgramId(newProgram.id);
        }
      } catch (error) {
        console.error("Error loading/creating program:", error);
        toast.error("Failed to load program context");
      }
    };

    loadOrCreateProgram();
  }, [currentContext, userId]);

  // Load headers when program changes
  useEffect(() => {
    if (!currentProgramId || !userId) return;

    const loadHeaders = async () => {
      try {
        const { data: customHeaders, error } = await supabase
          .from("ledger_headers")
          .select("*")
          .eq("program_id", currentProgramId)
          .eq("coach_id", userId);

        if (error) throw error;

        // Combine hardwired headers with custom headers from database
        const dbHeaders: HeaderDefinition[] = (customHeaders || []).map(h => ({
          id: h.header_id,
          label: h.label,
          isHardwired: h.is_hardwired
        }));

        // Check if we have any headers in DB, if not, add defaults
        if (dbHeaders.length === 0) {
          // Insert default headers for new program
          const defaultsToInsert = DEFAULT_HEADERS.map(h => ({
            program_id: currentProgramId,
            coach_id: userId,
            header_id: h.id,
            label: h.label,
            is_hardwired: h.isHardwired
          }));

          const { error: insertError } = await supabase
            .from("ledger_headers")
            .insert(defaultsToInsert);

          if (insertError) throw insertError;

          setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS]);
        } else {
          setHeaders([...HARDWIRED_HEADERS, ...dbHeaders.filter(h => !h.isHardwired)]);
        }
      } catch (error) {
        console.error("Error loading headers:", error);
        setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS]);
      }
    };

    loadHeaders();
  }, [currentProgramId, userId]);

  // Load athletes and attendance when program changes
  useEffect(() => {
    if (!currentProgramId || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load athletes
        const { data: athletesData, error: athletesError } = await supabase
          .from("athletes")
          .select("*")
          .eq("coach_id", userId)
          .eq("program_id", currentProgramId)
          .order("name");

        if (athletesError) throw athletesError;

        setAthletes(athletesData || []);

        // Load attendance data for each athlete
        if (athletesData && athletesData.length > 0) {
          const athleteIds = athletesData.map(a => a.id);
          
          const { data: attendanceRecords, error: attendanceError } = await supabase
            .from("attendance")
            .select("athlete_id, status")
            .in("athlete_id", athleteIds)
            .eq("coach_id", userId);

          if (attendanceError) throw attendanceError;

          // Calculate attendance rates
          const attendanceMap: Record<string, { total: number; present: number }> = {};
          
          athleteIds.forEach(id => {
            attendanceMap[id] = { total: 0, present: 0 };
          });

          (attendanceRecords || []).forEach(record => {
            if (attendanceMap[record.athlete_id]) {
              attendanceMap[record.athlete_id].total++;
              if (record.status === "Present") {
                attendanceMap[record.athlete_id].present++;
              }
            }
          });

          setAttendanceData(attendanceMap);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentProgramId, userId]);

  const refreshAthletes = async () => {
    if (!currentProgramId || !userId) return;

    try {
      const { data: athletesData, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("coach_id", userId)
        .eq("program_id", currentProgramId)
        .order("name");

      if (error) throw error;
      setAthletes(athletesData || []);

      // Refresh attendance data
      if (athletesData && athletesData.length > 0) {
        const athleteIds = athletesData.map(a => a.id);
        
        const { data: attendanceRecords, error: attendanceError } = await supabase
          .from("attendance")
          .select("athlete_id, status")
          .in("athlete_id", athleteIds)
          .eq("coach_id", userId);

        if (attendanceError) throw attendanceError;

        const attendanceMap: Record<string, { total: number; present: number }> = {};
        
        athleteIds.forEach(id => {
          attendanceMap[id] = { total: 0, present: 0 };
        });

        (attendanceRecords || []).forEach(record => {
          if (attendanceMap[record.athlete_id]) {
            attendanceMap[record.athlete_id].total++;
            if (record.status === "Present") {
              attendanceMap[record.athlete_id].present++;
            }
          }
        });

        setAttendanceData(attendanceMap);
      }
    } catch (error) {
      console.error("Error refreshing athletes:", error);
    }
  };

  const addHeader = async (label: string) => {
    if (!currentProgramId || !userId) return;

    try {
      const headerId = label.toLowerCase().replace(/\s+/g, "_");
      
      const { error } = await supabase
        .from("ledger_headers")
        .insert({
          program_id: currentProgramId,
          coach_id: userId,
          header_id: headerId,
          label,
          is_hardwired: false
        });

      if (error) throw error;

      const newHeader: HeaderDefinition = {
        id: headerId,
        label,
        isHardwired: false
      };

      setHeaders(prev => [...prev, newHeader]);
      toast.success(`Header "${label}" added`);
    } catch (error) {
      console.error("Error adding header:", error);
      toast.error("Failed to add header");
    }
  };

  const editHeader = async (id: string, newLabel: string) => {
    if (!currentProgramId || !userId) return;

    try {
      const { error } = await supabase
        .from("ledger_headers")
        .update({ label: newLabel })
        .eq("program_id", currentProgramId)
        .eq("header_id", id)
        .eq("coach_id", userId);

      if (error) throw error;

      setHeaders(prev =>
        prev.map(h => (h.id === id ? { ...h, label: newLabel } : h))
      );
      toast.success("Header updated");
    } catch (error) {
      console.error("Error editing header:", error);
      toast.error("Failed to update header");
    }
  };

  const deleteHeader = async (id: string) => {
    if (!currentProgramId || !userId) return;

    try {
      const { error } = await supabase
        .from("ledger_headers")
        .delete()
        .eq("program_id", currentProgramId)
        .eq("header_id", id)
        .eq("coach_id", userId);

      if (error) throw error;

      // Delete associated custom field data
      const athleteIds = athletes.map(a => a.id);
      if (athleteIds.length > 0) {
        await supabase
          .from("athlete_custom_fields")
          .delete()
          .in("athlete_id", athleteIds)
          .eq("field_id", id)
          .eq("coach_id", userId);
      }

      setHeaders(prev => prev.filter(h => h.id !== id));
      toast.success("Header deleted");
    } catch (error) {
      console.error("Error deleting header:", error);
      toast.error("Failed to delete header");
    }
  };

  const addAthlete = async (athleteData: Partial<AthleteData>) => {
    if (!currentProgramId || !userId) return;

    try {
      // Ensure gender has a valid value or null
      let genderValue = athleteData.gender || null;
      if (genderValue && !['Male', 'Female', 'Other'].includes(genderValue)) {
        genderValue = null;
      }

      const { data: newAthlete, error } = await supabase
        .from("athletes")
        .insert({
          coach_id: userId,
          program_id: currentProgramId,
          name: athleteData.name || "",
          grade: athleteData.grade || null,
          gender: genderValue,
          team_position: athleteData.team_position || null,
          events: athleteData.events || [],
          achievements: athleteData.achievements || [],
          personal_records: athleteData.personal_records || {},
          athlete_of_week: athleteData.athlete_of_week || false,
          athlete_of_meet: athleteData.athlete_of_meet || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Save custom field data
      const customFields = headers.filter(h => !h.isHardwired);
      if (customFields.length > 0 && newAthlete) {
        const customFieldInserts = customFields
          .filter(h => athleteData[h.id])
          .map(h => ({
            athlete_id: newAthlete.id,
            program_id: currentProgramId,
            coach_id: userId,
            field_id: h.id,
            field_value: String(athleteData[h.id])
          }));

        if (customFieldInserts.length > 0) {
          await supabase
            .from("athlete_custom_fields")
            .insert(customFieldInserts);
        }
      }

      await refreshAthletes();
      toast.success(`Athlete "${athleteData.name}" added`);
    } catch (error) {
      console.error("Error adding athlete:", error);
      toast.error("Failed to add athlete");
    }
  };

  const updateAthlete = async (id: string, field: string, value: any) => {
    if (!currentProgramId || !userId) return;

    try {
      const header = headers.find(h => h.id === field);
      
      if (header && !header.isHardwired) {
        // Update custom field
        const { error } = await supabase
          .from("athlete_custom_fields")
          .upsert({
            athlete_id: id,
            program_id: currentProgramId,
            coach_id: userId,
            field_id: field,
            field_value: String(value)
          }, {
            onConflict: "athlete_id,field_id"
          });

        if (error) throw error;
      } else {
        // Update standard field
        const updateData: any = {};
        updateData[field] = value;

        const { error } = await supabase
          .from("athletes")
          .update(updateData)
          .eq("id", id)
          .eq("coach_id", userId);

        if (error) throw error;
      }

      await refreshAthletes();
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast.error("Failed to update athlete");
    }
  };

  const deleteAthlete = async (id: string) => {
    if (!userId) return;

    try {
      // Delete custom fields first
      await supabase
        .from("athlete_custom_fields")
        .delete()
        .eq("athlete_id", id)
        .eq("coach_id", userId);

      // Delete athlete
      const { error } = await supabase
        .from("athletes")
        .delete()
        .eq("id", id)
        .eq("coach_id", userId);

      if (error) throw error;

      await refreshAthletes();
      toast.success("Athlete deleted");
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast.error("Failed to delete athlete");
    }
  };

  const getCustomFieldValue = (athleteId: string, fieldId: string): string => {
    // This will be loaded from custom_fields table via a separate query
    // For now, return empty string - will be enhanced
    return "";
  };

  const getAttendanceRate = (athleteId: string): string => {
    const data = attendanceData[athleteId];
    if (!data || data.total === 0) return "0%";
    const rate = Math.round((data.present / data.total) * 100);
    return `${rate}%`;
  };

  return (
    <LedgerReactContext.Provider
      value={{
        currentContext,
        setCurrentContext,
        headers,
        athletes,
        loading,
        addHeader,
        editHeader,
        deleteHeader,
        addAthlete,
        updateAthlete,
        deleteAthlete,
        refreshAthletes,
        getCustomFieldValue,
        getAttendanceRate,
      }}
    >
      {children}
    </LedgerReactContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerReactContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within LedgerProvider");
  }
  return context;
}
