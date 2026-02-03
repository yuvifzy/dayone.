
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import api from '../services/api';

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const TaskRow: React.FC<{
  task: Task;
  onStatusToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}> = ({ task, onStatusToggle, onEdit, onDelete }) => {
  return (
    <div className="group flex items-center justify-between p-6 glass-panel rounded-3xl transition-all hover:scale-[1.01] hover:shadow-2xl dark:hover:border-oled-border/60">
      <div className="flex items-center gap-6 overflow-hidden">
        <button
          onClick={() => onStatusToggle(task)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all btn-glow ${task.status === TaskStatus.DONE
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'dark:border-oled-border border-gray-200 dark:hover:border-indigo-500 hover:border-indigo-500'
            }`}
        >
          {task.status === TaskStatus.DONE && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <div className="flex flex-col min-w-0">
          <h3 className={`font-bold text-lg transition-colors truncate ${task.status === TaskStatus.DONE ? 'text-gray-400 dark:text-gray-600 line-through' : 'dark:text-white text-gray-900'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'HIGH' ? 'text-rose-500' : task.priority === 'MEDIUM' ? 'text-indigo-500' : 'text-emerald-500'}`}>{task.priority}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.dueDate || 'No Date'}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-2 text-gray-400 hover:text-white transition-colors btn-glow rounded-lg bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button onClick={() => onDelete(task.id)} className="p-2 text-gray-400 hover:text-rose-500 transition-colors btn-glow rounded-lg bg-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', status: TaskStatus.TODO, dueDate: getTomorrowDate() });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Task synchronization failure.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusToggle = async (task: Task) => {
    const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    try {
      await api.put(`/tasks/${task.id}`, { ...task, status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
    } catch (err) {
      alert("Status mutation rejected by terminal.");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      await api.put(`/tasks/${editingTask.id}`, editingTask);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
      setEditingTask(null);
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Purge this task unit from memory?")) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert("Deletion failed.");
      }
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

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Syncing Inventory...</div>;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black dark:text-white text-gray-900 tracking-tighter">Tasks Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium tracking-tight">Active mission-critical task tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#4f46e5] text-white font-black rounded-2xl btn-glow shadow-xl shadow-indigo-500/10 flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          <span className="text-xl">+</span> Add Task
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <input type="text" placeholder="Filter IDs..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-6 py-4 rounded-2xl border transition-all glass-panel dark:text-white bg-white/50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold" />
        </div>
        <div className="flex items-center gap-2 p-1 glass-panel rounded-2xl border dark:border-oled-border border-gray-200">
          {(['ALL', ...Object.values(TaskStatus)] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'dark:bg-indigo-500 bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-500'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => <TaskRow key={task.id} task={task} onStatusToggle={handleStatusToggle} onEdit={(t) => setEditingTask(t)} onDelete={handleDelete} />)
        ) : (
          <div className="h-[450px] flex flex-col items-center justify-center glass-panel border-2 border-dashed dark:border-oled-border border-gray-100 rounded-[4rem] text-center p-12 animate-fade-in">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full scale-150 animate-pulse"></div>
              <div className="relative w-24 h-24 glass-panel border dark:border-oled-border border-gray-200 rounded-[2rem] flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black dark:text-white text-gray-900 tracking-tighter mb-4">Strategic Clearance.</h3>
            <p className="max-w-md text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10">
              No mission-critical tasks detected in this sector. This is your chance to initialize a new execution protocol.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow shadow-2xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-[11px] transition-transform active:scale-95"
            >
              Launch First Execution
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 transition-all">
          <div className="glass-modal rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in border dark:border-oled-border border-gray-100">
            <div className="px-12 py-10 border-b dark:border-oled-border border-gray-50 flex justify-between items-center">
              <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter">New Task</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Objective Name</label>
                <input
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-bold text-lg focus:border-indigo-500 transition-colors"
                  placeholder="Task Name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Protocol Details</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-medium resize-none focus:border-indigo-500 transition-colors"
                  placeholder="Requirements..."
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority Tier</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-black uppercase tracking-widest text-[11px] focus:border-indigo-500 transition-colors"
                  >
                    <option value="LOW">Low Impact</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">Critical Path</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-6 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow uppercase tracking-[0.2em] text-sm mt-8 transition-transform active:scale-95 shadow-2xl shadow-indigo-500/30"
              >
                Launch Execution
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 transition-all">
          <div className="glass-modal rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in border dark:border-oled-border border-gray-100">
            <div className="px-12 py-10 border-b dark:border-oled-border border-gray-50 flex justify-between items-center">
              <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="p-3 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-white/5"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleUpdateTask} className="p-12 space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Objective Name</label>
                <input required value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-bold text-lg" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                <textarea rows={3} value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-medium resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Priority Tier</label>
                  <select value={editingTask.priority} onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-black uppercase tracking-widest text-[11px]">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</label>
                  <select value={editingTask.status} onChange={e => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-black uppercase tracking-widest text-[11px]">
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deadline</label>
                <input type="date" required value={editingTask.dueDate} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold" />
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-500 text-white font-black rounded-3xl btn-glow uppercase tracking-[0.2em] text-sm mt-8 transition-transform active:scale-95 shadow-2xl shadow-indigo-500/30">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
