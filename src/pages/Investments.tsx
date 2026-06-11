import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Investment, InvestmentType } from '../lib/types';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const INVESTMENT_TYPES: InvestmentType[] = ['mutual_fund', 'equity', 'debt', 'crypto'];

const TYPE_COLORS: Record<string, string> = {
  mutual_fund: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  equity: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  debt: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  crypto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: 'equity' as InvestmentType,
    name: '',
    symbol: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    quantity: '',
    current_price: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  async function fetchInvestments() {
    const { data } = await supabase
      .from('investments')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInvestments(data);
  }

  function resetForm() {
    setForm({
      type: 'equity',
      name: '',
      symbol: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: '',
      quantity: '',
      current_price: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(inv: Investment) {
    setForm({
      type: inv.type,
      name: inv.name,
      symbol: inv.symbol,
      purchase_date: inv.purchase_date,
      purchase_price: String(inv.purchase_price),
      quantity: String(inv.quantity),
      current_price: String(inv.current_price || ''),
      notes: inv.notes || '',
    });
    setEditingId(inv.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      type: form.type,
      name: form.name,
      symbol: form.symbol,
      purchase_date: form.purchase_date,
      purchase_price: Number(form.purchase_price),
      quantity: Number(form.quantity),
      current_price: Number(form.current_price) || Number(form.purchase_price),
      notes: form.notes,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('investments').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('investments').insert(payload));
    }

    if (!error) {
      resetForm();
      fetchInvestments();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('investments').delete().eq('id', id);
    fetchInvestments();
  }

  const totalInvested = investments.reduce((sum, i) => sum + Number(i.purchase_price) * Number(i.quantity), 0);
  const totalCurrent = investments.reduce(
    (sum, i) => sum + Number(i.current_price || i.purchase_price) * Number(i.quantity),
    0
  );
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? ((totalPnl / totalInvested) * 100).toFixed(2) : '0';

  // Group by type
  const byType = investments.reduce<Record<string, Investment[]>>((acc, inv) => {
    (acc[inv.type] = acc[inv.type] || []).push(inv);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Investments</h2>
          <p className="text-gray-400 mt-1">Track your portfolio & profits</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-gray-400">Total Invested</p>
          <p className="text-2xl font-bold text-white mt-1">₹{totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-gray-400">Current Value</p>
          <p className="text-2xl font-bold text-white mt-1">₹{totalCurrent.toLocaleString()}</p>
        </div>
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <p className="text-sm text-gray-400">Total P&L</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toLocaleString()}
            </p>
            <span className={`text-sm ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({totalPnlPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Investment' : 'Add New Investment'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as InvestmentType })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g., HDFC Bank"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Symbol/Ticker</label>
                <input
                  type="text"
                  required
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g., HDFCBANK"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  required
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Purchase Price (₹)</label>
                <input
                  type="number"
                  required
                  value={form.purchase_price}
                  onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Quantity</label>
                <input
                  type="number"
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Current Price (₹)</label>
                <input
                  type="number"
                  value={form.current_price}
                  onChange={(e) => setForm({ ...form, current_price: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Leave empty to use purchase price"
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
                {editingId ? 'Update' : 'Save'} Investment
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Investments by Type */}
      {INVESTMENT_TYPES.map((type) => {
        const items = byType[type] || [];
        if (items.length === 0) return null;
        const typeInvested = items.reduce((s, i) => s + Number(i.purchase_price) * Number(i.quantity), 0);
        const typeCurrent = items.reduce(
          (s, i) => s + Number(i.current_price || i.purchase_price) * Number(i.quantity),
          0
        );
        const typePnl = typeCurrent - typeInvested;

        return (
          <div key={type} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border ${TYPE_COLORS[type]}`}>
                  {type.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-400">{items.length} holding{items.length > 1 ? 's' : ''}</span>
              </div>
              <span className={`text-sm font-medium ${typePnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                P&L: {typePnl >= 0 ? '+' : ''}₹{typePnl.toLocaleString()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Buy Date</th>
                    <th className="pb-3 font-medium">Buy Price</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium">Curr Price</th>
                    <th className="pb-3 font-medium">Invested</th>
                    <th className="pb-3 font-medium">Current</th>
                    <th className="pb-3 font-medium">P&L</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => {
                    const invested = Number(inv.purchase_price) * Number(inv.quantity);
                    const current = Number(inv.current_price || inv.purchase_price) * Number(inv.quantity);
                    const pnl = current - invested;
                    const pnlPct = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0';
                    return (
                      <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer" onClick={() => startEdit(inv)}>
                        <td className="py-3 text-white font-medium">{inv.name}</td>
                        <td className="py-3 text-gray-400">{new Date(inv.purchase_date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 text-gray-300">₹{Number(inv.purchase_price).toLocaleString()}</td>
                        <td className="py-3 text-gray-300">{inv.quantity}</td>
                        <td className="py-3 text-gray-300">₹{Number(inv.current_price || inv.purchase_price).toLocaleString()}</td>
                        <td className="py-3 text-gray-300">₹{invested.toLocaleString()}</td>
                        <td className="py-3 text-gray-300">₹{current.toLocaleString()}</td>
                        <td className={`py-3 font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <div className="flex items-center gap-1">
                            {pnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()}
                          </div>
                          <span className="text-xs">({pnlPct}%)</span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {investments.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          No investments yet. Add your first investment to start tracking profits!
        </div>
      )}
    </div>
  );
}
