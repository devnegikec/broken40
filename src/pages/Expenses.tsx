import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, ExpenseCategory } from '../lib/types';
import { Plus, Trash2, Search } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'food', 'transport', 'utilities', 'entertainment',
  'shopping', 'health', 'education', 'other',
];

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  shopping: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  health: 'bg-red-500/10 text-red-400 border-red-500/20',
  education: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  other: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    amount: '',
    category: 'food' as ExpenseCategory,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (data) setExpenses(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert({
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      date: form.date,
    });
    if (!error) {
      setForm({ amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      fetchExpenses();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('expenses').delete().eq('id', id);
    fetchExpenses();
  }

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalFiltered = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-gray-400 mt-1">Track your daily spending</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat}
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="What did you spend on?"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Save Expense
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

      {/* Search + Total */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gray-700 transition-colors"
          />
        </div>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-semibold">₹{totalFiltered.toLocaleString()}</span>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filtered.map((expense) => (
          <div
            key={expense.id}
            className="card flex items-center justify-between hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border ${CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other}`}
              >
                {expense.category}
              </span>
              <div>
                <p className="text-white font-medium">{expense.description}</p>
                <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">₹{Number(expense.amount).toLocaleString()}</span>
              <button
                onClick={() => handleDelete(expense.id)}
                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            {search ? 'No expenses matching your search' : 'No expenses recorded yet. Start tracking your spending!'}
          </div>
        )}
      </div>
    </div>
  );
}
