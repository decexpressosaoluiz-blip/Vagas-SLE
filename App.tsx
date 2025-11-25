import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PreviewCard } from './components/PreviewCard';
import { JobData, VisualStyle, DEFAULT_JOB_DATA } from './types';
import { optimizeForInstagram, improveText } from './services/geminiService';
import { Download, ZoomIn } from 'lucide-react';
import { getContrastColor } from './utils/colorUtils';

declare const html2canvas: any;

export default function App() {
  const [jobData, setJobData] = useState<JobData>(DEFAULT_JOB_DATA);
  const [currentStyle, setCurrentStyle] = useState<VisualStyle>(VisualStyle.CORPORATIVO);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Dynamic Scale for Preview
  const [previewScale, setPreviewScale] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Logic to fit 1080px wide cards into viewport
        // Mobile: narrower scale. Desktop: wider.
        const width = containerRef.current.offsetWidth;
        // Base scale calculation: fitting 1080px + padding into the container width
        // On mobile we show one at a time roughly, or scroll horizontally
        // This value 0.35 is good for mobile (approx 375px width)
        // 0.5 is good for desktop sidebar layout
        const scale = width < 768 ? 0.28 : 0.45; 
        setPreviewScale(scale);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dragging Logic
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - jobData.heroPosition.x,
      y: e.clientY - jobData.heroPosition.y
    };
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setJobData(prev => ({
      ...prev,
      heroPosition: { ...prev.heroPosition, x: newX, y: newY }
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // AI Functions
  const handleOptimizeInstagram = async () => {
    setIsAiLoading(true);
    const optimized = await optimizeForInstagram(jobData.description.activities + "\n" + jobData.description.requirements);
    if (optimized) {
      setJobData(prev => ({
        ...prev,
        description: { ...prev.description, activities: optimized }
      }));
    }
    setIsAiLoading(false);
  };

  const handleImproveText = async (type: 'title' | 'description') => {
    setIsAiLoading(true);
    const textToImprove = type === 'title' ? jobData.title : jobData.description.activities;
    const improved = await improveText(textToImprove, type);
    if (improved) {
       setJobData(prev => {
          if (type === 'title') return { ...prev, title: improved };
          return { ...prev, description: { ...prev.description, activities: improved } };
       });
    }
    setIsAiLoading(false);
  };

  // Export Logic
  const handleExport = async () => {
    if (typeof html2canvas === 'undefined') {
        alert("Biblioteca de exportação não carregada.");
        return;
    }
    setIsExporting(true);
    
    const formats = ['SQUARE', 'PORTRAIT', 'STORY'];
    
    try {
        for (const format of formats) {
            const element = document.getElementById(`export-render-${format}`);
            if (element) {
                const exportBg = jobData.colors.canvas || '#FFFFFF';
                const canvas = await html2canvas(element, {
                    scale: 1, 
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: exportBg,
                    logging: false,
                    imageTimeout: 0,
                });
                const link = document.createElement('a');
                link.download = `Vaga-${jobData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${format}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        }
    } catch (err) {
        console.error("Export Failed", err);
        alert("Erro na exportação. Tente novamente.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div 
        className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
    >
      <Sidebar 
        data={jobData} 
        style={currentStyle} 
        onUpdate={(newData) => setJobData(prev => ({ ...prev, ...newData }))}
        onStyleChange={setCurrentStyle}
        onOptimize={handleOptimizeInstagram}
        onImproveText={handleImproveText}
        isAiLoading={isAiLoading}
      />
      
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
         {/* Top Bar */}
         <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
            <h2 className="text-gray-500 font-medium text-xs md:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="hidden md:inline">Editor em Tempo Real</span>
            </h2>
            <div className="flex items-center gap-2 md:gap-6">
               <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <ZoomIn size={14} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase mr-1">Zoom</span>
                  <input 
                    type="range" min="0.5" max="2" step="0.1" 
                    value={jobData.heroPosition.scale} 
                    onChange={(e) => setJobData(prev => ({ ...prev, heroPosition: { ...prev.heroPosition, scale: parseFloat(e.target.value) } }))}
                    className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
               </div>

               <button 
                 onClick={handleExport}
                 disabled={isExporting}
                 className={`flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-5 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all text-xs md:text-sm ${isExporting ? 'opacity-70 cursor-wait' : ''}`}
               >
                 {isExporting ? (
                    <>
                       <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                       <span>Gerando...</span>
                    </>
                 ) : (
                    <>
                       <Download size={14} />
                       <span>Baixar</span>
                    </>
                 )}
               </button>
            </div>
         </div>

         {/* Canvas Area */}
         <div ref={containerRef} className="flex-1 bg-slate-200/50 overflow-x-auto overflow-y-auto md:overflow-y-hidden flex flex-col md:flex-row items-center p-8 gap-8 md:gap-12 custom-scrollbar justify-start md:justify-center">
            
            {/* 1:1 SQUARE */}
            <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">Post (1:1)</div>
                <div className="border-[4px] border-white shadow-xl bg-white overflow-hidden relative rounded-xl transition-all duration-300" 
                     style={{ width: `${1080 * previewScale}px`, height: `${1080 * previewScale}px` }}>
                    <div className="origin-top-left" style={{ transform: `scale(${previewScale})` }}>
                        <PreviewCard idPrefix="preview" style={currentStyle} format="SQUARE" data={jobData} onHeroDragStart={handleDragStart} />
                    </div>
                </div>
            </div>

            {/* 4:5 PORTRAIT */}
            <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">Retrato (4:5)</div>
                <div className="border-[4px] border-white shadow-xl bg-white overflow-hidden relative rounded-xl transition-all duration-300" 
                     style={{ width: `${1080 * previewScale}px`, height: `${1350 * previewScale}px` }}>
                    <div className="origin-top-left" style={{ transform: `scale(${previewScale})` }}>
                        <PreviewCard idPrefix="preview" style={currentStyle} format="PORTRAIT" data={jobData} onHeroDragStart={handleDragStart} />
                    </div>
                </div>
            </div>

            {/* 9:16 STORY */}
            <div className="flex flex-col items-center gap-3 shrink-0 pr-0 md:pr-12 pb-12 md:pb-0">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">Story (9:16)</div>
                <div className="border-[4px] border-white shadow-xl bg-white overflow-hidden relative rounded-xl transition-all duration-300" 
                     style={{ width: `${1080 * previewScale}px`, height: `${1920 * previewScale}px` }}>
                    <div className="origin-top-left" style={{ transform: `scale(${previewScale})` }}>
                        <PreviewCard idPrefix="preview" style={currentStyle} format="STORY" data={jobData} onHeroDragStart={handleDragStart} />
                    </div>
                </div>
            </div>

         </div>
      </div>

      {/* HIDDEN RENDERING AREA FOR EXPORT (Full Resolution) */}
      <div className="fixed top-0 left-0 pointer-events-none opacity-0 -z-50 overflow-hidden" style={{ width: '1px', height: '1px' }}>
          <div id="export-container">
            <div className="mb-10"><PreviewCard idPrefix="export-render" style={currentStyle} format="SQUARE" data={jobData} /></div>
            <div className="mb-10"><PreviewCard idPrefix="export-render" style={currentStyle} format="PORTRAIT" data={jobData} /></div>
            <div className="mb-10"><PreviewCard idPrefix="export-render" style={currentStyle} format="STORY" data={jobData} /></div>
          </div>
      </div>

    </div>
  );
}