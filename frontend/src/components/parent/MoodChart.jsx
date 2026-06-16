import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MOOD_EMOJI = { 1: "😣", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };

export default function MoodChart({ data }) {
  // data: [{ date: 'YYYY-MM-DD', mood: 1..5 }]
  const chartData = data.map((d) => ({
    label: d.date.slice(5), // MM-DD
    mood: d.mood,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94A3B8", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tickFormatter={(v) => MOOD_EMOJI[v] || v}
          tick={{ fontSize: 16 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(26,26,46,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#F8FAFC",
          }}
          formatter={(v) => [`${MOOD_EMOJI[v]} ${v}/5`, "Настроение"]}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stroke="#8B5CF6"
          strokeWidth={3}
          fill="url(#moodGrad)"
          dot={{ fill: "#06B6D4", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
