import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { sanitizeSelectValue } from "@/lib/utils";
import { LockKeyhole, Plus } from "lucide-react";

interface AssignLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string;
  athleteName: string;
  onSuccess?: () => void;
}

interface Locker {
  id: string;
  locker_number: string;
  combination: string | null;
  status: string;
}

export default function AssignLockerModal({
  isOpen,
  onClose,
  athleteId,
  athleteName,
  onSuccess,
}: AssignLockerModalProps) {
  const [availableLockers, setAvailableLockers] = useState<Locker[]>([]);
  const [currentLocker, setCurrentLocker] = useState<Locker | null>(null);
  const [selectedLockerId, setSelectedLockerId] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quickCreateForm, setQuickCreateForm] = useState({
    locker_number: "",
    combination: "",
    location: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchLockers();
    }
  }, [isOpen, athleteId]);

  const fetchLockers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current locker for this athlete
      const { data: currentData } = await supabase
        .from("lockers")
        .select("*")
        .eq("athlete_id", athleteId)
        .maybeSingle();

      setCurrentLocker(currentData || null);

      // Fetch available lockers
      const { data: availableData } = await supabase
        .from("lockers")
        .select("*")
        .eq("coach_id", user.id)
        .eq("status", "Available")
        .order("locker_number");

      setAvailableLockers(availableData || []);
    } catch (error: any) {
      console.error("Error fetching lockers:", error);
    }
  };

  const handleUnassignCurrent = async () => {
    if (!currentLocker) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("lockers")
        .update({
          athlete_id: null,
          status: "Available",
        })
        .eq("id", currentLocker.id)
        .eq("coach_id", user.id);

      if (error) throw error;

      toast.success("Locker unassigned");
      setCurrentLocker(null);
      fetchLockers();
    } catch (error: any) {
      toast.error(error.message || "Failed to unassign locker");
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateForm.locker_number) {
      toast.error("Locker number is required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lockers")
        .insert({
          coach_id: user.id,
          locker_number: quickCreateForm.locker_number,
          combination: quickCreateForm.combination || null,
          location: quickCreateForm.location || null,
          status: "Available",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast.error("This locker number already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Locker created");
      setSelectedLockerId(data.id);
      setShowQuickCreate(false);
      setQuickCreateForm({ locker_number: "", combination: "", location: "" });
      fetchLockers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create locker");
    }
  };

  const handleAssign = async () => {
    if (!selectedLockerId) {
      toast.error("Please select a locker");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // If athlete already has a locker, unassign it first
      if (currentLocker) {
        await handleUnassignCurrent();
      }

      const { error } = await supabase
        .from("lockers")
        .update({
          athlete_id: athleteId,
          status: "Assigned",
        })
        .eq("id", selectedLockerId)
        .eq("coach_id", user.id);

      if (error) {
        if (error.code === "23505") {
          toast.error("This locker is already assigned. Please refresh and try again.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Locker assigned successfully");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to assign locker");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedLockerId("");
    setShowQuickCreate(false);
    setQuickCreateForm({ locker_number: "", combination: "", location: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockKeyhole className="w-5 h-5" />
            Assign Locker
          </DialogTitle>
          <DialogDescription>
            Assign a locker to {athleteName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current locker info */}
          {currentLocker && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Currently assigned:</div>
                  <div className="text-sm">
                    Locker #{currentLocker.locker_number}
                    {currentLocker.combination && (
                      <span className="text-muted-foreground ml-2">
                        ({currentLocker.combination})
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnassignCurrent}
                >
                  Unassign
                </Button>
              </div>
            </div>
          )}

          {/* Select existing locker */}
          <div>
            <Label htmlFor="locker_select">Select Locker</Label>
            <Select 
              value={sanitizeSelectValue(selectedLockerId)} 
              onValueChange={setSelectedLockerId}
            >
              <SelectTrigger id="locker_select">
                <SelectValue placeholder="Choose an available locker" />
              </SelectTrigger>
              <SelectContent>
                {availableLockers.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No available lockers
                  </div>
                ) : (
                  availableLockers.map((locker) => (
                    <SelectItem key={locker.id} value={locker.id}>
                      Locker #{locker.locker_number}
                      {locker.combination && ` (${locker.combination})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Quick create toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Don't see the locker you need?
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickCreate(!showQuickCreate)}
            >
              <Plus className="w-4 h-4 mr-1" />
              {showQuickCreate ? "Cancel" : "Quick Create"}
            </Button>
          </div>

          {/* Quick create form */}
          {showQuickCreate && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-md">
              <div>
                <Label htmlFor="quick_locker_number">Locker Number *</Label>
                <Input
                  id="quick_locker_number"
                  value={quickCreateForm.locker_number}
                  onChange={(e) =>
                    setQuickCreateForm({ ...quickCreateForm, locker_number: e.target.value })
                  }
                  placeholder="e.g., 101"
                />
              </div>
              <div>
                <Label htmlFor="quick_combination">Combination</Label>
                <Input
                  id="quick_combination"
                  value={quickCreateForm.combination}
                  onChange={(e) =>
                    setQuickCreateForm({ ...quickCreateForm, combination: e.target.value })
                  }
                  placeholder="e.g., 12-34-56"
                />
              </div>
              <div>
                <Label htmlFor="quick_location">Location</Label>
                <Input
                  id="quick_location"
                  value={quickCreateForm.location}
                  onChange={(e) =>
                    setQuickCreateForm({ ...quickCreateForm, location: e.target.value })
                  }
                  placeholder="e.g., Boys Locker Room"
                />
              </div>
              <Button
                onClick={handleQuickCreate}
                disabled={!quickCreateForm.locker_number}
                className="w-full"
                size="sm"
              >
                Create & Select
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedLockerId || loading}
            >
              {loading ? "Assigning..." : "Assign Locker"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
