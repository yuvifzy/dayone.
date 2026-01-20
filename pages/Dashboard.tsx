
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'DayOne Identity Design', description: 'Design core visual language and dark mode system', status: TaskStatus.DONE, priority: 'HIGH', dueDate: 'Dec 01', userId: '1' },
    { id: '2', title: 'Spring Boot Integration', description: 'Setup JPA entities and JWT filter chains', status: TaskStatus.IN_PROGRESS, priority: 'HIGH', dueDate: 'Dec 05', userId: '1' },
    { id: '3', title: 'Gemini AI Hookup', description: 'Prompt engineering for task breakdown automation', status: TaskStatus.TODO, priority: 'MEDIUM', dueDate: 'Dec 10', userId: '1' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: TaskStatus.TODO, dueDate: 'Dec 10' });

  const statsData = [
    { name: 'Todo', count: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#94a3b8' },
    { name: 'In Progress', count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#4f46e5' },
    { name: 'Done', count: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#10b981' },
  ];

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      userId: '1',
      priority: newTask.priority as 'LOW' | 'MEDIUM' | 'HIGH'
    };
    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', priority: 'MEDIUM', status: TaskStatus.TODO, dueDate: 'Dec 10' });
  };

  const generateTaskBreakdown = async (taskTitle: string) => {
    setIsAiSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Break down this task into 3 specific actionable sub-steps: "${taskTitle}"`,
      });
      alert(`DayOne AI Suggestions:\n\n${response.text}`);
    } catch (err) {
      console.error("Gemini Error:", err);
      alert("AI Service currently unavailable. Please check API Key.");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-fade-in">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-5xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">DayOne Workspace</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium">Strategic project visualization and execution</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#4f46e5] text-white font-black rounded-2xl btn-glow shadow-xl shadow-indigo-500/10 flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          <span className="text-xl">+</span> Add Task
        </button>
      </header>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="dark:bg-oled-card bg-white p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm flex flex-col justify-center min-h-[180px]">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Velocity</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black dark:text-white text-gray-900 leading-none tracking-tighter">{tasks.length}</p>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active</span>
          </div>
        </div>
        
        <div className="dark:bg-oled-card bg-white p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm flex flex-col justify-center min-h-[180px]">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Efficiency</p>
          <div className="flex items-baseline gap-2">
            <p className="text-6xl font-black text-[#4f46e5] dark:text-indigo-400 leading-none tracking-tighter">
              {Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / (tasks.length || 1)) * 100)}%
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 dark:bg-oled-card bg-white p-8 rounded-[2rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontWeight: 800 }}
                dy={15}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                contentStyle={{ 
                  borderRadius: '20px', 
                  backgroundColor: '#050505', 
                  border: '1px solid #1a1a1a',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ fontWeight: 800, fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={90}>
                {statsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {Object.values(TaskStatus).map(status => (
          <div key={status} className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === TaskStatus.TODO ? 'bg-gray-400' :
                  status === TaskStatus.IN_PROGRESS ? 'bg-indigo-500' : 'bg-emerald-500'
                }`} />
                <h3 className="font-black dark:text-white text-gray-800 uppercase tracking-[0.2em] text-[11px]">{status.replace('_', ' ')}</h3>
              </div>
              <span className="dark:bg-oled-card bg-gray-100 dark:text-gray-400 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full border dark:border-oled-border">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            
            <div className="space-y-6 kanban-column max-h-[70vh] overflow-y-auto pr-2">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="dark:bg-oled-card bg-white p-7 rounded-[2rem] shadow-sm border transition-all duration-300 dark:border-oled-border border-gray-100 hover:scale-[1.02] hover:shadow-2xl dark:hover:border-oled-border/60 dark:hover:bg-[#111111] group relative">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                      task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 
                      task.priority === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {task.priority}
                    </span>
                    <button 
                      onClick={() => generateTaskBreakdown(task.title)}
                      disabled={isAiSuggesting}
                      className="text-gray-400 hover:text-indigo-400 transition-colors opacity-40 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.487l1.1 2.053 2.37.545a1 1 0 01.523 1.637l-1.583 1.944.292 2.417a1 1 0 01-1.36 1.05L11 8.448l-2.433 1.733a1 1 0 01-1.36-1.05l.292-2.417-1.583-1.944a1 1 0 01.523-1.637l2.37-.545 1.1-2.053a1 1 0 01.897-.487zM6 18a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1zm8 0a1 1 0 001-1v-4a1 1 0 10-2 0v4a1 1 0 001 1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <h4 className="font-black dark:text-white text-gray-900 text-xl mb-3 leading-tight tracking-tight">{task.title}</h4>
                  <p className="text-sm dark:text-gray-400 text-gray-500 line-clamp-3 leading-relaxed mb-8 font-medium">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t dark:border-oled-border/30 border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 dark:bg-indigo-900/40 flex items-center justify-center text-[11px] text-[#4f46e5] dark:text-indigo-400 font-black">
                        {task.userId === '1' ? 'DU' : 'TM'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Due Date</span>
                        <span className="text-[12px] font-bold dark:text-gray-300 text-gray-600">{task.dueDate}</span>
                      </div>
                    </div>
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-[10px] font-black dark:text-gray-500 text-gray-400 dark:bg-[#050505] bg-gray-50 border border-transparent dark:border-oled-border rounded-xl px-4 py-2 outline-none cursor-pointer hover:border-indigo-500/50 transition-all uppercase tracking-widest"
                    >
                      {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="h-40 border-2 border-dashed dark:border-oled-border border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-400/50 text-xs font-black uppercase tracking-widest gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Void
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 transition-all">
          <div className="dark:bg-oled-card bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in border dark:border-oled-border border-gray-100">
            <div className="px-12 py-10 border-b dark:border-oled-border border-gray-50 flex justify-between items-center">
              <h2 className="text-4xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">New Task</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-3 dark:hover:bg-oled-surface hover:bg-gray-100 rounded-full transition-colors dark:text-gray-500 text-gray-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Identity</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-6 py-5 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] outline-none font-bold text-lg"
                  placeholder="Task Name"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Description</label>
                <textarea 
                  rows={3}
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-6 py-5 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] outline-none font-medium resize-none"
                  placeholder="Define scope and requirements..."
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-6 py-5 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black uppercase tracking-widest text-[11px]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Deadline</label>
                   <input 
                    type="text" 
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-6 py-5 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold"
                    placeholder="Dec 20"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-6 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow shadow-2xl shadow-indigo-500/20 transition-all uppercase tracking-[0.2em] text-sm mt-8"
              >
                Launch Execution
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
