import { useState } from "react";
import { PieChart, Pie, Sector, Tooltip } from "recharts";

/* ------------------------------------
   DATA – Better Green Variations
------------------------------------ */
const data = [
  { name: "Success", value: 400, color: "#16A34A" }, // green-600
  { name: "Panel", value: 300, color: "#059669" },   // emerald-600
  { name: "Failed", value: 300, color: "#34D399" },  // emerald-400
];

/* ------------------------------------
   ACTIVE SHAPE RENDER
------------------------------------ */
const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Center label */}
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        className="fill-gray-800 font-bold text-sm"
      >
        {payload.name}
      </text>

      {/* Main sector */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Outer glow */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 14}
        fill={fill}
      />

      {/* Pointer line */}
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={3} fill={fill} />

      {/* Value */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        className="fill-gray-800 font-semibold text-sm"
      >
        {value} requests
      </text>

      {/* Percent */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        className="fill-gray-500 text-xs"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

/* ------------------------------------
   CUSTOM TOOLTIP
------------------------------------ */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="font-semibold text-gray-800 text-sm">
          {payload[0].name}
        </p>
      </div>
      <p className="text-gray-600 text-sm">
        Requests: <span className="font-medium">{payload[0].value}</span>
      </p>
    </div>
  );
};

/* ------------------------------------
   MAIN COMPONENT
------------------------------------ */
export default function CustomActiveShapePieChart({
  isAnimationActive = true,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 ">
        <div className="flex flex-col lg:flex-row items-center gap-1">

          {/* CHART */}
          <div className="flex justify-center w-full lg:w-1/2">
            <PieChart width={420} height={420}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx={210}
                cy={210}
                innerRadius={90}
                outerRadius={150}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                isAnimationActive={isAnimationActive}
                stroke="white"
                strokeWidth={4}
              >
                {data.map((entry, index) => (
                  <Sector
                    key={`slice-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </div>

          {/* LEGEND / STATS */}
          <div className="w-full lg:w-1/2">
            <h4 className="font-bold text-gray-700 text-lg mb-4">
              Request Summary
            </h4>

            <div className="flex flex-wrap gap-3">
              {data.map((item, index) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition
                    ${activeIndex === index ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    {item.name}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
