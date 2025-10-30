import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLedger } from "@/contexts/LedgerContext";

export default function ManagementView() {
  const { headers, athletes, loading, getCustomFieldValue } = useLedger();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(["name", "gender", "grade"]);

  const filteredAthletes = athletes.filter(athlete =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchedAthlete = searchQuery && filteredAthletes.length === 1 ? filteredAthletes[0] : null;

  const toggleHeader = (headerId: string) => {
    setSelectedHeaders(prev =>
      prev.includes(headerId)
        ? prev.filter(h => h !== headerId)
        : [...prev, headerId]
    );
  };

  const renderCellValue = (athlete: any, headerId: string) => {
    const header = headers.find(h => h.id === headerId);
    const isCustomOrSpecial = headerId === "attendance_rate" || (header && !header.isHardwired);
    
    if (isCustomOrSpecial) {
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
          <Input
            type="text"
            placeholder="Search athletes by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground">Visible Columns:</span>
            {headers.map((header) => (
              <Button
                key={header.id}
                variant={selectedHeaders.includes(header.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleHeader(header.id)}
              >
                {header.label}
              </Button>
            ))}
          </div>

          {searchedAthlete ? (
            <Card className="bg-muted/50">
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
                        <p className="text-sm font-medium text-muted-foreground">{header.label}</p>
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
                          return header ? <TableHead key={headerId}>{header.label}</TableHead> : null;
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
