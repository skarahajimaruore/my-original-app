"use client";

import { useState } from "react";

const tools = [
  {
    id: "cursor",
    name: "Cursor",
    category: "Editor",
    categoryJa: "コードエディタ",
    icon: "✦",
    color: "#00D4FF",
    glow: "rgba(0,212,255,0.4)",
    description: "AI搭載コードエディタ。コーディング・補完・リファクタリング",
    position: { x: 50, y: 10 },
    connects: ["github"],
  },
  {
    id: "github",
    name: "GitHub",
    category: "Version Control",
    categoryJa: "バージョン管理",
    icon: "◈",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.4)",
    description: "コードのバージョン管理・チーム共同開発・プルリクエスト",
    position: { x: 50, y: 40 },
    connects: ["vercel", "colab"],
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "Hosting",
    categoryJa: "ホスティング",
    icon: "▲",
    color: "#F9FAFB",
    glow: "rgba(249,250,251,0.3)",
    description: "フロントエンドのデプロイ・CDN・サーバーレス関数",
    position: { x: 20, y: 72 },
    connects: ["postgresql"],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    categoryJa: "データベース",
    icon: "⬡",
    color: "#34D399",
    glow: "rgba(52,211,153,0.4)",
    description: "リレーショナルDB・データ永続化・クエリ処理",
    position: { x: 50, y: 72 },
    connects: ["colab"],
  },
  {
    id: "colab",
    name: "Colaboratory",
    category: "Analytics",
    categoryJa: "分析環境",
    icon: "◎",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.4)",
    description: "Jupyter Notebook・機械学習・データ分析・可視化",
    position: { x: 80, y: 72 },
    connects: [],
  },
];

const flowSteps = [
  { from: "cursor", to: "github", label: "push / commit" },
  { from: "github", to: "vercel", label: "CI/CD デプロイ" },
  { from: "github", to: "colab", label: "データ取得" },
  { from: "vercel", to: "postgresql", label: "DB接続" },
  { from: "postgresql", to: "colab", label: "分析用データ" },
];

export default function ArchDiagram() {
  const [active, setActive] = useState(null);
  const [hoveredFlow, setHoveredFlow] = useState(null);

  const getNode = (id: string) => tools.find((t) => t.id === id);

  const activeNode = tools.find((t) => t.id === active);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080C14",
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        color: "#E2E8F0",
        padding: "32px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px", position: "relative" }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#00D4FF", marginBottom: "8px", textTransform: "uppercase" }}>
          System Architecture
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 700, margin: 0, letterSpacing: "-1px", color: "#F9FAFB" }}>
          ITアーキテクチャ図
        </h1>
        <div style={{ fontSize: "12px", color: "#64748B", marginTop: "8px" }}>
          ノードをクリックして詳細を確認
        </div>
      </div>

      {/* Main diagram */}
      <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative" }}>

        {/* SVG connections */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {tools.map((t) => (
              <filter key={t.id} id={`glow-${t.id}`}>
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          {flowSteps.map((flow, i) => {
            const from = getNode(flow.from);
            const to = getNode(flow.to);
            const isHovered = hoveredFlow === i;
            const isRelated = active && (active === flow.from || active === flow.to);
            const color = isHovered ? from?.color : isRelated ? from?.color : "#1E293B";
            return (
              <line
                key={i}
                x1={`${from?.position.x}%`}
                y1={`${from?.position?.y ? from.position.y + 5 : 0}%`}
                x2={`${to?.position.x}%`}
                y2={`${to?.position?.y ? to.position.y - 1 : 0}%`}
                stroke={color}
                strokeWidth={isHovered || isRelated ? "0.5" : "0.3"}
                strokeDasharray={isHovered ? "2 1" : "none"}
                opacity={isHovered ? 1 : isRelated ? 0.7 : 0.25}
                style={{ transition: "all 0.3s ease" }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <div style={{ position: "relative", height: "480px", zIndex: 2 }}>
          {tools.map((tool) => {
            const isActive = active === tool.id;
            const isRelated =
              active &&
              !isActive &&
              (flowSteps.some((f) => (f.from === active && f.to === tool.id) || (f.to === active && f.from === tool.id)));

            return (
              <div
                key={tool.id}
                onClick={() => setActive(isActive ? null : (tool.id as string | null) as null)}
                style={{
                  position: "absolute",
                  left: `${tool.position.x}%`,
                  top: `${tool.position.y}%`,
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  zIndex: isActive ? 10 : 2,
                }}
              >
                {/* Glow ring */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-12px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${tool.glow} 0%, transparent 70%)`,
                    opacity: isActive ? 1 : isRelated ? 0.6 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Card */}
                <div
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, #0F1724, #161E2E)`
                      : "#0D1421",
                    border: `1px solid ${isActive ? tool.color : isRelated ? tool.color + "60" : "#1E293B"}`,
                    borderRadius: "12px",
                    padding: "14px 18px",
                    minWidth: "120px",
                    textAlign: "center",
                    boxShadow: isActive
                      ? `0 0 20px ${tool.glow}, 0 4px 20px rgba(0,0,0,0.5)`
                      : "0 2px 8px rgba(0,0,0,0.3)",
                    transform: isActive ? "scale(1.08)" : isRelated ? "scale(1.03)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "6px", color: tool.color }}>
                    {tool.icon}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: isActive ? tool.color : "#E2E8F0", letterSpacing: "0.5px" }}>
                    {tool.name}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: tool.color,
                      letterSpacing: "2px",
                      marginTop: "3px",
                      textTransform: "uppercase",
                      opacity: 0.8,
                    }}
                  >
                    {tool.categoryJa}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flow labels */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {flowSteps.map((flow, i) => {
            const from = getNode(flow.from);
            const to = getNode(flow.to);
            const midX = ((from?.position?.x ? from.position.x : 0) + (to?.position?.x ? to.position.x : 0)) / 2;
            const midY = ((from?.position?.y ? from.position.y : 0) + (to?.position?.y ? to.position.y : 0)) / 2;
            const isRelated = active && (active === flow.from || active === flow.to);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${midX}%`,
                  top: `${midY}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: "9px",
                  color: isRelated ? getNode(flow.from)?.color : "#334155",
                  letterSpacing: "1px",
                  background: isRelated ? "#0D1421" : "transparent",
                  padding: isRelated ? "2px 6px" : "0",
                  borderRadius: "4px",
                  border: isRelated ? `1px solid ${getNode(flow.from)?.color}40` : "none",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {flow.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      <div
        style={{
          maxWidth: "760px",
          margin: "32px auto 0",
          minHeight: "80px",
          background: activeNode ? "#0D1421" : "transparent",
          border: activeNode ? `1px solid ${activeNode?.color}40` : "1px solid transparent",
          borderRadius: "12px",
          padding: activeNode ? "20px 24px" : "0",
          transition: "all 0.4s ease",
          overflow: "hidden",
        }}
      >
        {activeNode && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ fontSize: "28px", color: activeNode.color, flexShrink: 0 }}>{activeNode.icon}</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: activeNode.color }}>{activeNode.name}</span>
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "2px",
                    color: activeNode.color,
                    border: `1px solid ${activeNode.color}60`,
                    padding: "2px 8px",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  {activeNode.category}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", lineHeight: 1.7 }}>
                {activeNode.description}
              </p>
              {activeNode.connects.length > 0 && (
                <div style={{ marginTop: "10px", fontSize: "11px", color: "#475569" }}>
                  接続先：{activeNode.connects.map((c) => getNode(c)?.name).join(" → ")}
                </div>
              )}
            </div>
          </div>
        )}
        {!activeNode && (
          <div style={{ textAlign: "center", color: "#1E293B", fontSize: "12px", padding: "24px" }}>
            ノードを選択すると詳細が表示されます
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ maxWidth: "760px", margin: "24px auto 0", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
        {tools.map((t) => (
          <div
            key={t.id}
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#64748B", letterSpacing: "1px" }}
          >
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: t.color }} />
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}