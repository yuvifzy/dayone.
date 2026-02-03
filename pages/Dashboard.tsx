
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';
import { useAuth } from '../App';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const Dashboard: React.FC = () => {
  const { auth } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: TaskStatus.TODO, dueDate: getTomorrowDate() });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  const todayDate = getTodayDate();
  const tasksDueToday = tasks.filter(t => t.dueDate === todayDate);

  const statsData = [
    { name: 'Low Priority', count: tasks.filter(t => t.priority === 'LOW').length, color: '#10b981' },
    { name: 'Medium Priority', count: tasks.filter(t => t.priority === 'MEDIUM').length, color: '#4f46e5' },
    { name: 'High Priority', count: tasks.filter(t => t.priority === 'HIGH').length, color: '#f43f5e' },
  ];

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = { ...task, status: newStatus };
      await api.put(`/tasks/${taskId}`, updatedTask);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Operation failed. Server unreachable.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', newTask);
      setTasks([...tasks, response.data]);
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', status: TaskStatus.TODO, dueDate: getTomorrowDate() });
    } catch (err) {
      alert("Encryption error or session expired.");
    }
  };

  const generateTaskBreakdown = async (taskTitle: string) => {
    setIsAiSuggesting(true);
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

    if (!apiKey) {
      console.error("DayOne Security: API Credentials missing.");
      alert("AI Intelligence offline: API Credentials missing.");
      setIsAiSuggesting(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`Break down this task into 3 specific actionable sub-steps for a technical professional: "${taskTitle}"`);
      const response = await result.response;
      alert(`DayOne Strategic breakdown:\n\n${response.text()}`);
    } catch (err: any) {
      console.error("Gemini Error:", err);
      alert(`AI Intelligence currently offline. ${err.message || ''}`);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const getUserFirstName = () => {
    if (!auth.user?.name) return 'Operator';
    return auth.user.name.split(' ')[0];
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Initializing Data stream...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">DayOne Workspace</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium flex items-center gap-2">
            Welcome back, <span className="text-indigo-500 dark:text-indigo-400 font-bold">{getUserFirstName()}</span>. Terminal ready for operation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#4f46e5] text-white font-black rounded-2xl btn-glow shadow-xl shadow-indigo-500/10 flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          <span className="text-xl">+</span> Add Task
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Today's Tasks Metric */}
        <div className="glass-panel p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm flex flex-col justify-center min-h-[180px]">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Today's Tasks
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black dark:text-white text-gray-900 leading-none tracking-tighter">{tasksDueToday.length}</p>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Efficiency Metric */}
        <div className="glass-panel p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm flex flex-col justify-center min-h-[180px]">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Efficiency</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black text-[#4f46e5] dark:text-indigo-400 leading-none tracking-tighter">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 800 }} dy={15} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ borderRadius: '20px', backgroundColor: '#050505', border: '1px solid #1a1a1a' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={90}>
                {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {Object.values(TaskStatus).map(status => (
          <div key={status} className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${status === TaskStatus.TODO ? 'bg-gray-400' : status === TaskStatus.IN_PROGRESS ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                <h3 className="font-black dark:text-white text-gray-800 uppercase tracking-[0.2em] text-[11px]">{status.replace('_', ' ')}</h3>
              </div>
              <span className="glass-panel dark:text-gray-400 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full border dark:border-oled-border">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="space-y-6 kanban-column max-h-[70vh] overflow-y-auto pr-2">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="glass-panel p-7 rounded-[2rem] shadow-sm border transition-all duration-300 dark:border-oled-border border-gray-100 hover:scale-[1.02] hover:shadow-2xl dark:hover:border-oled-border/60 group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : task.priority === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {task.priority}
                    </span>
                    <button onClick={() => generateTaskBreakdown(task.title)} disabled={isAiSuggesting} className="text-gray-400 hover:text-indigo-400 transition-colors opacity-40 group-hover:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.487l1.1 2.053 2.37.545a1 1 0 01.523 1.637l-1.583 1.944.292 2.417a1 1 0 01-1.36 1.05L11 8.448l-2.433 1.733a1 1 0 01-1.36-1.05l.292-2.417-1.583-1.944a1 1 0 01.523-1.637l2.37-.545 1.1-2.053a1 1 0 01.897-.487zM6 18a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1zm8 0a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                  <h4 className="font-black dark:text-white text-gray-900 text-xl mb-3 leading-tight tracking-tight">{task.title}</h4>
                  <p className="text-sm dark:text-gray-400 text-gray-500 line-clamp-3 leading-relaxed mb-8 font-medium">{task.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t dark:border-oled-border/30 border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 dark:bg-indigo-900/40 flex items-center justify-center text-[11px] text-[#4f46e5] dark:text-indigo-400 font-black">TM</div>
                      <span className="text-[12px] font-bold dark:text-gray-300 text-gray-600">{task.dueDate || 'ASAP'}</span>
                    </div>
                    <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)} className="text-[10px] font-black dark:text-gray-500 text-gray-400 dark:bg-transparent bg-transparent border border-transparent dark:border-oled-border rounded-xl px-4 py-2 outline-none cursor-pointer uppercase tracking-widest">
                      {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 glass-modal z-[100] flex items-center justify-center p-6 transition-all">
          <div className="glass-modal rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in border dark:border-oled-border border-gray-100">
            <div className="px-12 py-10 border-b dark:border-oled-border border-gray-50 flex justify-between items-center">
              <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter">New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAddTask} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Objective Name</label>
                <input required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-bold text-lg" placeholder="Task Name" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Protocol Details</label>
                <textarea rows={3} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-medium resize-none" placeholder="Requirements..." />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority Tier</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-black uppercase tracking-widest text-[11px]">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deadline</label>
                  <input type="date" required value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow uppercase tracking-[0.2em] text-sm mt-8 transition-transform active:scale-95 shadow-2xl shadow-indigo-500/30">Launch Execution</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
