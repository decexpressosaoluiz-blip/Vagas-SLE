import React from 'react';
import { VisualStyle, FormatType, JobData } from '../types';
import { MapPin, DollarSign, Clock, Laptop, Mail, MessageCircle, Briefcase, CheckCircle2, Star, Building2, CalendarDays, Wallet, Timer, Monitor } from 'lucide-react';
import { getContrastColor } from '../utils/colorUtils';

interface PreviewCardProps {
  style: VisualStyle;
  format: FormatType;
  data: JobData;
  scale?: number;
  onHeroDragStart?: (e: React.MouseEvent) => void;
  idPrefix: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ style, format, data, scale = 1, onHeroDragStart, idPrefix }) => {
  
  const dimensions = {
    SQUARE: { w: 1080, h: 1080 },
    PORTRAIT: { w: 1080, h: 1350 },
    STORY: { w: 1080, h: 1920 },
  };
  const { w, h } = dimensions[format];

  // Font Configuration
  const getFontPairing = () => {
      switch (data.fontPairing) {
          case 'EDITORIAL': return { title: 'font-playfair', body: 'font-lato', label: 'font-lato' };
          case 'TECH': return { title: 'font-orbitron', body: 'font-robotoslab', label: 'font-orbitron' };
          case 'BOLD': return { title: 'font-raleway', body: 'font-inter', label: 'font-inter' };
          case 'CLASSIC': return { title: 'font-dmsans', body: 'font-opensans', label: 'font-dmsans' };
          case 'MODERN':
          default: return { title: 'font-montserrat', body: 'font-opensans', label: 'font-montserrat' };
      }
  };
  const fonts = getFontPairing();

  // Dynamic Font Scaling
  const getFontSize = (base: number, section: 'title' | 'details' | 'activities' | 'requirements' | 'meta' | 'contact') => {
    const formatMultiplier = format === 'STORY' ? 1.5 : format === 'PORTRAIT' ? 1.15 : 1;
    if (section === 'contact') return format === 'STORY' ? '1.75rem' : '1.25rem';
    const scaleKey = section === 'meta' ? 'details' : section;
    const userMultiplier = data.fontScale[scaleKey] || 1;
    return `${base * formatMultiplier * userMultiplier}px`;
  };

  const getDaysDisplay = () => {
    const d = data.selectedDays;
    const allWeekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const allWeekPlusSat = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const eq = (a: string[], b: string[]) => JSON.stringify(a.sort()) === JSON.stringify(b.sort());
    if (eq(d, allWeekdays)) return "Segunda a Sexta";
    if (eq(d, allWeekPlusSat)) return "Segunda a Sábado";
    if (d.length === 0) return "";
    return d.join(" • ");
  };

  const isDarkBg = getContrastColor(data.colors.canvas) === '#FFFFFF';
  const shouldInvertLogo = isDarkBg || ['IMPACTO', 'BOLD'].includes(style);
  const logoFilter = shouldInvertLogo ? 'brightness(0) invert(1)' : 'none';
  const isVertical = format === 'PORTRAIT' || format === 'STORY';

  // --- REUSABLE COMPONENTS ---

  const Logo = ({ className = "h-24", invert = false }) => (
    <div className={`relative z-30 flex items-center ${className} pointer-events-none`}>
        {data.images.logo ? (
            <img 
              src={data.images.logo} 
              alt="Logo" 
              className="h-full w-auto object-contain" 
              style={{ filter: invert ? 'brightness(0) invert(1)' : logoFilter }} 
            />
        ) : (
            <div className={`border-2 border-dashed p-4 rounded text-sm font-bold uppercase tracking-widest ${shouldInvertLogo || invert ? 'border-white text-white' : 'border-gray-400 text-gray-500'}`}>
                Logo Empresa
            </div>
        )}
    </div>
  );

  const HeroImage = ({ className = "", styleOverrides = {} }) => (
      data.images.hero ? (
        <div 
            className={`absolute overflow-hidden group z-10 ${className} pointer-events-auto`} 
            onMouseDown={onHeroDragStart}
            style={{ cursor: onHeroDragStart ? 'move' : 'default', ...styleOverrides }}
        >
            <img 
                src={data.images.hero} 
                className="absolute max-w-none transition-transform duration-700 hover:scale-105"
                style={{
                    transform: `translate(${data.heroPosition.x}px, ${data.heroPosition.y}px) scale(${data.heroPosition.scale})`,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    pointerEvents: 'none' // Important: Disable pointer events on IMG to avoid ghost dragging
                }}
                alt="Hero"
            />
        </div>
      ) : (
        <div className={`absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest ${className}`} style={{ ...styleOverrides }}>
            Imagem da Vaga
        </div>
      )
  );

  const DetailItem = ({ icon: Icon, label, value, color, bgColor }: any) => (
      <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl shrink-0 shadow-sm" style={{ backgroundColor: bgColor || `${data.colors.designElements}40` }}>
              <Icon size={format === 'STORY' ? 42 : 32} color={data.colors.icons} strokeWidth={1.5} />
          </div>
          <div>
              <p className={`text-xs font-bold uppercase opacity-70 mb-0.5 ${fonts.label}`} style={{ fontSize: getFontSize(12, 'meta'), color: color }}>{label}</p>
              <p className={`font-bold leading-tight ${fonts.body}`} style={{ fontSize: getFontSize(20, 'details'), color: color }}>{value}</p>
          </div>
      </div>
  );

  const TextBlock = ({ title, content, color, borderColor, scaleKey = 'activities' }: any) => {
      if (!content) return null;
      return (
        <div className="mb-8 last:mb-0">
            <h3 className={`font-bold uppercase tracking-wider mb-3 flex items-center gap-3 ${fonts.title}`} style={{ color: borderColor || data.colors.title, fontSize: getFontSize(20, 'details') }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: borderColor || data.colors.accent }}></span>
                {title}
            </h3>
            <p className={`whitespace-pre-wrap leading-relaxed opacity-95 ${fonts.body}`} 
               style={{ color: color || data.colors.text, fontSize: getFontSize(18, scaleKey) }}>
                {content}
            </p>
        </div>
      );
  };

  // --- LAYOUT RENDERERS ---

  const renderLayout = () => {
      switch (style) {
        
        // 1. CORPORATIVO
        case VisualStyle.CORPORATIVO:
            return (
                <div className="w-full h-full flex flex-col relative z-20">
                    <div className={`flex ${isVertical ? 'flex-col h-full' : 'flex-row h-full'}`}>
                        
                        <div className={`relative ${isVertical ? 'w-full h-[40%] order-1' : 'w-[45%] h-full order-2'} overflow-hidden`}>
                             <HeroImage className="w-full h-full" />
                             <div className={`absolute z-10 pointer-events-none ${isVertical ? 'bottom-0 left-0 w-full h-12 rounded-t-[3rem] translate-y-1' : 'top-0 left-0 h-full w-12 rounded-r-[3rem] -translate-x-1'}`}
                                  style={{ background: data.colors.canvas }}></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                        </div>

                        <div className={`flex-1 relative z-20 flex flex-col p-12 ${isVertical ? 'order-2 h-[60%]' : 'order-1 h-full'}`}
                             style={{ 
                                 background: data.colors.canvas,
                                 backgroundImage: data.colors.canvas === '#FFFFFF' && isVertical 
                                     ? `linear-gradient(160deg, #FFFFFF 0%, ${data.colors.primary}08 100%)` 
                                     : undefined
                             }}>
                            <div className="flex justify-between items-start mb-8">
                                <Logo />
                                <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider">Vaga</span>
                            </div>

                            <h1 className={`${fonts.title} font-bold leading-none mb-8`} style={{ fontSize: getFontSize(56, 'title'), color: data.colors.title }}>
                                {data.title}
                            </h1>

                            <div className="grid grid-cols-2 gap-6 mb-8 border-y border-slate-100 py-6">
                                <DetailItem icon={Wallet} label="Salário" value={data.salary} color={data.colors.text} />
                                <DetailItem icon={CalendarDays} label="Dias" value={getDaysDisplay()} color={data.colors.text} />
                                <DetailItem icon={MapPin} label="Local" value={data.location} color={data.colors.text} />
                                <DetailItem icon={Timer} label="Horário" value={data.schedule} color={data.colors.text} />
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                <TextBlock title="Atividades" content={data.description.activities} scaleKey="activities" />
                                {format !== 'SQUARE' && <TextBlock title="Requisitos" content={data.description.requirements} scaleKey="requirements" />}
                            </div>
                        </div>
                    </div>
                </div>
            );

        // 2. IMPACTO
        case VisualStyle.IMPACTO:
            return (
                <div className="w-full h-full flex flex-col relative bg-black text-white overflow-hidden z-20" style={{ backgroundColor: data.colors.primary }}>
                    <HeroImage className="w-full h-full opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

                    <div className="relative z-20 p-12 h-full flex flex-col justify-between pointer-events-none">
                         <div className="flex justify-between items-start pointer-events-auto">
                             <Logo invert={true} />
                             <div className="text-black font-black px-6 py-2 text-2xl uppercase -rotate-2 shadow-[4px_4px_0px_white]" style={{ backgroundColor: data.colors.accent }}>Hiring</div>
                         </div>

                         <div className="my-auto pointer-events-auto">
                            <h1 className={`${fonts.title} font-black uppercase italic leading-[0.85] text-white drop-shadow-2xl mb-10`} 
                                style={{ fontSize: getFontSize(85, 'title'), textShadow: '4px 4px 0px #000' }}>
                                {data.title}
                            </h1>
                            
                            <div className="bg-white/10 backdrop-blur-md border-l-8 p-8" style={{ borderColor: data.colors.accent }}>
                                 <div className="grid grid-cols-2 gap-y-10">
                                    <div className="col-span-2">
                                        <p className="font-bold text-xl uppercase mb-2" style={{ color: data.colors.accent }}>Requisitos</p>
                                        <p className="font-medium text-white leading-snug shadow-black drop-shadow-md" style={{ fontSize: getFontSize(24, 'requirements') }}>
                                            {data.description.requirements}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm uppercase" style={{ color: data.colors.accent }}>Salário</p>
                                        <p className="font-black text-3xl">{data.salary}</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm uppercase" style={{ color: data.colors.accent }}>Dias</p>
                                        <p className="font-black text-xl">{getDaysDisplay()}</p>
                                    </div>
                                 </div>
                            </div>
                         </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-4 bg-stripes-warning z-50 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-4 bg-stripes-warning z-50 pointer-events-none"></div>
                </div>
            );

        // 3. MODERNO
        case VisualStyle.MODERNO:
            const isStory = format === 'STORY';
            return (
                <div className="w-full h-full flex flex-col relative overflow-hidden z-20"
                     style={{ 
                         backgroundColor: data.colors.canvas,
                         backgroundImage: isVertical ? `linear-gradient(135deg, ${data.colors.canvas} 0%, ${data.colors.primary}05 100%)` : undefined
                     }}>
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full opacity-30 blur-[100px] pointer-events-none" style={{ backgroundColor: data.colors.primary }}></div>
                    
                    <div className={`flex flex-col h-full ${isStory ? '' : 'p-12'}`}>
                        <div className={`${isStory ? 'absolute top-10 left-10 z-40' : 'mb-8'}`}>
                            <Logo />
                        </div>

                        {isStory ? (
                             <div className="h-[45%] w-full relative overflow-hidden rounded-b-[3rem] shadow-2xl z-10 pointer-events-none">
                                 <HeroImage className="w-full h-full" />
                             </div>
                        ) : null}

                        <div className={`flex-1 ${isStory ? '-mt-12 px-8 pb-12 z-20' : 'grid grid-cols-12 gap-8'}`}>
                             <div className={`${isStory ? 'w-full h-full' : 'col-span-7'} glass-panel bg-white/60 backdrop-blur-xl border-white/60 shadow-xl rounded-[2rem] p-10 flex flex-col pointer-events-none`}>
                                 <h1 className={`${fonts.title} font-bold text-transparent bg-clip-text bg-gradient-to-r mb-8 leading-tight`} 
                                    style={{ 
                                        backgroundImage: `linear-gradient(to right, ${data.colors.title}, ${data.colors.text})`,
                                        fontSize: getFontSize(52, 'title') 
                                    }}>
                                    {data.title}
                                </h1>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <DetailItem icon={Wallet} label="Salário" value={data.salary} color={data.colors.text} bgColor="rgba(255,255,255,0.5)" />
                                    <DetailItem icon={CalendarDays} label="Dias" value={getDaysDisplay()} color={data.colors.text} bgColor="rgba(255,255,255,0.5)" />
                                    <DetailItem icon={Monitor} label="Modelo" value={data.workModel} color={data.colors.text} bgColor="rgba(255,255,255,0.5)" />
                                    <DetailItem icon={Timer} label="Horário" value={data.schedule} color={data.colors.text} bgColor="rgba(255,255,255,0.5)" />
                                </div>

                                <div className="flex-1 overflow-hidden border-t border-gray-200/30 pt-8">
                                     <TextBlock title="Sobre a Vaga" content={data.description.activities} scaleKey="activities" />
                                </div>
                             </div>

                             {!isStory && (
                                 <div className="col-span-5 relative h-full min-h-[300px]">
                                     <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 border-4 border-white hover:scale-105">
                                         <HeroImage className="w-full h-full" />
                                     </div>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            );

        // 4. CLEAN
        case VisualStyle.CLEAN:
            return (
                 <div className="w-full h-full flex flex-col relative p-10 font-sans z-20"
                      style={{ 
                          backgroundColor: data.colors.canvas,
                          backgroundImage: isVertical ? `linear-gradient(to bottom, ${data.colors.canvas} 0%, ${data.colors.primary}05 100%)` : undefined 
                      }}>
                     <div className="flex-1 border-[3px] border-dashed border-gray-300 rounded-[3rem] p-10 flex flex-col relative overflow-hidden bg-white/95 shadow-xl">
                        
                        <div className="flex flex-col items-center text-center mb-6 z-20 pointer-events-none">
                            <Logo className="h-20 mb-4" />
                            <h1 className={`${fonts.title} font-bold leading-tight mb-6`} style={{ fontSize: getFontSize(50, 'title'), color: data.colors.title }}>
                                {data.title}
                            </h1>
                        </div>

                        <div className="w-full flex justify-center mb-8 shrink-0 z-10">
                            <div className="relative rounded-full border-[8px] border-white shadow-lg overflow-hidden bg-gray-100 transition-transform hover:scale-110 duration-500" 
                                 style={{ width: format === 'STORY' ? '50%' : '40%', aspectRatio: '1/1' }}>
                                <HeroImage className="w-full h-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 z-20 mb-6 pointer-events-none">
                            <div className="bg-gray-50 p-4 rounded-2xl text-center">
                                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Salário</p>
                                <p className="font-bold text-gray-800 text-xl">{data.salary}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl text-center">
                                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Dias</p>
                                <p className="font-bold text-gray-800 text-sm">{getDaysDisplay()}</p>
                            </div>
                        </div>
                        
                        <div className="mt-2 text-center text-gray-600 z-20 flex-1 overflow-hidden pointer-events-none">
                            <p className="font-medium leading-relaxed" style={{ fontSize: getFontSize(18, 'activities'), color: data.colors.text }}>
                                {data.description.activities}
                            </p>
                        </div>

                     </div>
                 </div>
            );

        // 5. BOLD
        case VisualStyle.BOLD:
            const hasUserBg = !!data.images.background;
            return (
                <div className="w-full h-full flex flex-col relative z-20" 
                     style={{ backgroundColor: hasUserBg ? 'transparent' : data.colors.primary }}>
                     
                     {!hasUserBg && <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>}
                     
                     <div className="w-full h-[35%] relative overflow-hidden mask-image-b-gradient">
                         <HeroImage className="w-full h-full mix-blend-normal opacity-80" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                     </div>

                     <div className="relative z-20 px-12 pb-12 -mt-10 flex-1 flex flex-col pointer-events-none">
                        <div className="bg-white p-6 rounded-xl shadow-xl inline-block self-start mb-8 pointer-events-auto">
                            <Logo className="h-16" />
                        </div>
                        
                        <h1 className={`${fonts.title} font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-lg mb-8`} style={{ fontSize: getFontSize(75, 'title') }}>
                            {data.title}
                        </h1>

                        <div className="flex-1 bg-white text-black p-10 rounded-tr-[4rem] rounded-bl-[2rem] shadow-2xl relative pointer-events-auto">
                             <div className="grid grid-cols-1 gap-8 h-full">
                                 <div>
                                     <h3 className="font-black text-xl uppercase mb-4 flex items-center gap-2">
                                        <Briefcase className="text-black" /> Descrição
                                     </h3>
                                     <p className="font-medium leading-relaxed opacity-80" style={{ fontSize: getFontSize(20, 'activities') }}>
                                        {data.description.activities}
                                     </p>
                                 </div>
                                 <div className="mt-auto pt-6 border-t-4 border-black grid grid-cols-2 gap-4">
                                     <div>
                                         <p className="text-xs font-bold uppercase opacity-50 mb-1">Salário</p>
                                         <p className="text-2xl font-black">{data.salary}</p>
                                     </div>
                                     <div>
                                         <p className="text-xs font-bold uppercase opacity-50 mb-1">Dias</p>
                                         <p className="text-xl font-black">{getDaysDisplay()}</p>
                                     </div>
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            );
        
        // 6. MINIMALISTA
        case VisualStyle.MINIMALISTA:
             return (
                 <div className="w-full h-full flex flex-col relative p-16 text-slate-900 z-20"
                      style={{ 
                          backgroundColor: data.colors.canvas,
                          backgroundImage: isVertical ? `linear-gradient(170deg, ${data.colors.canvas} 0%, ${data.colors.accent}10 100%)` : undefined 
                      }}>
                     <div className="absolute top-0 right-0 w-[40%] h-[35%] opacity-20">
                         <HeroImage className="w-full h-full object-cover rounded-bl-[100px]" />
                     </div>

                     <div className="flex flex-col items-center text-center border-b-2 border-black pb-12 mb-12 relative z-10 pointer-events-none">
                         <Logo className="h-24 mb-8" />
                         <h1 className={`${fonts.title} font-light tracking-tight leading-none`} style={{ fontSize: getFontSize(60, 'title'), color: data.colors.title }}>
                             {data.title}
                         </h1>
                         <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium uppercase tracking-widest">
                             <span>{data.location}</span>
                             <span className="w-1.5 h-1.5 bg-black rounded-full self-center"></span>
                             <span>{data.workModel}</span>
                         </div>
                     </div>
                     
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 pointer-events-none">
                         <div className="text-2xl leading-relaxed font-serif text-gray-800 flex flex-col justify-center">
                             <p style={{ fontSize: getFontSize(24, 'activities'), color: data.colors.text }}>{data.description.activities}</p>
                         </div>
                         <div className="flex flex-col gap-8 justify-center border-l-2 border-gray-100 pl-10">
                             <div>
                                 <p className="font-bold text-xs uppercase text-gray-400 mb-2 tracking-widest">Remuneração</p>
                                 <p className="text-3xl font-light">{data.salary}</p>
                             </div>
                             <div>
                                 <p className="font-bold text-xs uppercase text-gray-400 mb-2 tracking-widest">Dias</p>
                                 <p className="text-xl font-light">{getDaysDisplay()}</p>
                             </div>
                             
                             <div className="w-full h-40 relative mt-4 grayscale opacity-90 rounded-lg overflow-hidden pointer-events-auto shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                                 <HeroImage className="w-full h-full object-cover" />
                             </div>
                         </div>
                     </div>
                 </div>
             );

        // 7. CRIATIVO
        case VisualStyle.CRIATIVO:
             const hasUserBgCreative = !!data.images.background;
             return (
                 <div className="w-full h-full flex flex-col relative overflow-hidden z-20"
                    style={{ backgroundColor: hasUserBgCreative ? 'transparent' : data.colors.canvas }}>
                     
                     {!hasUserBgCreative && (
                        <>
                            <div className="absolute top-0 right-0 w-[70%] h-[60%] rounded-bl-[300px] z-0 opacity-20 pointer-events-none" style={{ backgroundColor: data.colors.accent }}></div>
                            <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-tr-[200px] z-0 opacity-10 pointer-events-none" style={{ backgroundColor: data.colors.primary }}></div>
                        </>
                     )}
                     
                     <div className="relative z-20 p-12 h-full flex flex-col">
                        <div className="bg-white px-8 py-4 rounded-b-[2rem] shadow-sm self-start mb-8 border border-gray-100 pointer-events-none">
                             <Logo />
                        </div>

                        <div className="mb-10 relative pointer-events-none">
                             <h1 className={`${fonts.title} font-black text-slate-900 relative z-10 leading-[0.9] drop-shadow-sm`} style={{ fontSize: getFontSize(72, 'title'), color: data.colors.title }}>
                                 {data.title}
                             </h1>
                             <div className="absolute -bottom-2 left-0 w-40 h-4 -skew-x-12 opacity-60" style={{ backgroundColor: data.colors.accent }}></div>
                        </div>

                        <div className="flex-1 flex flex-col gap-6 pointer-events-none">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-[10px_10px_0px_rgba(0,0,0,0.1)] border-2 border-black relative overflow-hidden">
                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                    <DetailItem icon={Wallet} label="Salário" value={data.salary} color="black" />
                                    <DetailItem icon={CalendarDays} label="Dias" value={getDaysDisplay()} color="black" />
                                </div>
                                <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            </div>
                            
                            <div className="bg-white/80 p-8 rounded-[2rem] border-2 border-dashed border-gray-400 backdrop-blur-sm max-w-[80%]">
                                <p className="font-bold text-gray-700 leading-relaxed" style={{ fontSize: getFontSize(20, 'activities'), color: data.colors.text }}>
                                    {data.description.activities}
                                </p>
                            </div>
                        </div>
                     </div>
                     
                     <div className="absolute bottom-40 right-[-80px] w-[500px] h-[500px] rounded-full border-[12px] border-white shadow-2xl overflow-hidden z-20 transition-transform duration-500 hover:scale-105">
                         <HeroImage className="w-full h-full" styleOverrides={{ animation: 'none', transform: 'none' }} />
                     </div>
                 </div>
             );

        default: return null;
      }
  };

  return (
    <div 
      id={`${idPrefix}-${format}`}
      className="relative overflow-hidden flex flex-col shadow-2xl origin-top-left select-none bg-white group"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
        {/* GLOBAL BACKGROUND LAYER */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{ 
             backgroundColor: data.colors.canvas,
             ...(data.images.background && { 
                 backgroundImage: `url(${data.images.background})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             })
          }}
        >
             {data.images.background && (
                <div 
                    className="absolute inset-0 transition-all" 
                    style={{ 
                        backgroundColor: isDarkBg ? '#000' : '#FFF', 
                        opacity: data.bgOpacity 
                    }} 
                />
            )}
        </div>
        
        {renderLayout()}

        <div className={`absolute bottom-8 left-8 right-8 rounded-2xl overflow-hidden glass-panel border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] z-50 ${fonts.body} pointer-events-none`}>
             <div className="flex items-center justify-between p-5 relative">
                <div className="absolute inset-0 bg-white/30 opacity-60 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col justify-center h-full">
                    {data.contact.email && (
                        <div className="flex items-center gap-3 font-semibold mb-1" style={{ fontSize: getFontSize(18, 'contact') }}>
                            <div className="bg-white p-2 rounded-full text-slate-900 shadow-sm shrink-0"><Mail size={format === 'STORY' ? 24 : 18} /></div>
                            <span className={isDarkBg || style === 'IMPACTO' || style === 'BOLD' ? 'text-white drop-shadow-md' : 'text-slate-900'}>{data.contact.email}</span>
                        </div>
                    )}
                </div>

                {data.contact.whatsapp && (
                    <div className="relative z-10 flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg shrink-0"
                         style={{ fontSize: getFontSize(22, 'contact') }}>
                        <MessageCircle size={format === 'STORY' ? 32 : 24} fill="white" />
                        <span>{data.contact.whatsapp}</span>
                    </div>
                )}
             </div>
        </div>

    </div>
  );
};