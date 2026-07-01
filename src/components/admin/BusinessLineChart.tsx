"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessLineChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ["#0d9488", "#f97316", "#06b6d4", "#8b5cf6"];

export default function BusinessLineChart({ data }: BusinessLineChartProps) {
  const businessLineLabels: Record<string, string> = {
    PERSONALIZACION: "Personalización",
    ARREGLOS: "Arreglos",
    IMPRESIONES: "Impresiones",
    OTRO: "Otro",
  };

  const formattedData = data.map((item) => ({
    ...item,
    name: businessLineLabels[item.name] || item.name,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribución por rama</CardTitle>
      </CardHeader>
      <CardContent>
        {formattedData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin datos disponibles</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {formattedData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
