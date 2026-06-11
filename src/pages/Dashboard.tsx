import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, Investment, Savings } from '../lib/types';
import {
  TrendingUp,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [savings, setSavings] = useState<Savings[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [expRes, invRes, savRes] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('investments').select('*'),
      supabase.from('savings').select('*'),
    ]);

    if (expRes.data) setExpenses(expRes.data);
    if (invRes.data) setInvestments(invRes.data);
    if (savRes.data) setSavings(savRes.data);
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalInvested = investments.reduce(
    (sum, i) => sum + Number(i.purchase_price) * Number(i.quantity),
    0
  );
  const currentValue = investments.reduce(
    (sum, i) => sum + Number(i.current_price || i.purchase_price) * Number(i.quantity),
    0
  );
  const totalProfit = currentValue - totalInvested;
  const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);

  // Expenses by category for pie chart
  const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

  // Monthly expense trend (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }).reverse();

  const monthlyData = last6Months.map((month) => {
    const total = expenses
      .filter((e) => {
        const d = new Date(e.date);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        return label === month;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { month, expenses: total };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Your financial overview at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Invested</p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{totalInvested.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Profit / Loss</p>
              <p className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ₹{totalProfit.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Savings</p>
              <p className="text-2xl font-bold text-white mt-1">
                ₹{totalSavings.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#f9fafb',
                }}
              />
              <Bar dataKey="expenses" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Expenses by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#f9fafb',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expense data to display
            </div>
          )}
          {pieData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-400 capitalize">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Investment Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Investment Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Invested</th>
                <th className="pb-3 font-medium">Current</th>
                <th className="pb-3 font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => {
                const invested = Number(inv.purchase_price) * Number(inv.quantity);
                const current = Number(inv.current_price || inv.purchase_price) * Number(inv.quantity);
                const pnl = current - invested;
                const pnlPercent = invested > 0 ? ((pnl / invested) * 100).toFixed(2) : '0';
                return (
                  <tr key={inv.id} className="border-b border-gray-800/50">
                    <td className="py-3 text-white">{inv.name}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg text-xs bg-gray-800 text-gray-300 capitalize">
                        {inv.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-gray-300">₹{invested.toLocaleString()}</td>
                    <td className="py-3 text-gray-300">₹{current.toLocaleString()}</td>
                    <td className={`py-3 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()} ({pnlPercent}%)
                    </td>
                  </tr>
                );
              })}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No investments yet. Add your first investment!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
