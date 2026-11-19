"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
	consumed: {
		label: "Consumed",
		color: "var(--chart-1)",
	},
	target: {
		label: "Target",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

interface CalorieGoalChartProps {
	data: Array<{
		day: string;
		consumed: number;
		target: number;
	}>;
}

export function CalorieGoalChart({ data }: CalorieGoalChartProps) {
	return (
		<ChartContainer config={chartConfig} className="h-[300px] w-full">
			<BarChart data={data} accessibilityLayer>
				<XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
				<YAxis
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					tickFormatter={(value) => `${value} kcal`}
				/>
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar
					dataKey="consumed"
					fill="var(--color-consumed)"
					radius={[4, 4, 0, 0]}
				/>
				<Bar
					dataKey="target"
					fill="var(--color-target)"
					radius={[4, 4, 0, 0]}
				/>
				<ChartLegend content={<ChartLegendContent />} />
			</BarChart>
		</ChartContainer>
	);
}
