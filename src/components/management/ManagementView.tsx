import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLedger } from "@/contexts/LedgerContext";
import { ChevronDown, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagementView() {
  const { headers, athletes, loading, getCustomFieldValue, getAttendanceRate } = useLedger();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(["name", "gender", "grade"]);

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchedAthlete = searchQuery && filteredAthletes.length === 1 ? filteredAthletes[0] : null;

  const toggleHeader = (headerId: string) => {
    setSelectedHeaders(prev => {
      const newHeaders = prev.includes(headerId)
        ? prev.filter(h => h !== headerId)
        : [...prev, headerId];
      
      // Enforce at least "name" header
      if (newHeaders.length === 0 || !newHeaders.includes("name")) {
        return ["name"];
      }
      
      return newHeaders;
    });
  };

  const renderCellValue = (athlete: any, headerId: string) => {
    // Special handling for attendance_rate
    if (headerId === "attendance_rate") {
      return getAttendanceRate(athlete.id);
    }

    // Check if it's a custom field
    const header = headers.find(h => h.id === headerId);
    const isCustom = header && !header.isHardwired;
    
    if (isCustom) {
      const value = getCustomFieldValue(athlete.id, headerId);
      return value || "—";
    }

    const value = athlete[headerId as keyof typeof athlete];
    
    if (Array.isArray(value)) {
      return value.join(", ") || "—";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value?.toString() || "—";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search athletes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between min-w-[200px] min-h-[44px] touch-manipulation">
                  Visible Columns ({selectedHeaders.length})
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-3 bg-popover max-h-[250px] overflow-y-auto rounded-lg" align="start">
                <div className="space-y-2">
                  <div className="text-base md:text-sm font-medium mb-3">Select Columns</div>
                  {headers.map((header) => (
                    <div key={header.id} className="flex items-center space-x-2 min-h-[44px] py-1">
                      <Checkbox
                        id={`mgmt-header-${header.id}`}
                        checked={selectedHeaders.includes(header.id)}
                        onCheckedChange={() => toggleHeader(header.id)}
                        disabled={header.id === "name" && selectedHeaders.includes("name") && selectedHeaders.length === 1}
                        className="h-5 w-5"
                      />
                      <label
                        htmlFor={`mgmt-header-${header.id}`}
                        className={cn(
                          "text-base md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1 touch-manipulation",
                          header.isHardwired && "text-muted-foreground"
                        )}
                      >
                        {header.isHardwired && <Lock className="w-3 h-3" />}
                        {header.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {searchedAthlete ? (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-2xl">{searchedAthlete.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {headers.map((header) => {
                    const value = renderCellValue(searchedAthlete, header.id);
                    if (value === "—") return null;
                    
                    return (
                      <div key={header.id} className="space-y-1">
                        <p className={cn(
                          "text-sm font-medium flex items-center gap-1",
                          header.isHardwired && "text-muted-foreground"
                        )}>
                          {header.isHardwired && <Lock className="w-3 h-3" />}
                          {header.label}
                        </p>
                        <p className="text-base">
                          {header.id === "athlete_of_week" || header.id === "athlete_of_meet" ? (
                            <Badge variant={value === "Yes" ? "default" : "outline"}>
                              {value}
                            </Badge>
                          ) : (
                            value
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredAthletes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No athletes found matching your search." : "No athletes available."}
                </div>
              ) : (
                <div className="border rounded-lg overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {selectedHeaders.map((headerId) => {
                          const header = headers.find((h) => h.id === headerId);
                          return header ? (
                            <TableHead key={headerId} className={cn(
                              header.isHardwired && "bg-muted/30"
                            )}>
                              <div className="flex items-center gap-1">
                                {header.isHardwired && <Lock className="w-3 h-3 text-muted-foreground" />}
                                {header.label}
                              </div>
                            </TableHead>
                          ) : null;
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAthletes.map((athlete) => (
                        <TableRow key={athlete.id}>
                          {selectedHeaders.map((headerId) => (
                            <TableCell key={`${athlete.id}-${headerId}`}>
                              {renderCellValue(athlete, headerId)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
