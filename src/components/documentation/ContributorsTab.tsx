
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Contributor } from "@/services/githubService";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { Users } from "lucide-react";

interface ContributorsTabProps {
  contributors: Contributor[] | null;
  isLoading: boolean;
}

export function ContributorsTab({ contributors, isLoading }: ContributorsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-60 bg-muted rounded"></div>
          <div className="h-60 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Contributors</h2>
        <p className="text-muted-foreground mt-2">
          No contributor data available. Please ensure the repository is accessible.
        </p>
      </div>
    );
  }
  
  // Sort contributors by contributions (descending)
  const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);
  
  // Prepare data for pie chart
  const prepareContributionData = () => {
    const topContributors = sortedContributors.slice(0, 5);
    
    // Calculate contributions from others
    const othersContributions = sortedContributors.slice(5).reduce((sum, c) => sum + c.contributions, 0);
    
    const data = topContributors.map(c => ({
      name: c.login,
      value: c.contributions
    }));
    
    // Add "Others" segment if there are more than 5 contributors
    if (sortedContributors.length > 5) {
      data.push({
        name: 'Others',
        value: othersContributions
      });
    }
    
    return data;
  };
  
  const contributionData = prepareContributionData();
  
  // Colors for pie chart segments
  const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#6b7280'];
  
  // Calculate contribution statistics
  const totalContributions = sortedContributors.reduce((sum, c) => sum + c.contributions, 0);
  const avgContributions = Math.round(totalContributions / sortedContributors.length);
  const topContributor = sortedContributors[0];
  const topContributionPercentage = Math.round((topContributor.contributions / totalContributions) * 100);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contributors</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Contribution Distribution
            </CardTitle>
            <CardDescription>
              How contributions are distributed across contributors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  contributor1: { color: COLORS[0] },
                  contributor2: { color: COLORS[1] },
                  contributor3: { color: COLORS[2] },
                  contributor4: { color: COLORS[3] },
                  contributor5: { color: COLORS[4] },
                  others: { color: COLORS[5] },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {contributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent
                              indicator="dot"
                              labelKey="name"
                              payload={payload as any}
                            />
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Contributors</div>
                <div className="text-2xl font-bold">{contributors.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Commits</div>
                <div className="text-2xl font-bold">{totalContributions}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Avg. Commits</div>
                <div className="text-2xl font-bold">{avgContributions}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Top Contributor</div>
                <div className="text-2xl font-bold">{topContributionPercentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>
              Based on number of contributions to the repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[320px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead className="w-[100px]">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContributors.slice(0, 10).map(contributor => (
                    <TableRow key={contributor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <img
                            src={contributor.avatar_url}
                            alt={contributor.login}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          {contributor.login}
                        </div>
                      </TableCell>
                      <TableCell>{contributor.contributions}</TableCell>
                      <TableCell>
                        {Math.round((contributor.contributions / totalContributions) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
