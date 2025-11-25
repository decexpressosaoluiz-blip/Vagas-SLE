import React, { useMemo } from 'react';
import { JobData, VisualStyle, DAYS_OF_WEEK, FontPairing } from '../types';
import { Upload, Sparkles, Wand2, Type, Palette, Layout, Clock, Calendar, Image as ImageIcon, Briefcase, Phone, MessageCircle, MapPin, TextSelect, Bot } from 'lucide-react';
import { extractColorsFromImage, generateExpandedShades } from '../utils/colorUtils';

interface SidebarProps {
  data: JobData;
  style: VisualStyle;
  onUpdate: (newData: Partial<JobData>) => void;
  onStyleChange: (s: VisualStyle) => void;
  onOptimize: () => void;
  onImproveText: (type: 'title' | 'description') => void;
  isAiLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  data, style, onUpdate, onStyleChange, onOptimize, onImproveText, isAiLoading 
}) => {
  
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      const colors = await extractColorsFromImage(url);
      
      onUpdate({ 
        images: { ...data.images, logo: url },
        // Store the extracted global palette, but we will also gen dynamic ones
        generatedPalette: colors.palette, 
        colors: { 
            ...data.colors, 
            primary: colors.primary, 
            accent: colors.accent,
            title: colors.primary,
            icons: colors.accent,
            canvas: '#FFFFFF',
            designElements: colors.accent,
        }
      });
    }
  };

  const handleImageUpload = (key: 'hero' | 'background', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdate({ images: { ...data.images, [key]: url } });
    }
  };

  const toggleDay = (day: string) => {
    const newDays = data.selectedDays.includes(day)
      ? data.selectedDays.filter(d => d !== day)
      : [...data.selectedDays, day];
    onUpdate({ selectedDays: newDays });
  };

  // This component now generates a specific palette for the CURRENT color value
  // This fixes the issue where "Accent" (Blue) showed "Primary" (Red) palette.
  const ColorSwatch = ({ label, colorKey }: { label: string, colorKey: keyof typeof data.colors }) => {
      
      // 1. Generate specific shades for THIS color key
      const dynamicShades = useMemo(() => {
          return generateExpandedShades(data.colors[colorKey]);
      }, [data.colors[colorKey]]);

      // 2. Also include the Global Extracted Palette (from Logo) at the end
      // removing duplicates
      const fullDisplayPalette = Array.from(new Set([...dynamicShades, ...data.generatedPalette]));

      return (
        <div className="mb-4">
            <div className="flex justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</label>
                <span className="text-[10px] text-gray-400 font-mono">{data.colors[colorKey]}</span>
            </div>
            <div className="flex items-center gap-3 w-full">
                {/* Main Picker */}
                <div className="relative w-10 h-10 rounded-full shadow-md overflow-hidden border border-gray-200 shrink-0 ring-2 ring-white transition-transform hover:scale-105">
                    <input 
                        type="color" 
                        value={data.colors[colorKey]}
                        onChange={(e) => onUpdate({ colors: { ...data.colors, [colorKey]: e.target.value } })}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-none p-0" 
                    />
                </div>
                
                {/* Dynamic Palette Strip */}
                <div className="flex-1 overflow-x-auto no-scrollbar bg-gray-50/80 rounded-xl border border-gray-100 h-12 flex items-center px-2 shadow-inner">
                    <div className="flex gap-1 pr-4"> {/* Added pr-4 to prevent cutoff */}
                        {fullDisplayPalette.map((c, i) => (
                            <button
                                key={`${colorKey}-${i}-${c}`}
                                className={`w-6 h-6 rounded-full shrink-0 border-2 transition-all ${data.colors[colorKey] === c ? 'ring-2 ring-indigo-600 scale-125 border-white z-10' : 'border-white hover:scale-125 hover:z-10 hover:border-gray-300'}`}
                                style={{ backgroundColor: c }}
                                onClick={() => onUpdate({ colors: { ...data.colors, [colorKey]: c } })}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="w-full md:w-[450px] lg:w-[480px] bg-white border-r border-gray-200 flex flex-col shadow-2xl z-30 font-inter h-auto md:h-full shrink-0">
      <div className="p-4 border-b border-gray-100 bg-slate-50 shrink-0 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
           <Layout className="text-indigo-600" size={20} /> VagaCreator AI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* 1. BRANDING & COLORS */}
        <section className="space-y-4">
             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b pb-2 flex items-center gap-2"><Palette size={14}/> Identidade Visual</h2>
             
             <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Logo</label>
                    <label className="cursor-pointer flex flex-col items-center justify-center h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition-all group">
                        {data.images.logo ? (
                            <img src={data.images.logo} className="w-full h-full object-contain p-2" alt="logo" />
                        ) : (
                            <div className="text-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                                <Upload size={20} className="mx-auto mb-1" />
                                <span className="text-[10px] font-bold">Enviar PNG</span>
                            </div>
                        )}
                        <input type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleLogoUpload} />
                    </label>
                </div>
             </div>

             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-1">
                  <ColorSwatch label="Principal" colorKey="primary" />
                  <ColorSwatch label="Destaque" colorKey="accent" />
                  <ColorSwatch label="Título" colorKey="title" />
                  <ColorSwatch label="Texto" colorKey="text" />
                  <ColorSwatch label="Ícones" colorKey="icons" />
                  <ColorSwatch label="Fundo" colorKey="canvas" />
             </div>

             <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tipografia</label>
                <select 
                    value={data.fontPairing}
                    onChange={(e) => onUpdate({ fontPairing: e.target.value as FontPairing })}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="MODERN">Moderno (Montserrat + Open Sans)</option>
                    <option value="EDITORIAL">Editorial (Playfair + Lato)</option>
                    <option value="TECH">Tech (Orbitron + Roboto)</option>
                    <option value="BOLD">Impacto (Raleway + Inter)</option>
                    <option value="CLASSIC">Clássico (DM Sans + Open Sans)</option>
                </select>
             </div>
        </section>

        {/* 2. AI ASSISTANT */}
        <section className="space-y-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <Bot size={14} /> Inteligência Artificial (Gemini)
             </h2>
             
             <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => onImproveText('title')}
                    disabled={isAiLoading}
                    className="flex items-center justify-center gap-2 bg-white text-indigo-700 border border-indigo-200 p-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                 >
                    <Wand2 size={12} /> Melhorar Título
                 </button>
                 <button 
                    onClick={() => onImproveText('description')}
                    disabled={isAiLoading}
                    className="flex items-center justify-center gap-2 bg-white text-indigo-700 border border-indigo-200 p-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                 >
                    <Wand2 size={12} /> Melhorar Texto
                 </button>
             </div>
             
             <button 
                onClick={onOptimize}
                disabled={isAiLoading}
                className="w-full bg-indigo-600 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
             >
                 <Sparkles size={12} /> Otimizar para Instagram (Bullet Points)
             </button>
             <p className="text-[10px] text-indigo-400 text-center">Recomendado para formato Post 1:1</p>
        </section>

        {/* 3. DETAILS */}
        <section className="space-y-4">
             <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b pb-2 flex items-center gap-2"><Briefcase size={14}/> Detalhes</h2>

             <div>
                 <label className="text-xs font-semibold text-gray-600 mb-1 block">Título</label>
                 <input type="text" value={data.title} onChange={(e) => onUpdate({ title: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
             </div>

             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Salário</label>
                    <input type="text" value={data.salary} onChange={(e) => onUpdate({ salary: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Local</label>
                    <input type="text" value={data.location} onChange={(e) => onUpdate({ location: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Horário</label>
                    <input type="text" value={data.schedule} onChange={(e) => onUpdate({ schedule: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Modelo</label>
                    <select value={data.workModel} onChange={(e) => onUpdate({ workModel: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                        <option>Presencial</option>
                        <option>Híbrido</option>
                        <option>100% Remoto</option>
                    </select>
                 </div>
             </div>

             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Dias de Trabalho</label>
                <div className="flex gap-1 flex-wrap">
                    {DAYS_OF_WEEK.map(day => (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${data.selectedDays.includes(day) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
             </div>

             <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-600 block">Atividades</label>
                 <textarea value={data.description.activities} onChange={(e) => onUpdate({ description: { ...data.description, activities: e.target.value } })} className="w-full p-2 border border-gray-300 rounded-lg text-sm h-20" />
                 
                 <label className="text-xs font-semibold text-gray-600 block">Requisitos</label>
                 <textarea value={data.description.requirements} onChange={(e) => onUpdate({ description: { ...data.description, requirements: e.target.value } })} className="w-full p-2 border border-gray-300 rounded-lg text-sm h-20" />
             </div>

             {/* TEXT SCALING SLIDERS */}
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                 <p className="text-[10px] font-bold uppercase text-gray-400">Ajuste de Tamanho (Fonte)</p>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] w-12 font-medium text-gray-500">Título</span>
                     <input type="range" min="0.5" max="1.5" step="0.1" value={data.fontScale.title} onChange={(e) => onUpdate({ fontScale: { ...data.fontScale, title: parseFloat(e.target.value) } })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] w-12 font-medium text-gray-500">Detalhes</span>
                     <input type="range" min="0.5" max="1.5" step="0.1" value={data.fontScale.details} onChange={(e) => onUpdate({ fontScale: { ...data.fontScale, details: parseFloat(e.target.value) } })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] w-12 font-medium text-gray-500">Atividades</span>
                     <input type="range" min="0.5" max="1.5" step="0.1" value={data.fontScale.activities} onChange={(e) => onUpdate({ fontScale: { ...data.fontScale, activities: parseFloat(e.target.value) } })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] w-12 font-medium text-gray-500">Requisitos</span>
                     <input type="range" min="0.5" max="1.5" step="0.1" value={data.fontScale.requirements} onChange={(e) => onUpdate({ fontScale: { ...data.fontScale, requirements: parseFloat(e.target.value) } })} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                 </div>
             </div>
        </section>

      </div>
    </div>
  );
};