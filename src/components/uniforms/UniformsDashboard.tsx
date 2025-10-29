import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ShirtIcon, Package, CheckCircle, XCircle, AlertCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface Uniform {
  id: string;
  top_id: string;
  bottom_id: string;
  assigned_to: string | null;
  athlete_id: string | null;
  status: string;
}
interface Athlete {
  id: string;
  name: string;
}
export default function UniformsDashboard() {
  const [uniforms, setUniforms] = useState<Uniform[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();

    // Set up realtime subscription
    const channel = supabase.channel('uniforms-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'uniforms'
    }, () => {
      fetchData();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchData = async () => {
    try {
      const [uniformsRes, athletesRes] = await Promise.all([supabase.from("uniforms").select("*").order("top_id"), supabase.from("athletes").select("id, name").order("name")]);
      if (uniformsRes.error) throw uniformsRes.error;
      if (athletesRes.error) throw athletesRes.error;
      setUniforms(uniformsRes.data || []);
      setAthletes(athletesRes.data || []);
    } catch (error: any) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };
  const stats = {
    total: uniforms.length,
    checkedOut: uniforms.filter(u => u.status === "Checked Out").length,
    returned: uniforms.filter(u => u.status === "Returned").length,
    lost: uniforms.filter(u => u.status === "Lost").length
  };

  // Calculate uniforms per athlete for bar chart
  const athleteUniformCounts = athletes.map(athlete => {
    const count = uniforms.filter(u => u.athlete_id === athlete.id && u.status === "Checked Out").length;
    return {
      name: athlete.name,
      count: count
    };
  }).filter(item => item.count > 0); // Only show athletes with checked out uniforms

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Checked Out":
        return "default";
      case "Returned":
        return "secondary";
      case "Lost":
        return "destructive";
      default:
        return "outline";
    }
  };
  const filteredUniforms = statusFilter === "all" 
    ? uniforms 
    : uniforms.filter(u => u.status === statusFilter);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }
  
  return <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
            className="touch-manipulation"
          >
            All
          </Button>
          <Button
            variant={statusFilter === "Checked Out" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Checked Out")}
            className="touch-manipulation"
          >
            <ShirtIcon className="w-4 h-4 mr-1" />
            Checked Out
          </Button>
          <Button
            variant={statusFilter === "Returned" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Returned")}
            className="touch-manipulation"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Returned
          </Button>
          <Button
            variant={statusFilter === "Lost" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("Lost")}
            className="touch-manipulation"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Lost
          </Button>
        </div>
        <Button
          onClick={() => navigate('/uniforms')}
          variant="default"
          size="sm"
          className="gap-2 touch-manipulation"
        >
          <Settings className="w-4 h-4" />
          Manage Uniforms
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uniforms</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <ShirtIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedOut}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returned}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lost}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        
        
      </Card>

      {/* Quick Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShirtIcon className="w-5 h-5" />
            All Uniforms
          </CardTitle>
          <CardDescription>
            Click any row to view full details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Top ID</TableHead>
                <TableHead>Bottom ID</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUniforms.length === 0 ? <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No uniforms found
                  </TableCell>
                </TableRow> : filteredUniforms.map(uniform => <TableRow key={uniform.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate('/uniforms')}>
                    <TableCell className="font-medium">{uniform.top_id}</TableCell>
                    <TableCell className="font-medium">{uniform.bottom_id}</TableCell>
                    <TableCell>
                      {uniform.assigned_to || <span className="text-muted-foreground italic">Not assigned</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(uniform.status)}>
                        {uniform.status}
                      </Badge>
                    </TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>;
}