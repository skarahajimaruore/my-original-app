"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";

const STORAGE_KEY = "simple-nutrition-entries-v1";

type MealEntry = {
  id: string;
  name: string;
  protein: number;
  calories: number;
  date: string; // "YYYY-MM-DD"
};

function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("");
  const [calories, setCalories] = useState("");

  const today = getTodayString();

  // LocalStorage から初期読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MealEntry[];
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      // 壊れたデータなどがあってもアプリが落ちないように握りつぶす
    }
  }, []);

  // 変更を LocalStorage に同期
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === today),
    [entries, today]
  );

  const todayTotals = useMemo(
    () =>
      todayEntries.reduce(
        (acc, cur) => {
          acc.protein += cur.protein;
          acc.calories += cur.calories;
          return acc;
        },
        { protein: 0, calories: 0 }
      ),
    [todayEntries]
  );

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();

    const parsedProtein = parseFloat(protein);
    const parsedCalories = parseFloat(calories);

    if (!name.trim()) return;
    if (Number.isNaN(parsedProtein) || Number.isNaN(parsedCalories)) return;

    const newEntry: MealEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      protein: parsedProtein,
      calories: parsedCalories,
      date: today,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setName("");
    setProtein("");
    setCalories("");
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
        {/* ヘッダー & 今日の合計 */}
        <header className="mb-6">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-emerald-700 sm:text-3xl">
            シンプル栄養管理
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            本日のタンパク質とカロリーを、かんたん記録。
          </p>
        </header>

        <section className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-emerald-100 backdrop-blur-sm sm:p-5">
          <div className="mb-1 text-xs font-medium tracking-wide text-emerald-700">
            本日の合計 ({today})
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl bg-emerald-50 px-3 py-3 sm:px-4">
              <div className="text-xs font-semibold text-emerald-700">
                タンパク質
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {todayTotals.protein.toFixed(1)}
                <span className="ml-1 text-xs font-medium text-emerald-700">
                  g
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-3 sm:px-4">
              <div className="text-xs font-semibold text-emerald-700">
                カロリー
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {todayTotals.calories.toFixed(0)}
                <span className="ml-1 text-xs font-medium text-emerald-700">
                  kcal
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 入力フォーム */}
        <section className="mb-6 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-emerald-800">
            食事を記録する
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                食べたもの
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 鶏むね肉 150g"
                className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:border-emerald-300 focus:ring-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  タンパク質 (g)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="例: 30"
                  className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:border-emerald-300 focus:ring-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  カロリー (kcal)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="例: 250"
                  className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:border-emerald-300 focus:ring-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:translate-y-px active:shadow-none"
            >
              記録する
            </button>
          </form>
        </section>

        {/* 履歴一覧 */}
        <section className="mb-4 flex-1 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-emerald-800">
            履歴一覧
          </h2>

          {entries.length === 0 ? (
            <p className="text-xs text-slate-500">
              まだ記録がありません。今日食べたものを登録してみましょう！
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-start justify-between rounded-xl bg-emerald-50/70 px-3 py-2.5 text-sm"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-slate-900">
                        {entry.name}
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {entry.date}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-700">
                      タンパク質{" "}
                      <span className="font-semibold">
                        {entry.protein.toFixed(1)} g
                      </span>{" "}
                      / カロリー{" "}
                      <span className="font-semibold">
                        {entry.calories.toFixed(0)} kcal
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="mt-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-800 transition hover:bg-emerald-200"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="mt-auto pt-2 text-center text-[11px] text-slate-400">
          データはブラウザの LocalStorage にのみ保存されます。
        </footer>
      </div>
    </main>
  );
}