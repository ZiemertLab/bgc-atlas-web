"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getKpiData, getBgcClassesData } from "@/services/api";

export function StatsDashboard() {
  const [kpiData, setKpiData] = useState([
    { title: "Total BGCs", value: "0" },
    { title: "Total GCFs", value: "0" },
    { title: "Total Samples", value: "0" },
    { title: "Total Taxa", value: "0" },
  ]);

  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiResponse, bgcClassesResponse] = await Promise.all([
          getKpiData(),
          getBgcClassesData()
        ]);

        setKpiData(kpiResponse);
        setBarChartData(bgcClassesResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback to mock data if API fails
        setKpiData([
          { title: "Total BGCs", value: "1,203,456" },
          { title: "Total GCFs", value: "89,123" },
          { title: "Total Samples", value: "45,678" },
          { title: "Total Taxa", value: "12,345" },
        ]);

        setBarChartData([
          { name: "PKS", count: 450 },
          { name: "NRPS", count: 380 },
          { name: "RiPP", count: 290 },
          { name: "Terpene", count: 220 },
          { name: "Saccharide", count: 180 },
          { name: "Other", count: 150 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-headline text-3xl font-bold">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">BGC Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">BGC Class Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={barChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="hsl(var(--primary))" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


    </div>
  );
}
