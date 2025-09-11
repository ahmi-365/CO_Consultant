"use client"
import React from "react"
import { ResponsiveContainer, Tooltip, Legend } from "recharts"

// ✅ Chart Container (responsive wrapper)
export const ChartContainer = ({ children, className }) => (
  <div className={`aspect-video w-full ${className || ""}`}>
    <ResponsiveContainer>{children}</ResponsiveContainer>
  </div>
)

// ✅ Chart Tooltip (custom styled)
export const ChartTooltip = (props) => (
  <Tooltip
    {...props}
    contentStyle={{
      background: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      padding: "6px 10px",
      fontSize: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
    labelStyle={{ fontWeight: 600, marginBottom: 4 }}
    itemStyle={{ display: "flex", gap: "6px", alignItems: "center" }}
  />
)

// ✅ Chart Legend (bottom labels)
export const ChartLegend = (props) => (
  <Legend
    {...props}
    wrapperStyle={{
      fontSize: "12px",
      marginTop: "6px",
      display: "flex",
      justifyContent: "center",
      gap: "10px",
    }}
  />
)

// ✅ Config helper (icon/label support)
export const getChartConfig = (config = {}) => {
  return Object.entries(config).reduce((acc, [key, value]) => {
    acc[key] = {
      label: value.label || key,
      icon: value.icon || null,
      color: value.color || "#3b82f6", // default blue
    }
    return acc
  }, {})
}
