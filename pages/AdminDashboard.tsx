
import React, { useState } from 'react';
import { User, UserRole } from '../types';

const AdminDashboard: React.FC = () => {
  const [users] = useState<User[]>([
    { id: '1', name: 'Demo Admin', email: 'admin@dayone.com', role: UserRole.ADMIN },
    { id: '2', name: 'John Doe', email: 'john@example.com', role: UserRole.USER },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: UserRole.USER },
  ]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-12 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">
          Admin Control Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Global system overview and privileged user management
        </p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-[2rem] border transition-all dark:border-oled-border border-gray-100 shadow-sm hover:translate-y-[-2px] duration-300">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Total Operators</p>
          <p className="text-5xl font-black dark:text-white text-gray-900 leading-none tracking-tighter">{users.length}</p>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] border transition-all dark:border-oled-border border-gray-100 shadow-sm hover:translate-y-[-2px] duration-300">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">System Integrity</p>
          <p className="text-5xl font-black text-emerald-500 leading-none tracking-tighter">99.9%</p>
        </div>
        <div className="glass-panel p-8 rounded-[2rem] border transition-all dark:border-oled-border border-gray-100 shadow-sm hover:translate-y-[-2px] duration-300">
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">API Throughput</p>
          <p className="text-5xl font-black text-indigo-500 leading-none tracking-tighter">1.2k</p>
        </div>
      </div>

      {/* User Table Section */}
      <div className="glass-panel rounded-[2.5rem] border transition-colors dark:border-oled-border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-10 py-6 border-b dark:border-oled-border border-gray-50 dark:bg-transparent bg-gray-50/50">
          <h3 className="text-lg font-black dark:text-white text-gray-800 tracking-tight">Access Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-black tracking-[0.2em] border-b dark:border-oled-border/50 border-gray-50">
                <th className="px-10 py-6">Operator Identity</th>
                <th className="px-10 py-6">Protocol ID</th>
                <th className="px-10 py-6">Role Clearance</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-oled-border/30 divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:dark:bg-white/5 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6 font-bold dark:text-white text-gray-900 tracking-tight">{user.name}</td>
                  <td className="px-10 py-6 font-medium dark:text-gray-400 text-gray-600">{user.email}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.role === UserRole.ADMIN 
                        ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="px-6 py-2 text-[11px] font-black text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 rounded-xl btn-glow uppercase tracking-widest">
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
