"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
	weight: {
		label: "Weight",
		color: "var(--chart-1)",
	},
	calories: {
		label: "Calories",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

interface HealthMetricsChartProps {
	data: Array<{
		date: string;
		weight: number;
		calories: number;
	}>;
}

export function HealthMetricsChart({ data }: HealthMetricsChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className="h-[300px] w-full"
		>
			<LineChart
				data={data}
				accessibilityLayer
			>
				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
				/>
				<YAxis
					tickLine={false}
					axisLine={false}
					tickMargin={8}
				/>
				<ChartTooltip content={<ChartTooltipContent />} />
				<Line
					type="monotone"
					dataKey="weight"
					stroke="var(--color-weight)"
					strokeWidth={2}
					activeDot={{ r: 8 }}
				/>
				<Line
					type="monotone"
					dataKey="calories"
					stroke="var(--color-calories)"
					strokeWidth={2}
					activeDot={{ r: 8 }}
				/>
				<ChartLegend content={<ChartLegendContent />} />
			</LineChart>
		</ChartContainer>
	);
}
