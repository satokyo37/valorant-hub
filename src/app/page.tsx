// src/app/page.tsx
"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { AGENTS, Agent, AgentRole } from "@/data/agents";

const ROLES: AgentRole[] = ["Duelist", "Initiator", "Sentinel", "Controller"];

function roleIconSrc(role: AgentRole) {
  return `/agents/role/${role.toLowerCase()}.png`;
}

export default function HomePage() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<Agent | null>(null);
  const [rouletteIndex, setRouletteIndex] = useState(0);
  const [rouletteWidth, setRouletteWidth] = useState(0);
  const [rouletteEl, setRouletteEl] = useState<HTMLDivElement | null>(null);

  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const hasSelection = useMemo(() => {
    return Object.values(selected).some(Boolean);
  }, [selected]);

  const candidates = useMemo(() => {
    if (!hasSelection) return AGENTS;
    return AGENTS.filter((a) => selected[a.id]);
  }, [hasSelection, selected]);

  // 初回表示：候補から1つ出す
  useEffect(() => {
    if (!current && candidates.length > 0) {
      const firstIndex = Math.floor(Math.random() * candidates.length);
      setRouletteIndex(firstIndex);
      setCurrent(candidates[firstIndex]);
    }
    // 候補が0になったら表示を消す
    if (candidates.length === 0) setCurrent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length]);

  useEffect(() => {
    if (!rouletteEl) return;
    const observer = new ResizeObserver(() => {
      setRouletteWidth(rouletteEl.clientWidth);
    });
    observer.observe(rouletteEl);
    setRouletteWidth(rouletteEl.clientWidth);
    return () => observer.disconnect();
  }, [rouletteEl]);

  const visibleCount = useMemo(() => {
    let cardSpan = 140;
    let minCards = 7;
    let maxCards = 13;

    if (rouletteWidth < 460) {
      cardSpan = 74;
      minCards = 3;
      maxCards = 5;
    } else if (rouletteWidth < 760) {
      cardSpan = 112;
      minCards = 5;
      maxCards = 7;
    }

    const count = Math.floor(rouletteWidth / cardSpan);
    const bounded = Math.min(maxCards, Math.max(minCards, count));
    const odd = bounded % 2 === 0 ? bounded - 1 : bounded;
    return Math.max(3, odd);
  }, [rouletteWidth]);

  const rouletteWindow = useMemo(() => {
    if (candidates.length === 0) return [];
    const half = Math.floor(visibleCount / 2);
    return Array.from({ length: visibleCount }, (_, i) => {
      const offset = i - half;
      const idx = (rouletteIndex + offset + candidates.length) % candidates.length;
      return { agent: candidates[idx], offset };
    });
  }, [candidates, rouletteIndex, visibleCount]);

  const stopRolling = useCallback((finalPick?: Agent) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;

    setIsRolling(false);
    if (finalPick) setCurrent(finalPick);
  }, []);

  function roll() {
    if (isRolling) return;
    if (candidates.length === 0) return;

    setIsRolling(true);

    // シャッフル演出：120msごとに表示を入れ替える
    intervalRef.current = window.setInterval(() => {
      setRouletteIndex((prev) => {
        const next = (prev + 1) % candidates.length;
        setCurrent(candidates[next]);
        return next;
      });
    }, 120);

    // 1.8秒後に確定
    timeoutRef.current = window.setTimeout(() => {
      const finalIndex = Math.floor(Math.random() * candidates.length);
      const finalPick = candidates[finalIndex];
      setRouletteIndex(finalIndex);
      stopRolling(finalPick);
    }, 1800);
  }

  const resetSelection = useCallback(() => {
    setSelected({});
  }, []);

  // 画面離脱などでタイマー残らないように
  useEffect(() => {
    return () => stopRolling();
  }, [stopRolling]);

  const canRoll = candidates.length > 0 && !isRolling;

  return (
    <main className="page">
      <header className="hero">
        <div className="heroCopy">
          <p className="eyebrow">VALORANT HUB</p>
          <h1 className="heroTitle">Agent Roulette</h1>
          <p className="heroSub">Spin once, lock in your pick.</p>
        </div>

        <div className="heroPanel">
          <div className="panelHeader">
            <div>
              <div className="label">Result</div>
              <div className="status">{isRolling ? "Rolling" : "Ready"}</div>
            </div>
            <div className="stat">
              <div className="label">Candidates</div>
              <div className="countRow">
                <div className="count">{candidates.length}</div>
                {!hasSelection && <span className="pill">All</span>}
              </div>
            </div>
          </div>

          <div className={`resultBox ${isRolling ? "rolling" : ""}`}>
            {current ? (
              <div className="rouletteFull" ref={setRouletteEl}>
                <div className="rouletteTrack">
                  {rouletteWindow.map(({ agent, offset }) => {
                    const active = offset === 0;
                    const depth = Math.abs(offset);
                    return (
                      <div
                        key={`${agent.id}-${offset}`}
                        className={`rouletteCard ${active ? "rouletteCardActive" : ""}`}
                        style={{
                          ["--offset" as string]: offset,
                          ["--depth" as string]: depth,
                        }}
                      >
                        <Image
                          className="rouletteIcon"
                          src={`/agents/icon/${agent.id}.png`}
                          alt={`${agent.name} icon`}
                          width={44}
                          height={44}
                          sizes="44px"
                          loading="lazy"
                        />
                        <span className="rouletteName">{agent.name}</span>
                      </div>
                    );
                  })}
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

      <FilterPanel
        selected={selected}
        setSelected={setSelected}
        isRolling={isRolling}
        hasSelection={hasSelection}
        resetSelection={resetSelection}
      />
    </main>
  );
}

const FilterPanel = memo(function FilterPanel({
  selected,
  setSelected,
  isRolling,
  hasSelection,
  resetSelection,
}: {
  selected: Record<string, boolean>;
  setSelected: Dispatch<SetStateAction<Record<string, boolean>>>;
  isRolling: boolean;
  hasSelection: boolean;
  resetSelection: () => void;
}) {
  return (
    <section className="panel panelFilters">
      <div className="filterHeader">
        <h2 className="h2">Filter</h2>
        <button className="ghost" onClick={resetSelection} disabled={isRolling}>
          Reset
        </button>
      </div>

      <div className="filterMeta">
        <div>
          <div className="label">Total Agents</div>
          <div className="count">{AGENTS.length}</div>
        </div>
        <div className="subText subTextEmphasis">
          チェックしたエージェントが候補に含まれます。未選択の場合は全員が候補です。
        </div>
      </div>

      <div className="roleGroups">
        {ROLES.map((role) => {
          const roleAgents = AGENTS
            .filter((a) => a.role === role)
            .toSorted((a, b) => a.name.localeCompare(b.name));
          const roleSelected = roleAgents.filter((a) => selected[a.id]).length;
          const allSelected = roleSelected === roleAgents.length;
          const someSelected = roleSelected > 0 && !allSelected;

          return (
            <div key={role} className="roleGroup">
              <label className="roleHeader">
                <input
                  type="checkbox"
                  checked={allSelected}
                  disabled={isRolling}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => {
                    const shouldSelect = e.target.checked;
                    setSelected((prev) => {
                      const next = { ...prev };
                      roleAgents.forEach((agent) => {
                        next[agent.id] = shouldSelect;
                      });
                      return next;
                    });
                  }}
                />
                <Image
                  className="roleIcon"
                  src={roleIconSrc(role)}
                  alt={`${role} role icon`}
                  width={18}
                  height={18}
                  sizes="18px"
                  loading="lazy"
                />
                <span className="roleTitle">{role}</span>
                <span className={`roleCount ${roleSelected > 0 ? "roleCountActive" : ""}`}>
                  {roleSelected}/{roleAgents.length}
                </span>
              </label>

              <div className="grid">
                {roleAgents.map((a) => {
                  const checked = !!selected[a.id];
                  const disabled = isRolling;
                  const dimmed = hasSelection && !checked;
                  return (
                    <label key={a.id} className={`chip ${dimmed ? "chipOff" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={(e) =>
                          setSelected((prev) => ({
                            ...prev,
                            [a.id]: e.target.checked,
                          }))
                        }
                      />
                      <Image
                        className="chipIcon"
                        src={`/agents/icon/${a.id}.png`}
                        alt={`${a.name} icon`}
                        width={28}
                        height={28}
                        sizes="28px"
                        loading="lazy"
                      />
                      <span className="chipName">{a.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
