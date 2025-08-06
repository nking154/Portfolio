import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("https://api.marketaux.com/v1/news/all", {
          params: {
            api_token: "uiM3fRebvd3p3KY41b0hcFii7rDQBilhWg3ughAr",
            language: "en",
            filter_entities: true,
            limit: 10
          }
        });
        setArticles(res.data.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <p>Loading news...</p>
      ) : (
        articles.map((article) => (
          <Card key={article.uuid}>
            <CardContent className="p-4">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <h2 className="text-lg font-semibold">{article.title}</h2>
              </a>
              <p className="text-sm text-gray-600">{article.source} — {new Date(article.published_at).toLocaleDateString()}</p>
              <p className="mt-2">{article.description}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function BudgetCalculator() {
  const categories = ["Rent", "Utilities", "Groceries", "Transport", "Entertainment", "Other"];
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddExpense = () => {
    if (!amount || (!selectedCategory && !customCategory)) return;
    const category = selectedCategory === "Other" ? customCategory : selectedCategory;

    const newExpense = { category, amount: parseFloat(amount) };

    if (editIndex !== null) {
      const updated = [...expenses];
      updated[editIndex] = newExpense;
      setExpenses(updated);
      setEditIndex(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setAmount("");
    setCustomCategory("");
    setSelectedCategory("");
  };

  const handleEdit = (index) => {
    const expense = expenses[index];
    setSelectedCategory(categories.includes(expense.category) ? expense.category : "Other");
    if (!categories.includes(expense.category)) setCustomCategory(expense.category);
    setAmount(expense.amount.toString());
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updated = expenses.filter((_, i) => i !== index);
    setExpenses(updated);
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = income ? parseFloat(income) - total : null;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57"];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <Input
          className="w-48"
          type="number"
          placeholder="Monthly Income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
      </div>

      <div className="flex gap-4 items-end">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCategory === "Other" && (
          <Input
            className="w-48"
            placeholder="Custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}

        <Input
          className="w-32"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button onClick={handleAddExpense}>{editIndex !== null ? "Update" : "Add"}</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Expenses</h3>
          <ul className="space-y-1">
            {expenses.map((exp, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span>{exp.category} - ${exp.amount.toFixed(2)}</span>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-bold text-right">Total Expenses: ${total.toFixed(2)}</div>
          {netSavings !== null && (
            <div className="text-right text-green-600 font-bold">Net Savings: ${netSavings.toFixed(2)}</div>
          )}
        </CardContent>
      </Card>

      {expenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Expenses Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenses}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {expenses.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FinanceSuperApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Finance Super App</h1>

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid grid-cols-4 gap-2">
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="stocks">Stock Prices</TabsTrigger>
          <TabsTrigger value="lessons">Investment Lessons</TabsTrigger>
          <TabsTrigger value="budget">Budget Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <NewsFeed />
        </TabsContent>

        <TabsContent value="stocks">
          <Card>
            <CardContent className="p-4">Stock prices and charts will go here.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardContent className="p-4">Investment lessons and education content here.</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <BudgetCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
