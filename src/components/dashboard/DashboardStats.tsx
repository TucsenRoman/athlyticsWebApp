import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, Calendar, TrendingUp } from "lucide-react";

export default function DashboardStats() {
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count } = await supabase
        .from("athletes")
        .select("*", { count: "exact", head: true });

      setTotalAthletes(count || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Athletes",
      value: totalAthletes,
      icon: Users,
      color: "from-primary to-primary/80",
    },
    {
      title: "Upcoming Meets",
      value: 0,
      icon: Calendar,
      color: "from-secondary to-secondary/80",
    },
    {
      title: "Awards This Season",
      value: 0,
      icon: Trophy,
      color: "from-accent to-accent/80",
    },
    {
      title: "Average PR Improvement",
      value: "0%",
      icon: TrendingUp,
      color: "from-primary to-accent",
    },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading stats...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {index === 0 && "Currently registered"}
              {index === 1 && "Next 30 days"}
              {index === 2 && "Team recognition"}
              {index === 3 && "Season progress"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}