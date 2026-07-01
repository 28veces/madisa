import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type CardColor = "green" | "cyan" | "red" | "yellow" | "neutral";

const colorStyles: Record<CardColor, { card: string; icon: string; value: string }> = {
  green:   { card: "bg-green-50 border-green-200",    icon: "text-green-500",   value: "text-green-700"  },
  cyan:    { card: "bg-cyan-50 border-cyan-200",      icon: "text-cyan-500",    value: "text-cyan-700"   },
  red:     { card: "bg-red-50 border-red-200",        icon: "text-red-500",     value: "text-red-700"    },
  yellow:  { card: "bg-yellow-50 border-yellow-200",  icon: "text-yellow-500",  value: "text-yellow-700" },
  neutral: { card: "",                                icon: "text-gray-400",    value: "text-gray-900"   },
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: CardColor;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "neutral",
  className,
}: MetricCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className={cn(styles.card, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", styles.icon)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", styles.value)}>{value}</div>
        {subtitle && (
          <p
            className={cn(
              "text-xs mt-1",
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
            )}
          >
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
