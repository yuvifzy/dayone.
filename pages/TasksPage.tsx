
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import api from '../services/api';

const TaskRow: React.FC<{ 
  task: Task; 
  onStatusToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}> = ({ task, onStatusToggle, onDelete }) => {
  return (
    <div className="group flex items-center justify-between p-6 dark:bg-oled-card bg-white border dark:border-oled-border border-gray-100 rounded-3xl transition-all hover:scale-[1.01] hover:shadow-2xl dark:hover:border-oled-border/60">
      <div className="flex items-center gap-6 overflow-hidden">
        <button 
          onClick={() => onStatusToggle(task)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all btn-glow ${
            task.status === TaskStatus.DONE 
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
          <h3 className={`font-bold text-lg transition-colors truncate ${
            task.status === TaskStatus.DONE ? 'text-gray-400 dark:text-gray-600 line-through' : 'dark:text-white text-gray-900'
          }`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-4 mt-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              task.priority === 'HIGH' ? 'text-rose-500' : 
              task.priority === 'MEDIUM' ? 'text-indigo-500' : 'text-emerald-500'
            }`}>
              {task.priority}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.dueDate || 'No Date'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors btn-glow rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-400 hover:text-rose-500 transition-colors btn-glow rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Initialize OAuth Protocol', description: 'Setup zero-trust auth chains', status: TaskStatus.DONE, priority: 'HIGH', dueDate: 'Dec 01', userId: '1' },
    { id: '2', title: 'Refactor Core Components', description: 'Apply extreme dark mode design rules', status: TaskStatus.IN_PROGRESS, priority: 'MEDIUM', dueDate: 'Dec 05', userId: '1' },
    { id: '3', title: 'Security Audit', description: 'Penetration testing and secret rotation', status: TaskStatus.TODO, priority: 'HIGH', dueDate: 'Dec 12', userId: '1' },
  ]);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter(t => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusToggle = (task: Task) => {
    const nextStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Confirm deletion of this task unit?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black dark:text-white text-gray-900 tracking-tighter">Tasks Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium tracking-tight">Active mission-critical task tracking</p>
        </div>
        <button className="px-8 py-4 bg-[#4f46e5] text-white font-black rounded-2xl btn-glow shadow-xl shadow-indigo-500/10 uppercase tracking-[0.2em] text-xs">
          Create Entry
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <input 
            type="text" 
            placeholder="Search Protocol ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-card dark:border-oled-border dark:text-white bg-white border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1 dark:bg-oled-card bg-gray-100 rounded-2xl border dark:border-oled-border border-gray-200">
          {(['ALL', ...Object.values(TaskStatus)] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s 
                  ? 'dark:bg-indigo-500 bg-indigo-500 text-white shadow-lg' 
                  : 'text-gray-500 hover:text-indigo-500'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskRow 
              key={task.id} 
              task={task} 
              onStatusToggle={handleStatusToggle} 
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center dark:bg-oled-card bg-white border-2 border-dashed dark:border-oled-border border-gray-100 rounded-[3rem] text-gray-500 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-black uppercase tracking-[0.2em] text-xs">No entries found in current sector</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
