import { useMemo } from "react";
import { useGetSurveyResults } from "@workspace/api-client-react";
import type { TooltipProps } from "recharts";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Modern dark-theme compatible color palette
const COLORS = [
  "hsl(350, 85%, 42%)", // Primary Red
  "hsl(0, 0%, 85%)",    // Light Gray
  "hsl(0, 0%, 50%)",    // Mid Gray
  "hsl(350, 60%, 60%)", // Lighter Red
  "hsl(0, 0%, 30%)",    // Dark Gray
  "hsl(350, 90%, 25%)", // Deep Red
  "hsl(0, 0%, 70%)",    // Gray
  "hsl(350, 40%, 40%)", // Muted Red
];

// Helper to convert Record<string, number> to Recharts array format
function formatData(data: Record<string, number> = {}) {
  return Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort descending
}

export function Results() {
  const { data: results, isLoading, isError } = useGetSurveyResults();

  const formattedData = useMemo(() => {
    if (!results) return null;
    return {
      state: formatData(results.byState).slice(0, 10), // Top 10 states
      gender: formatData(results.byGender),
      nflTeam: formatData(results.byNflTeam).slice(0, 10), // Top 10 NFL
      collegeTeam: formatData(results.byCollegeTeam).slice(0, 10), // Top 10 College
      preference: formatData(results.byFootballPreference),
      watchFrequency: formatData(results.byWatchFrequency),
      attendsInPerson: formatData(results.byAttendsInPerson),
      position: formatData(results.byFavoritePosition),
    };
  }, [results]);

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-10 px-4 md:px-6 mx-auto space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !results || !formattedData) {
    return (
      <div className="container max-w-4xl py-20 px-4 text-center mx-auto">
        <h2 className="text-3xl font-bold text-destructive mb-4">Failed to load results</h2>
        <p className="text-muted-foreground">Unable to connect to the live scoreboard. Please try again later.</p>
      </div>
    );
  }

  const ChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-popover-foreground">{payload[0].name}</p>
          <p className="text-primary font-bold">{payload[0].value} votes</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container max-w-7xl py-10 px-4 md:px-6 mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            Live <span className="text-primary">Scoreboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Aggregated preferences from football fans nationwide.
          </p>
        </div>
        <div className="bg-card border border-border px-6 py-4 rounded-xl shadow-lg flex flex-col items-center">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Responses</span>
          <span className="text-4xl font-black text-primary font-mono">{results.totalResponses.toLocaleString()}</span>
        </div>
      </div>

      {results.totalResponses === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <h3 className="text-2xl font-bold mb-2">No data yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to put points on the board.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Football Preference - Pie */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>College vs. NFL</CardTitle>
              <CardDescription>Overall league preference</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData.preference}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {formattedData.preference.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top NFL Teams - Bar */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Top NFL Teams</CardTitle>
              <CardDescription>Most supported professional franchises</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData.nflTeam} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    tickFormatter={(val) => val.split(' ').pop() || val}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top College Teams - Bar */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Top College Teams</CardTitle>
              <CardDescription>Most supported collegiate programs</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData.collegeTeam} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Watch Frequency - Pie */}
          <Card className="col-span-1 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Watch Frequency</CardTitle>
              <CardDescription>How often fans tune in</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData.watchFrequency}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {formattedData.watchFrequency.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top States - Bar */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Top States</CardTitle>
              <CardDescription>Where fans are watching from</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData.state} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Favorite Position - Bar */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Favorite Position</CardTitle>
              <CardDescription>Most entertaining to watch</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData.position} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attends in Person - Pie */}
          <Card className="col-span-1 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Game Attendance</CardTitle>
              <CardDescription>Fans attending in person</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData.attendsInPerson}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {formattedData.attendsInPerson.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gender - Pie */}
          <Card className="col-span-1 shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle>Demographics</CardTitle>
              <CardDescription>Gender breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedData.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {formattedData.gender.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
