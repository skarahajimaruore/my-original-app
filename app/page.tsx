// app/db-test/page.tsx
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
// 日付取得用の関数
function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function Home() {
  const sql = neon(`${process.env.DATABASE_URL || process.env.POSTGRES_URL}`);
  const today = getTodayString();

  // 1. データベースから全履歴を取得（サーバーサイドで実行）
  const entries = await sql`SELECT * FROM meals ORDER BY created_at DESC`;

  // 本日の合計を計算
  const todayEntries = entries.filter((e) => e.date === today);
  const todayTotals = todayEntries.reduce(
    (acc, cur) => {
      acc.protein += cur.protein;
      acc.calories += cur.calories;
      return acc;
    },
    { protein: 0, calories: 0 }
  );

  // 2. データを保存する処理（Server Action）
  async function handleAdd(formData: FormData) {
    'use server';
    const sql = neon(`${process.env.DATABASE_URL || process.env.POSTGRES_URL}`);
    
    const name = formData.get('name') as string;
    const protein = parseFloat(formData.get('protein') as string);
    const calories = parseFloat(formData.get('calories') as string);
    const date = getTodayString();

    if (!name || isNaN(protein) || isNaN(calories)) return;

    await sql`INSERT INTO meals (food_name, protein, calories, date) VALUES (${name}, ${protein}, ${calories}, ${date})`;

    revalidatePath('/db-test'); // 画面を更新
  }

  // 3. データを削除する処理
  async function handleDelete(id: number) {
    'use server';
    const sql = neon(`${process.env.DATABASE_URL || process.env.POSTGRES_URL}`);
    await sql`DELETE FROM meals WHERE id = ${id}`;
    revalidatePath('/db-test');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6">
        <header className="mb-6">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-emerald-700 sm:text-3xl">
            シンプル栄養管理 (DB版)
          </h1>
          <p className="mt-2 text-center text-sm text-slate-600">
            データはクラウド上のPostgresに保存されます。
          </p>
          {/* システム構成図へのリンクボタン */}
<div className="mt-4 flex justify-center">
  <Link 
    href="/arch" 
    className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all hover:bg-slate-700 hover:scale-105 active:scale-95"
  >
    <span className="text-emerald-400">✦</span>
    システム構成図を表示
  </Link>
</div>
          
        </header>

        {/* 合計表示エリア */}
        <section className="mb-6 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-emerald-100 backdrop-blur-sm sm:p-5">
          <div className="mb-1 text-xs font-medium tracking-wide text-emerald-700">
            本日の合計 ({today})
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl bg-emerald-50 px-3 py-3 sm:px-4">
              <div className="text-xs font-semibold text-emerald-700">タンパク質</div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {todayTotals.protein.toFixed(1)}<span className="ml-1 text-xs font-medium text-emerald-700">g</span>
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-3 sm:px-4">
              <div className="text-xs font-semibold text-emerald-700">カロリー</div>
              <div className="mt-1 text-2xl font-bold text-emerald-900">
                {todayTotals.calories.toFixed(0)}<span className="ml-1 text-xs font-medium text-emerald-700">kcal</span>
              </div>
            </div>
          </div>
        </section>

        {/* 入力フォーム */}
        <section className="mb-6 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-emerald-800">食事を記録する</h2>
          <form action={handleAdd} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">食べたもの</label>
              <input name="name" required placeholder="例: 鶏むね肉 150g" className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">タンパク質 (g)</label>
                <input name="protein" type="number" step="0.1" required placeholder="例: 30" className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">カロリー (kcal)</label>
                <input name="calories" type="number" required placeholder="例: 250" className="w-full rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200" />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">
              データベースに記録する
            </button>
          </form>
        </section>

        {/* 履歴一覧 */}
        <section className="mb-4 flex-1 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-emerald-800">履歴一覧</h2>
          <ul className="space-y-3">
            {entries.map((entry: any) => (
              <li key={entry.id} className="flex items-start justify-between rounded-xl bg-emerald-50/70 px-3 py-2.5 text-sm">
                <div className="flex-1 pr-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-slate-900">{entry.food_name}</span>
                    <span className="text-[11px] text-emerald-700">{entry.date}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-700">
                    タンパク質 <span className="font-semibold">{entry.protein.toFixed(1)} g</span> / カロリー <span className="font-semibold">{entry.calories.toFixed(0)} kcal</span>
                  </div>
                </div>
                <form action={handleDelete.bind(null, entry.id)}>
                  <button type="submit" className="mt-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-200">
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}