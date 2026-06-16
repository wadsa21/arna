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
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#A3A3A3" stopOpacity={0.04} />
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
            background: "rgba(10,10,10,0.96)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 8,
            color: "#F5F5F5",
          }}
          formatter={(v) => [`${MOOD_EMOJI[v]} ${v}/5`, "Настроение"]}
        />
        <Area
          type="monotone"
          dataKey="mood"
          stroke="#FFFFFF"
          strokeWidth={3}
          fill="url(#moodGrad)"
          dot={{ fill: "#FFFFFF", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
