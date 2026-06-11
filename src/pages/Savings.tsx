import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Savings, SavingsCategory } from '../lib/types';
import { Plus, Trash2 } from 'lucide-react';

const SAVINGS_CATEGORIES: SavingsCategory[] = ['mutual_fund', 'equity', 'debt', 'crypto', 'general'];

const CATEGORY_COLORS: Record<string, string> = {
  mutual_fund: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  equity: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  debt: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  crypto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  general: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function Savings() {
  const [savings, setSavings] = useState<Savings[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'general' as SavingsCategory,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchSavings();
  }, []);

  async function fetchSavings() {
    const { data } = await supabase
      .from('savings')
      .select('*')
      .order('date', { ascending: false });
    if (data) setSavings(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('savings').insert({
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      notes: form.notes,
    });
    if (!error) {
      setForm({ category: 'general', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setShowForm(false);
      fetchSavings();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('savings').delete().eq('id', id);
    fetchSavings();
  }

  const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);

  const byCategory = savings.reduce<Record<string, { total: number; entries: Savings[] }>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { total: 0, entries: [] };
    acc[s.category].total += Number(s.amount);
    acc[s.category].entries.push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Savings</h2>
          <p className="text-gray-400 mt-1">Track your savings across categories</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Savings
        </button>
      </div>

      {/* Total Savings Card */}
      <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
        <p className="text-sm text-gray-400">Total Savings</p>
        <p className="text-3xl font-bold text-white mt-1">₹{totalSavings.toLocaleString()}</p>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as SavingsCategory })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {SAVINGS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Any notes..."
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Savings by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SAVINGS_CATEGORIES.map((cat) => {
          const data = byCategory[cat];
          return (
            <div key={cat} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border ${CATEGORY_COLORS[cat]}`}>
                  {cat.replace('_', ' ')}
                </span>
                <span className="text-lg font-bold text-white">
                  ₹{(data?.total || 0).toLocaleString()}
                </span>
              </div>
              {data?.entries.length ? (
                <div className="space-y-2">
                  {data.entries.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-gray-300">{s.notes || 'No notes'}</p>
                        <p className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">₹{Number(s.amount).toLocaleString()}</span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 py-4 text-center">No savings in this category</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
