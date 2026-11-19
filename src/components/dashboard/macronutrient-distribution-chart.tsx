"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
	Protein: {
		label: "Protein",
		color: "var(--chart-1)",
	},
	Carbs: {
		label: "Carbs",
		color: "var(--chart-2)",
	},
	Fat: {
		label: "Fat",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

interface MacronutrientDistributionChartProps {
	data: {
		protein: number;
		carbs: number;
		fat: number;
	};
}

export function MacronutrientDistributionChart({
	data,
}: MacronutrientDistributionChartProps) {
	const chartData = [
		{ name: "Protein", value: data.protein },
		{ name: "Carbs", value: data.carbs },
		{ name: "Fat", value: data.fat },
	];

	return (
		<ChartContainer config={chartConfig} className="h-[300px] w-full">
			<PieChart accessibilityLayer>
				<Pie
					data={chartData}
					cx="50%"
					cy="50%"
					labelLine={false}
					outerRadius={100}
					dataKey="value"
					nameKey="name"
					label={({ name, percent }) =>
						`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
					}
				>
					{chartData.map((entry) => (
						<Cell
							key={`cell-${entry.name}`}
							fill={`var(--color-${entry.name})`}
						/>
					))}
				</Pie>
				<ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
				<ChartLegend content={<ChartLegendContent nameKey="name" />} />
			</PieChart>
		</ChartContainer>
	);
}
