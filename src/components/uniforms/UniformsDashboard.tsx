import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ShirtIcon, Package, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();

    // Set up realtime subscription
    const channel = supabase
      .channel('uniforms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uniforms'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [uniformsRes, athletesRes] = await Promise.all([
        supabase.from("uniforms").select("*").order("top_id"),
        supabase.from("athletes").select("id, name").order("name"),
      ]);

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
    lost: uniforms.filter(u => u.status === "Lost").length,
  };

  // Calculate uniforms per athlete for bar chart
  const athleteUniformCounts = athletes.map(athlete => {
    const count = uniforms.filter(u => 
      u.athlete_id === athlete.id && u.status === "Checked Out"
    ).length;
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

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
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
        <CardHeader>
          <CardTitle>Uniforms Checked Out by Athlete</CardTitle>
          <CardDescription>
            Current distribution of checked out uniforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {athleteUniformCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={athleteUniformCounts}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  name="Uniforms Checked Out"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No uniforms currently checked out
            </div>
          )}
        </CardContent>
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
              {uniforms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No uniforms found
                  </TableCell>
                </TableRow>
              ) : (
                uniforms.map((uniform) => (
                  <TableRow 
                    key={uniform.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate('/uniforms')}
                  >
                    <TableCell className="font-medium">{uniform.top_id}</TableCell>
                    <TableCell className="font-medium">{uniform.bottom_id}</TableCell>
                    <TableCell>
                      {uniform.assigned_to || (
                        <span className="text-muted-foreground italic">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(uniform.status)}>
                        {uniform.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
