'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FinanceTracker() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [incomes, setIncomes] = useState<any[]>([]);
    const [budget, setBudget] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Expense Form
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('FOOD');
    const [desc, setDesc] = useState('');

    // Income Form
    const [incomeAmount, setIncomeAmount] = useState('');
    const [incomeSource, setIncomeSource] = useState('SALARY');
    const [incomeDesc, setIncomeDesc] = useState('');

    // Budget Form
    const [budgetAmount, setBudgetAmount] = useState('');

    const fetchData = async () => {
        try {
            const [expRes, budgetRes, incomeRes] = await Promise.all([
                fetch('/api/finance/expenses'),
                fetch('/api/finance/budget'),
                fetch('/api/finance/income')
            ]);

            if (expRes.ok) {
                const data = await expRes.json();
                setExpenses(data.expenses);
            }
            if (budgetRes.ok) {
                const data = await budgetRes.json();
                setBudget(data.budget);
                if (data.budget) setBudgetAmount(data.budget.amount.toString());
            }
            if (incomeRes.ok) {
                const data = await incomeRes.json();
                setIncomes(data.incomes);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/finance/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, category, description: desc }),
        });
        if (res.ok) {
            fetchData();
            setAmount('');
            setDesc('');
        }
    };

    const handleAddIncome = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/finance/income', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: incomeAmount,
                source: incomeSource,
                description: incomeDesc
            }),
        });
        if (res.ok) {
            fetchData();
            setIncomeAmount('');
            setIncomeDesc('');
        }
    };

    const handleSetBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/finance/budget', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: budgetAmount, type: 'MONTHLY' }),
        });
        if (res.ok) {
            fetchData();
        }
    };

    // Calculations
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalSpent;
    const budgetLimit = budget ? budget.amount : 0;
    const remaining = budgetLimit - totalSpent;
    const percentage = budgetLimit > 0 ? Math.min((totalSpent / budgetLimit) * 100, 100) : 0;

    const downloadPDF = async () => {
        const doc = new jsPDF();

        try {
            // Load Noto Sans Bengali font for Bangla support
            const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosansbengali/NotoSansBengali-Regular.ttf';
            const response = await fetch(fontUrl);
            const buffer = await response.arrayBuffer();

            // Convert to base64
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const fontBase64 = window.btoa(binary);

            // Add font to VFS and register it
            doc.addFileToVFS('NotoSansBengali.ttf', fontBase64);
            doc.addFont('NotoSansBengali.ttf', 'NotoSansBengali', 'normal');
            doc.setFont('NotoSansBengali');
        } catch (error) {
            console.error('Failed to load Bangla font:', error);
            // Fallback continues without the font
        }

        // Title
        doc.setFontSize(20);
        doc.text("Finance & Budget Report", 14, 22);

        doc.setFontSize(11);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

        // Summary
        doc.setFontSize(14);
        doc.text("Summary", 14, 45);

        const summaryData = [
            ['Total Income', `$${totalIncome.toFixed(2)}`],
            ['Total Expenses', `$${totalSpent.toFixed(2)}`],
            ['Net Balance', `$${balance.toFixed(2)}`],
            ['Budget Limit', `$${budgetLimit.toFixed(2)}`],
            ['Budget Status', budgetLimit > 0 ? `${percentage.toFixed(0)}% Used` : 'N/A']
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [66, 133, 244] },
            styles: { font: 'NotoSansBengali', fontStyle: 'normal' }
        });

        // Income Table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Income History", 14, finalY);

        const incomeRows = incomes.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.source,
            item.description || '-',
            `$${item.amount.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Date', 'Source', 'Description', 'Amount']],
            body: incomeRows,
            theme: 'striped',
            headStyles: { fillColor: [34, 197, 94] },
            styles: { font: 'NotoSansBengali', fontStyle: 'normal' }
        });

        // Expense Table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY2 = (doc as any).lastAutoTable.finalY + 15;
        doc.text("Expense History", 14, finalY2);

        const expenseRows = expenses.map(item => [
            new Date(item.date).toLocaleDateString(),
            item.category,
            item.description || '-',
            `$${item.amount.toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: finalY2 + 5,
            head: [['Date', 'Category', 'Description', 'Amount']],
            body: expenseRows,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] },
            styles: { font: 'NotoSansBengali', fontStyle: 'normal' }
        });

        doc.save("Finance_Report.pdf");
    };

    // Category icons
    const categoryIcons: Record<string, string> = {
        'FOOD': '🍔',
        'TRAVEL': '🚗',
        'BOOKS': '📚',
        'ONLINE': '💻',
        'OTHER': '📦'
    };

    const incomeIcons: Record<string, string> = {
        'SALARY': '💼',
        'FREELANCE': '💻',
        'GIFT': '🎁',
        'OTHER': '💰'
    };

    // Category totals
    const categoryTotals = expenses.reduce((acc: any, exp: any) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                        <span className="text-5xl">💰</span>
                        Budget & Finance
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Track your income, expenses and manage your monthly budget</p>
                </div>
                <button
                    onClick={downloadPDF}
                    className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <span>📄</span> Download Report
                </button>
            </div>

            {/* Balance & Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Current Balance */}
                <div className={`rounded-2xl p-6 text-white shadow-lg ${balance >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-orange-600'}`}>
                    <div className="text-sm opacity-90 mb-1">Current Balance</div>
                    <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
                    <div className="text-xs opacity-80 mt-1">
                        {balance >= 0 ? '✅ Positive' : '⚠️ Deficit'}
                    </div>
                </div>

                {/* Total Income */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Income</div>
                    <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
                    <div className="text-xs opacity-80 mt-1">{incomes.length} entries</div>
                </div>

                {/* Total Spent */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Total Spent</div>
                    <div className="text-3xl font-bold">${totalSpent.toFixed(2)}</div>
                    <div className="text-xs opacity-80 mt-1">{expenses.length} expenses</div>
                </div>

                {/* Budget Status */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90 mb-1">Budget Remaining</div>
                    <div className="text-3xl font-bold">${remaining.toFixed(2)}</div>
                    <div className="text-xs opacity-80 mt-1">
                        {budgetLimit > 0 ? `${percentage.toFixed(0)}% used` : 'No budget set'}
                    </div>
                </div>
            </div>

            {/* Income & Expense Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Income */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
                            💵
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add Income</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track your earnings</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddIncome} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount ($)
                            </label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                type="number"
                                step="0.01"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Source
                            </label>
                            <select
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={incomeSource}
                                onChange={(e) => setIncomeSource(e.target.value)}
                            >
                                <option value="SALARY">💼 Salary</option>
                                <option value="FREELANCE">💻 Freelance</option>
                                <option value="GIFT">🎁 Gift</option>
                                <option value="OTHER">💰 Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (Optional)
                            </label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                type="text"
                                value={incomeDesc}
                                onChange={(e) => setIncomeDesc(e.target.value)}
                                placeholder="e.g., January salary"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300"
                        >
                            ➕ Add Income
                        </button>
                    </form>
                </div>

                {/* Add Expense */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-2xl">
                            💸
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Add Expense</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log your spending</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddExpense} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount ($)
                            </label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="FOOD">🍔 Food</option>
                                <option value="TRAVEL">🚗 Travel</option>
                                <option value="BOOKS">📚 Books</option>
                                <option value="ONLINE">💻 Online</option>
                                <option value="OTHER">📦 Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (Optional)
                            </label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-red-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                                type="text"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="e.g., Lunch at cafe"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/40 transition-all duration-300"
                        >
                            ➕ Add Expense
                        </button>
                    </form>
                </div>
            </div>

            {/* Budget Settings */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Monthly Budget</h3>
                <form onSubmit={handleSetBudget} className="flex gap-4">
                    <input
                        className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 transition-all bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100"
                        type="number"
                        step="0.01"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder="Set monthly budget limit"
                        required
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                    >
                        Set Budget
                    </button>
                </form>
                {budget && (
                    <div className="mt-4">
                        <div className="bg-gray-100 dark:bg-[#0d1117] rounded-xl h-4 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            ${totalSpent.toFixed(2)} of ${budgetLimit.toFixed(2)} ({percentage.toFixed(0)}%)
                        </p>
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Income */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Income</h3>
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    ) : incomes.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No income recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {incomes.slice(0, 5).map((income) => (
                                <div
                                    key={income.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors"
                                >
                                    <div className="text-3xl">{incomeIcons[income.source] || '💰'}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                                            {income.description || income.source}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(income.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-green-600">
                                        +${income.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Expenses */}
                <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Expenses</h3>
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    ) : expenses.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No expenses yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {expenses.slice(0, 5).map((expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0d1117] transition-colors"
                                >
                                    <div className="text-3xl">{categoryIcons[expense.category] || '📦'}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                                            {expense.description || expense.category}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-red-600">
                                        -${expense.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
