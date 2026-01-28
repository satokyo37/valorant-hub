// src/data/agents.ts
export type AgentRole = "Duelist" | "Initiator" | "Controller" | "Sentinel";

export type Agent = {
  id: string;
  name: string;
  nameJa: string;
  role: AgentRole;
};

export const AGENTS: Agent[] = [
  { id: "jett", name: "Jett", nameJa: "ジェット", role: "Duelist" },
  { id: "reyna", name: "Reyna", nameJa: "レイナ", role: "Duelist" },
  { id: "raze", name: "Raze", nameJa: "レイズ", role: "Duelist" },
  { id: "phoenix", name: "Phoenix", nameJa: "フェニックス", role: "Duelist" },
  { id: "yoru", name: "Yoru", nameJa: "ヨル", role: "Duelist" },
  { id: "neon", name: "Neon", nameJa: "ネオン", role: "Duelist" },
  { id: "iso", name: "Iso", nameJa: "アイソ", role: "Duelist" },
  { id: "waylay", name: "Waylay", nameJa: "ウェイレイ", role: "Duelist" },

  { id: "sova", name: "Sova", nameJa: "ソーヴァ", role: "Initiator" },
  { id: "skye", name: "Skye", nameJa: "スカイ", role: "Initiator" },
  { id: "breach", name: "Breach", nameJa: "ブリーチ", role: "Initiator" },
  { id: "kayo", name: "KAY/O", nameJa: "KAY/O", role: "Initiator" },
  { id: "fade", name: "Fade", nameJa: "フェイド", role: "Initiator" },
  { id: "gekko", name: "Gekko", nameJa: "ゲッコー", role: "Initiator" },
  { id: "tejo", name: "Tejo", nameJa: "テホ", role: "Initiator" },

  { id: "omen", name: "Omen", nameJa: "オーメン", role: "Controller" },
  { id: "brimstone", name: "Brimstone", nameJa: "ブリムストーン", role: "Controller" },
  { id: "viper", name: "Viper", nameJa: "ヴァイパー", role: "Controller" },
  { id: "astra", name: "Astra", nameJa: "アストラ", role: "Controller" },
  { id: "harbor", name: "Harbor", nameJa: "ハーバー", role: "Controller" },
  { id: "clove", name: "Clove", nameJa: "クローヴ", role: "Controller" },

  { id: "sage", name: "Sage", nameJa: "セージ", role: "Sentinel" },
  { id: "killjoy", name: "Killjoy", nameJa: "キルジョイ", role: "Sentinel" },
  { id: "cypher", name: "Cypher", nameJa: "サイファー", role: "Sentinel" },
  { id: "chamber", name: "Chamber", nameJa: "チェンバー", role: "Sentinel" },
  { id: "deadlock", name: "Deadlock", nameJa: "デッドロック", role: "Sentinel" },
  { id: "vyse", name: "Vyse", nameJa: "ヴァイス", role: "Sentinel" },
  { id: "veto", name: "Veto", nameJa: "ヴィトー", role: "Sentinel" },
];
