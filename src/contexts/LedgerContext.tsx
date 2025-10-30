import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  [key: string]: any; // For custom fields
}

interface LedgerContextType {
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

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

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

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [headers, setHeaders] = useState<HeaderDefinition[]>([]);
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Record<string, { total: number; present: number }>>({});

  // Initialize headers from localStorage or defaults
  useEffect(() => {
    const stored = localStorage.getItem("ledger_headers");
    if (stored) {
      try {
        const customHeaders = JSON.parse(stored);
        setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS, ...customHeaders]);
      } catch {
        setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS]);
      }
    } else {
      setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS]);
    }
  }, []);

  // Fetch athletes on mount
  useEffect(() => {
    refreshAthletes();
  }, []);

  const refreshAthletes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch athletes
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("coach_id", user.id)
        .order("name");

      if (error) throw error;
      setAthletes(data || []);

      // Fetch attendance data
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance")
        .select("athlete_id, status")
        .eq("coach_id", user.id);

      if (attendanceError) throw attendanceError;

      // Calculate attendance rates
      const attendanceMap: Record<string, { total: number; present: number }> = {};
      attendanceRecords?.forEach((record) => {
        if (!attendanceMap[record.athlete_id]) {
          attendanceMap[record.athlete_id] = { total: 0, present: 0 };
        }
        attendanceMap[record.athlete_id].total++;
        if (record.status === "Present") {
          attendanceMap[record.athlete_id].present++;
        }
      });

      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      toast.error("Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const addHeader = (label: string) => {
    const headerId = label.toLowerCase().replace(/\s+/g, "_");
    
    if (headers.some(h => h.id === headerId)) {
      toast.error("A header with this name already exists");
      return;
    }

    const newHeader: HeaderDefinition = {
      id: headerId,
      label: label.trim(),
      isHardwired: false,
    };

    const customHeaders = headers.filter(h => !h.isHardwired && !DEFAULT_HEADERS.some(dh => dh.id === h.id));
    const updatedCustomHeaders = [...customHeaders, newHeader];
    
    setHeaders([...HARDWIRED_HEADERS, ...DEFAULT_HEADERS, ...updatedCustomHeaders]);
    localStorage.setItem("ledger_headers", JSON.stringify(updatedCustomHeaders));
    
    toast.success(`Header "${label}" added`);
  };

  const editHeader = (id: string, newLabel: string) => {
    const header = headers.find(h => h.id === id);
    if (!header || header.isHardwired) {
      toast.error("Cannot edit hardwired headers");
      return;
    }

    const updatedHeaders = headers.map(h =>
      h.id === id ? { ...h, label: newLabel.trim() } : h
    );

    setHeaders(updatedHeaders);
    
    const customHeaders = updatedHeaders.filter(h => !h.isHardwired && !DEFAULT_HEADERS.some(dh => dh.id === h.id));
    localStorage.setItem("ledger_headers", JSON.stringify(customHeaders));
    
    toast.success("Header updated");
  };

  const deleteHeader = (id: string) => {
    const header = headers.find(h => h.id === id);
    if (!header || header.isHardwired) {
      toast.error("Cannot delete hardwired headers");
      return;
    }

    const updatedHeaders = headers.filter(h => h.id !== id);
    setHeaders(updatedHeaders);
    
    const customHeaders = updatedHeaders.filter(h => !h.isHardwired && !DEFAULT_HEADERS.some(dh => dh.id === h.id));
    localStorage.setItem("ledger_headers", JSON.stringify(customHeaders));

    // Clear custom field data for all athletes
    athletes.forEach(athlete => {
      const key = `athlete_${athlete.id}_custom`;
      const existing = localStorage.getItem(key);
      if (existing) {
        try {
          const data = JSON.parse(existing);
          delete data[id];
          localStorage.setItem(key, JSON.stringify(data));
        } catch {}
      }
    });
    
    toast.success("Header deleted");
  };

  const addAthlete = async (athleteData: Partial<AthleteData>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("athletes")
        .insert({
          name: athleteData.name || "New Athlete",
          coach_id: user.id,
          grade: athleteData.grade || null,
          gender: athleteData.gender || null,
          team_position: athleteData.team_position || "None",
          events: athleteData.events || [],
          achievements: athleteData.achievements || [],
          personal_records: athleteData.personal_records || {},
          athlete_of_week: athleteData.athlete_of_week || false,
          athlete_of_meet: athleteData.athlete_of_meet || false,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Save custom field data if any
      const customFields = Object.keys(athleteData).filter(
        key => !HARDWIRED_HEADERS.some(h => h.id === key) && 
               !DEFAULT_HEADERS.some(h => h.id === key) &&
               key !== 'attendance_rate'
      );
      
      if (customFields.length > 0) {
        const customData: Record<string, any> = {};
        customFields.forEach(field => {
          if (athleteData[field] !== undefined) {
            customData[field] = athleteData[field];
          }
        });
        localStorage.setItem(`athlete_${data.id}_custom`, JSON.stringify(customData));
      }
      
      setAthletes([...athletes, data]);
      toast.success("Athlete added");
    } catch (error) {
      console.error("Error adding athlete:", error);
      toast.error("Failed to add athlete");
    }
  };

  const updateAthlete = async (id: string, field: string, value: any) => {
    // Check if it's a custom field
    const isCustomField = !HARDWIRED_HEADERS.some(h => h.id === field) && 
                          !DEFAULT_HEADERS.some(h => h.id === field);
    
    if (isCustomField || field === "attendance_rate") {
      // Save to localStorage for custom fields and attendance_rate
      const key = `athlete_${id}_custom`;
      const existing = localStorage.getItem(key);
      let customData = {};
      
      if (existing) {
        try {
          customData = JSON.parse(existing);
        } catch {
          customData = {};
        }
      }
      
      customData = { ...customData, [field]: value };
      localStorage.setItem(key, JSON.stringify(customData));
      
      toast.success("Updated");
      return;
    }

    // Process value based on field type
    let processedValue: any = value;
    if (field === "grade") {
      processedValue = value ? parseInt(value) : null;
    } else if (field === "events" || field === "achievements") {
      processedValue = typeof value === "string" ? value.split(",").map((s: string) => s.trim()).filter(Boolean) : value;
    } else if (field === "athlete_of_week" || field === "athlete_of_meet") {
      processedValue = value === "true" || value === true;
    }

    try {
      const { error } = await supabase
        .from("athletes")
        .update({ [field]: processedValue })
        .eq("id", id);

      if (error) throw error;

      setAthletes(athletes.map(a => 
        a.id === id ? { ...a, [field]: processedValue } : a
      ));
      
      toast.success("Updated");
    } catch (error) {
      console.error("Error updating athlete:", error);
      toast.error("Failed to update");
    }
  };

  const deleteAthlete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("athletes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAthletes(athletes.filter(a => a.id !== id));
      
      // Clean up custom data
      localStorage.removeItem(`athlete_${id}_custom`);
      
      toast.success("Athlete deleted");
    } catch (error) {
      console.error("Error deleting athlete:", error);
      toast.error("Failed to delete athlete");
    }
  };

  const getCustomFieldValue = (athleteId: string, fieldId: string): string => {
    const key = `athlete_${athleteId}_custom`;
    const existing = localStorage.getItem(key);
    if (existing) {
      try {
        const data = JSON.parse(existing);
        return data[fieldId] || "";
      } catch {
        return "";
      }
    }
    return "";
  };

  const getAttendanceRate = (athleteId: string): string => {
    const data = attendanceData[athleteId];
    if (!data || data.total === 0) return "0%";
    const rate = Math.round((data.present / data.total) * 100);
    return `${rate}%`;
  };

  return (
    <LedgerContext.Provider
      value={{
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
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error("useLedger must be used within LedgerProvider");
  }
  return context;
}
