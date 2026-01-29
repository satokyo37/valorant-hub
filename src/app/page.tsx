// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AGENTS, Agent, AgentRole } from "@/data/agents";

const ROLES: AgentRole[] = ["Duelist", "Initiator", "Controller", "Sentinel"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<AgentRole | "All">("All");
  const [excluded, setExcluded] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<Agent | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const candidates = useMemo(() => {
    return AGENTS.filter((a) => {
      if (selectedRole !== "All" && a.role !== selectedRole) return false;
      if (excluded[a.id]) return false;
      return true;
    });
  }, [selectedRole, excluded]);

  // 初回表示：候補から1つ出す
  useEffect(() => {
    if (!current && candidates.length > 0) {
      setCurrent(pickRandom(candidates));
    }
    // 候補が0になったら表示を消す
    if (candidates.length === 0) setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length]);

  function stopRolling(finalPick?: Agent) {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;

    setIsRolling(false);
    if (finalPick) setCurrent(finalPick);
  }

  function roll() {
    if (isRolling) return;
    if (candidates.length === 0) return;

    setIsRolling(true);

    // シャッフル演出：80msごとに表示を入れ替える
    intervalRef.current = window.setInterval(() => {
      setCurrent(pickRandom(candidates));
    }, 80);

    // 1.8秒後に確定
    timeoutRef.current = window.setTimeout(() => {
      const finalPick = pickRandom(candidates);
      stopRolling(finalPick);
    }, 1800);
  }

  function resetExcludes() {
    setExcluded({});
  }

  // 画面離脱などでタイマー残らないように
  useEffect(() => {
    return () => stopRolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canRoll = candidates.length > 0 && !isRolling;

  return (
    <main className="page">
      <header className="hero">
        <div className="heroCopy">
          <p className="eyebrow">VALORANT HUB</p>
          <h1 className="heroTitle">Agent Roulette</h1>
          <p className="heroLead">
            気分で選ぶ、勝率は気にしない。<br />
            プレイ前のウォームアップに、1クリックのランダム指名。
          </p>
          <div className="heroPills">
            <span className="pill">No login</span>
            <span className="pill">Local only</span>
            <span className="pill">Fast roll</span>
          </div>
        </div>

        <div className="heroPanel">
          <div className="panelHeader">
            <div>
              <div className="label">Result</div>
              <div className="status">{isRolling ? "Rolling" : "Ready"}</div>
            </div>
            <div className="stat">
              <div className="label">Candidates</div>
              <div className="count">{candidates.length}</div>
            </div>
          </div>

          <div className={`resultBox ${isRolling ? "rolling" : ""}`}>
            {current ? (
              <div className="resultMedia">
                <img
                  className="portrait"
                  src={`/agents/portraits/${current.id}.png`}
                  alt={`${current.name} portrait`}
                />
                <div className="resultInfo">
                  <div className="agentName">{current.name}</div>
                  <div className="agentRole">{current.role}</div>
                </div>
              </div>
            ) : (
              <div className="empty">No candidates</div>
            )}
          </div>

          <div className="actions">
            <button className="primary" onClick={roll} disabled={!canRoll}>
              {isRolling ? "Rolling..." : "ROLL"}
            </button>
            <button className="ghost" onClick={resetExcludes} disabled={isRolling}>
              Reset excludes
            </button>
          </div>

          {!canRoll && candidates.length === 0 && (
            <p className="hint">除外しすぎ。Reset excludes で戻せるよ。</p>
          )}
        </div>
      </header>

      <section className="panel panelControls">
        <div className="row">
          <div>
            <div className="label">Role Filter</div>
            <div className="seg">
              <button
                className={`segBtn ${selectedRole === "All" ? "active" : ""}`}
                onClick={() => setSelectedRole("All")}
                disabled={isRolling}
              >
                All
              </button>
              {ROLES.map((r) => (
                <button
                  key={r}
                  className={`segBtn ${selectedRole === r ? "active" : ""}`}
                  onClick={() => setSelectedRole(r)}
                  disabled={isRolling}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="meta">
            <div className="label">Pool</div>
            <div className="count">{candidates.length}</div>
            <div className="subText">
              {selectedRole === "All" ? "All roles" : selectedRole}
            </div>
          </div>
        </div>
      </section>

      <section className="panel panelExclude">
        <div className="row" style={{ alignItems: "baseline" }}>
          <h2 className="h2">Exclude agents</h2>
          <span className="hint">（ローカル状態・今は保存しない）</span>
        </div>

        <div className="grid">
          {AGENTS.map((a) => {
            const checked = !!excluded[a.id];
            const disabled = isRolling;
            return (
              <label key={a.id} className={`chip ${checked ? "chipOff" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={(e) =>
                    setExcluded((prev) => ({
                      ...prev,
                      [a.id]: e.target.checked,
                    }))
                  }
                />
                <img
                  className="chipIcon"
                  src={`/agents/icon/${a.id}.png`}
                  alt={`${a.name} icon`}
                  loading="lazy"
                />
                <span className="chipName">{a.name}</span>
                <span className="chipRole">{a.role}</span>
              </label>
            );
          })}
        </div>
      </section>
    </main>
  );
}
