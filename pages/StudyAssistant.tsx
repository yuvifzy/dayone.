
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AIResponseRenderer
 * A dedicated component for high-performance, structured text rendering.
 */
const AIResponseRenderer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-4">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-4" />;

        const renderBold = (str: string) => {
          const parts = str.split(/(\*\*.*?\*\*)/g);
          return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={i} className="font-black text-indigo-400 dark:text-indigo-300">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });
        };

        if (line.startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const content = line.replace(/^#+\s*/, '');
          const baseStyle = "font-black tracking-tighter dark:text-white text-gray-900 mt-10 mb-6 uppercase";

          if (level === 1) return <h2 key={idx} className={`${baseStyle} text-3xl text-indigo-500`}>{renderBold(content)}</h2>;
          return <h3 key={idx} className={`${baseStyle} text-xl text-indigo-400 border-b dark:border-white/5 pb-2`}>{renderBold(content)}</h3>;
        }

        const isKeywordHeader = trimmed.match(/^(STRATEGIC SUMMARY|TECHNICAL DRILL|THE DAILY ROUTINE|THE ROUTINE|SUMMARY|TECHNIQUES|EXECUTION PROTOCOL):/i);
        if (isKeywordHeader) {
          return (
            <div key={idx} className="mt-12 mb-6 first:mt-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px flex-1 dark:bg-oled-border bg-gray-100"></span>
                <span className="text-indigo-500 font-black uppercase tracking-[0.3em] text-[10px]">
                  {trimmed.replace(':', '')}
                </span>
                <span className="h-px flex-1 dark:bg-oled-border bg-gray-100"></span>
              </div>
            </div>
          );
        }

        if (trimmed.match(/^[\-\*•]\s+/)) {
          return (
            <div key={idx} className="flex gap-4 pl-4 items-start group">
              <span className="text-indigo-500 font-black mt-1.5 shrink-0 opacity-60">•</span>
              <p className="m-0 flex-1 leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                {renderBold(trimmed.replace(/^[\-\*•]\s+/, ''))}
              </p>
            </div>
          );
        }

        if (trimmed.match(/^\d+\.\s+/)) {
          const num = trimmed.match(/^\d+/)?.[0];
          return (
            <div key={idx} className="flex gap-4 pl-4 items-start group">
              <span className="text-indigo-500 font-black mt-1 text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-md shrink-0">
                {num}
              </span>
              <p className="m-0 flex-1 leading-relaxed text-gray-600 dark:text-gray-300 font-bold">
                {renderBold(trimmed.replace(/^\d+\.\s+/, ''))}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed text-gray-600 dark:text-gray-300 font-medium text-base">
            {renderBold(line)}
          </p>
        );
      })}
    </div>
  );
};

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const StudyAssistant: React.FC = () => {
  const [struggle, setStruggle] = useState('');
  const [examDate, setExamDate] = useState(getTomorrowDate());
  const [subjectType, setSubjectType] = useState('theory');
  const [timeAvailable, setTimeAvailable] = useState('2');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  // Persistence logic
  useEffect(() => {
    const savedResponse = localStorage.getItem('dayone_study_response');
    const savedParams = localStorage.getItem('dayone_study_params');

    if (savedResponse) setResponse(savedResponse);
    if (savedParams) {
      const params = JSON.parse(savedParams);
      setStruggle(params.struggle || '');
      setExamDate(params.examDate || getTomorrowDate());
      setSubjectType(params.subjectType || 'theory');
      setTimeAvailable(params.timeAvailable || '2');
    }
  }, []);

  const saveToPersistence = (res: string | null) => {
    if (res) {
      localStorage.setItem('dayone_study_response', res);
      localStorage.setItem('dayone_study_params', JSON.stringify({
        struggle,
        examDate,
        subjectType,
        timeAvailable
      }));
    } else {
      localStorage.removeItem('dayone_study_response');
      localStorage.removeItem('dayone_study_params');
    }
  };

  const generateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!struggle.trim()) return;

    setLoading(true);
    setResponse(null);

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    if (!apiKey) {
      console.error("DayOne Security: API Credentials missing from environment configuration.");
      setResponse("AI TERMINAL OFFLINE. API Key not configured.");
      setLoading(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: 'You are an elite study strategist for high-performance engineering students. You despise generic advice. You provide precise, science-backed technical study protocols.',
      });

      const prompt = `
        STRATEGIC CONTEXT:
        - Struggle: ${struggle}
        - Exam Date: ${examDate}
        - Subject Focus: ${subjectType}
        - Daily Capacity: ${timeAvailable} hours

        INSTRUCTIONS:
        1. Classify the user's struggle into one category: [Planning, Motivation, Focus, Memory, Time Management].
        2. Provide a 3-part strategic breakdown:
           - STRATEGIC SUMMARY: Concise diagnosis. Use **bolding** for critical insights.
           - TECHNICAL DRILL: One advanced study technique (e.g., Blurting, Interleaved Practice, Active Recall) tailored to their subject. Explain the "How" and "Why".
           - THE DAILY ROUTINE: A timestamped plan based on their ${timeAvailable} hour capacity.

        STYLE: Professional, technical, zero-fluff, actionable. Use standard bullet points for lists.
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
        }
      });

      const response = result.response;
      const text = response.text() || 'Protocol generation failed. Retry.';
      setResponse(text);
      saveToPersistence(text);
    } catch (err: any) {
      console.error("AI Strategic Failure:", err.message, err);
      setResponse(`AI TERMINAL OFFLINE. Error: ${err.message || 'Check credentials'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResponse(null);
    saveToPersistence(null);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-12 animate-fade-in">
      <header className="space-y-4">
        <h1 className="text-5xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">
          Study <span className="text-[#4f46e5]">Intelligence.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl leading-relaxed">
          Classify your academic friction and receive a science-backed execution protocol in milliseconds.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <form onSubmit={generateStrategy} className="glass-panel p-10 rounded-[3rem] border dark:border-oled-border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">The Friction</label>
              <textarea
                required
                value={struggle}
                onChange={e => setStruggle(e.target.value)}
                placeholder="Ex: I can't focus on complex theory for more than 10 minutes..."
                className="w-full px-6 py-5 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 border-gray-100 outline-none font-medium resize-none min-h-[120px] focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subject Dynamics</label>
              <select
                value={subjectType}
                onChange={e => setSubjectType(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold uppercase tracking-widest text-[11px] focus:border-indigo-500 transition-colors"
              >
                <option value="theory">Conceptual / Theory</option>
                <option value="problem-heavy">Problem Solving / Logic</option>
                <option value="memorization">Heavy Memorization</option>
                <option value="coding">Technical / Engineering</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Daily Cap (Hrs)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={timeAvailable}
                  onChange={e => setTimeAvailable(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Deadline</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border dark:bg-transparent dark:border-oled-border dark:text-white bg-white/50 outline-none font-bold focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow shadow-2xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-xs mt-4 disabled:opacity-50 transition-transform active:scale-95"
            >
              {loading ? 'Optimizing Strategy...' : 'Analyze & Solve'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 h-full min-h-[500px]">
          {!response && !loading && (
            <div className="h-full flex flex-col items-center justify-center glass-panel border-2 border-dashed dark:border-oled-border border-gray-100 rounded-[3rem] text-center p-12 space-y-4">
              <div className="text-5xl opacity-40">⚡</div>
              <p className="font-black uppercase tracking-[0.2em] text-xs text-gray-400">Terminal Ready for Diagnosis</p>
              <p className="text-gray-500 text-sm font-medium">Configure your constraints and launch the analysis engine.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center glass-panel border dark:border-oled-border border-gray-100 rounded-[3rem] p-12 space-y-8 animate-pulse">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-3 text-center">
                <p className="font-black uppercase tracking-[0.2em] text-xs text-indigo-500">Engaging Gemini Flash Lite</p>
                <p className="text-gray-400 text-sm font-medium">Synthesizing high-performance study protocols...</p>
              </div>
            </div>
          )}

          {response && !loading && (
            <div className="glass-panel p-12 rounded-[3rem] border dark:border-oled-border border-gray-100 shadow-xl space-y-8 animate-fade-in overflow-hidden relative group h-full">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                <span className="text-[12rem] font-black">AI</span>
              </div>

              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-10 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 13.536a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707zM16.464 16.464a1 1 0 011.414-1.414l-.707-.707a1 1 0 011.414-1.414l.707.707z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter dark:text-white text-gray-900 leading-tight">Protocol Generated.</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60 mt-1">Science-backed execution plan</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <AIResponseRenderer text={response} />
                </div>

                <button
                  onClick={handleReset}
                  className="mt-10 w-fit px-10 py-4 glass-panel border dark:border-oled-border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-[0.98]"
                >
                  Reset Terminal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyAssistant;
