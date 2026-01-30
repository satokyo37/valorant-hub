// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AGENTS, Agent, AgentRole } from "@/data/agents";

const ROLES: AgentRole[] = ["Duelist", "Initiator", "Controller", "Sentinel"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HomePage() {
  const [excluded, setExcluded] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<Agent | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const candidates = useMemo(() => {
    return AGENTS.filter((a) => {
      if (excluded[a.id]) return false;
      return true;
    });
  }, [excluded]);

  const excludedCount = useMemo(() => {
    return Object.values(excluded).filter(Boolean).length;
  }, [excluded]);

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
              <div className="empty">候補なし</div>
            )}
          </div>

          <div className="actions">
            <button className="primary" onClick={roll} disabled={!canRoll}>
              {isRolling ? "Rolling..." : "ROLL"}
            </button>
          </div>
        </div>
      </header>

      <section className="panel panelFilters">
        <div className="filterHeader">
          <h2 className="h2">Filter</h2>
          <button className="ghost" onClick={resetExcludes} disabled={isRolling}>
            Reset
          </button>
        </div>

        <div className="filterMeta">
          <div>
            <div className="label">Total Agents</div>
            <div className="count">{AGENTS.length}</div>
          </div>
        </div>

        <div className="roleGroups">
          {ROLES.map((role) => {
            const roleAgents = AGENTS.filter((a) => a.role === role);
            const roleExcluded = roleAgents.filter((a) => excluded[a.id]).length;
            const allExcluded = roleExcluded === roleAgents.length;
            const someExcluded = roleExcluded > 0 && !allExcluded;

            return (
              <div key={role} className="roleGroup">
                <label className="roleHeader">
                  <input
                    type="checkbox"
                    checked={allExcluded}
                    disabled={isRolling}
                    ref={(el) => {
                      if (el) el.indeterminate = someExcluded;
                    }}
                    onChange={(e) => {
                      const shouldExclude = e.target.checked;
                      setExcluded((prev) => {
                        const next = { ...prev };
                        roleAgents.forEach((agent) => {
                          next[agent.id] = shouldExclude;
                        });
                        return next;
                      });
                    }}
                  />
                  <span className="roleTitle">{role}</span>
                  <span className="roleCount">
                    {roleExcluded}/{roleAgents.length}
                  </span>
                </label>

                <div className="grid">
                  {roleAgents.map((a) => {
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
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
