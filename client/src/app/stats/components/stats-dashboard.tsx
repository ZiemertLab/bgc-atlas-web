"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Image from 'next/image';
import { getKpiData, getBgcClassesData, getGrowthData } from "@/services/api";

export function StatsDashboard() {
  const [kpiData, setKpiData] = useState([
    { title: "Total BGCs", value: "0" },
    { title: "Total GCFs", value: "0" },
    { title: "Total Samples", value: "0" },
    { title: "Total Taxa", value: "0" },
  ]);

  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpiResponse, bgcClassesResponse, growthResponse] = await Promise.all([
          getKpiData(),
          getBgcClassesData(),
          getGrowthData()
        ]);

        setKpiData(kpiResponse);
        setBarChartData(bgcClassesResponse);
        setLineChartData(growthResponse);
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

        setLineChartData([
          { year: '2020', count: 100000 },
          { year: '2021', count: 350000 },
          { year: '2022', count: 700000 },
          { year: '2023', count: 950000 },
          { year: '2024', count: 1203456 },
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

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
            <CardTitle className="font-headline">Sample Locations</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="w-full aspect-video relative rounded-lg overflow-hidden border">
                 <Image src="https://placehold.co/1200x600" alt="World map heatmap" layout="fill" objectFit="cover" data-ai-hint="world map" />
                 <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <p className="text-lg font-bold text-primary-foreground bg-primary/80 px-4 py-2 rounded">Placeholder World Map Heatmap</p>
                 </div>
            </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
            <CardTitle className="font-headline">Database Growth</CardTitle>
        </CardHeader>
        <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Total BGCs" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
