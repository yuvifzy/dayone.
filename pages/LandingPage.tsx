
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-8 py-24 sm:py-32">
      <div className="text-center mb-24 max-w-4xl mx-auto">
        <h1 className="text-6xl sm:text-8xl font-black dark:text-white text-gray-900 mb-8 tracking-tighter leading-tight">
          Strategic Focus, <span className="text-[#4f46e5]">Simplified.</span>
        </h1>
        <p className="text-xl dark:text-gray-400 text-gray-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
          DayOne is the unified workspace for elite engineering teams. Built with the speed of React and the resilience of Spring Boot.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-12 py-5 bg-[#4f46e5] text-white font-black rounded-2xl btn-glow shadow-2xl shadow-indigo-500/10 uppercase tracking-[0.2em] text-sm"
          >
            Start Project
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-12 py-5 dark:bg-oled-card bg-white dark:text-white text-gray-700 border dark:border-oled-border border-gray-200 font-black rounded-2xl transition-all uppercase tracking-[0.2em] text-sm hover:scale-105"
          >
            Authenticate
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { title: 'Military-Grade Security', desc: 'Stateless JWT auth and high-entropy hashing for zero-trust architectures.', icon: '🛡️' },
          { title: 'Sub-Millisecond Response', desc: 'Optimized PostgreSQL schemas and a concurrency-first frontend design.', icon: '⚡' },
          { title: 'Gemini AI core', desc: 'Predictive project breakdown and automated milestone generation.', icon: '🤖' }
        ].map((feature, idx) => (
          <div key={idx} className="dark:bg-oled-card bg-white p-12 rounded-[3rem] shadow-sm border transition-all dark:border-oled-border border-gray-100 hover:scale-[1.05] group">
            <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block drop-shadow-xl">{feature.icon}</div>
            <h3 className="text-2xl font-black dark:text-white text-gray-900 mb-4 tracking-tighter">{feature.title}</h3>
            <p className="dark:text-gray-400 text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
