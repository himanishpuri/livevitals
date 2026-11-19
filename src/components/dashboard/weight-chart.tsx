"use client";

import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
	weight: {
		label: "Weight",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

interface WeightChartProps {
	data: Array<{
		date: string;
		weight: number;
	}>;
}

export function WeightChart({ data }: WeightChartProps) {
	return (
		<ChartContainer
			config={chartConfig}
			className="h-[300px] w-full"
		>
			<AreaChart
				data={data}
				margin={{
					top: 10,
					right: 30,
					left: 0,
					bottom: 0,
				}}
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
					tickFormatter={(value) => `${value} kg`}
					domain={["dataMin - 2", "dataMax + 2"]}
				/>
				<ChartTooltip
					content={<ChartTooltipContent labelKey="weight" />}
				/>
				<Area
					type="monotone"
					dataKey="weight"
					stroke="var(--color-weight)"
					fill="var(--color-weight)"
					fillOpacity={0.3}
				/>
			</AreaChart>
		</ChartContainer>
	);
}
