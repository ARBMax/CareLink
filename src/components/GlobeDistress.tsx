import React, { useMemo, useRef, useEffect, useState, memo } from 'react';
import Globe from 'react-globe.gl';
import { AnalysisReport } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, AlertTriangle, Zap, Target, Search, Navigation } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface GlobeDistressProps {
  report: AnalysisReport | null;
  isAnalyzing: boolean;
  isPhoneMode?: boolean;
}

export const GlobeDistress = memo(({ report, isAnalyzing, isPhoneMode }: GlobeDistressProps) => {
  const globeReRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setIsLocating(false);
        
        if (globeReRef.current) {
          globeReRef.current.pointOfView({ lat: coords.lat, lng: coords.lng, altitude: 1.5 }, 1500);
        }
      },
      (error) => {
        console.error("Error getting location", error);
        setIsLocating(false);
        // Note: Can't use alert in iframe easily, falling back to console
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const pointData = useMemo(() => {
    const data: any[] = [];
    
    if (report?.urgentNeeds) {
      const needs = report.urgentNeeds
        .filter(need => need.lat !== undefined && need.lng !== undefined)
        .map((need, idx) => ({
          id: `need-${idx}`,
          lat: need.lat!,
          lng: need.lng!,
          size: need.priority === 'Critical' ? 0.8 : need.priority === 'High' ? 0.6 : 0.4,
          color: need.priority === 'Critical' ? '#ff0055' : need.priority === 'High' ? '#ffaa00' : '#00ffff',
          label: need.location,
          priority: need.priority,
          desc: need.description,
          resource: need.resourceRequired,
          isUserLine: false
        }));
      data.push(...needs);
    }
    
    if (userLocation) {
      data.push({
        id: 'user-location',
        lat: userLocation.lat,
        lng: userLocation.lng,
        size: 0.9,
        color: '#00ff88', // Green for user
        label: 'Current Broadcast Origin',
        priority: 'Broadcast',
        desc: 'Live telemetry signal from ground-level operator.',
        resource: 'Data Uplink Established',
        isUserLine: true
      });
    }
    
    return data;
  }, [report, userLocation]);

  // Initial and reactive view control
  useEffect(() => {
    // Only auto-orient if we haven't set a user location, otherwise let them look around
    if (globeReRef.current && !userLocation) {
      if (pointData.length > 0) {
        const firstPoint = pointData[0];
        globeReRef.current.pointOfView({ lat: firstPoint.lat, lng: firstPoint.lng, altitude: 2 }, 2000);
      } else {
        globeReRef.current.controls().autoRotate = true;
        globeReRef.current.controls().autoRotateSpeed = 0.5;
        globeReRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
      }
    }
  }, [pointData, userLocation]);

    const [toggles, setToggles] = useState({
      triangulation: false,
      scan: false,
      density: false
    });

    const toggleAction = (actionId: 'triangulation' | 'scan' | 'density') => {
      setToggles(prev => ({ ...prev, [actionId]: !prev[actionId] }));
    };

    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 border-foreground/5 bg-foreground/[0.02] dark:bg-black/40 backdrop-blur-xl overflow-hidden relative min-h-[500px] rounded-3xl" ref={containerRef}>
          <div className="absolute top-6 left-6 z-10 space-y-2 pointer-events-none">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-primary/20 text-primary text-[9px] tracking-[0.2em] font-black px-3 py-1">
              GEOSPATIAL_SURVEILLANCE
            </Badge>
            <h3 className="text-xl font-black uppercase tracking-tighter opacity-80 flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              Impact Hotspots
            </h3>
          </div>

          <div className="w-full h-full flex items-center justify-center">
            {dimensions.width > 0 && (
              <Globe
                ref={globeReRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                pointsData={pointData}
                pointLat="lat"
                pointLng="lng"
                pointColor="color"
                pointAltitude={0.1}
                pointRadius="size"
                pointsMerge={true}
                pointLabel={(d: any) => `
                  <div class="p-4 rounded-xl bg-black/95 border border-white/10 backdrop-blur-xl font-mono text-[10px] max-w-[220px] shadow-2xl">
                    <div class="flex items-center gap-2 mb-2">
                       <div class="w-2 h-2 rounded-full" style="background-color: ${d.color}"></div>
                       <div class="font-black uppercase tracking-widest text-white">${d.label}</div>
                    </div>
                    <div class="flex items-center justify-between mb-3">
                       <span class="text-white/40 uppercase tracking-tighter">[LVL: ${d.priority}]</span>
                       <span class="text-primary/60 font-bold">${d.lat.toFixed(2)}, ${d.lng.toFixed(2)}</span>
                    </div>
                    <div class="text-white/80 leading-relaxed italic mb-3">"${d.desc}"</div>
                    <div class="pt-3 border-t border-white/5 text-primary uppercase font-bold tracking-[0.2em] flex items-center justify-between">
                       <span>ALLOC_REQ:</span>
                       <span class="text-white">${d.resource}</span>
                    </div>
                  </div>
                `}
                
                arcsData={pointData.length > 1 ? pointData.slice(0, -1).map((d, i) => ({
                    startLat: d.lat,
                    startLng: d.lng,
                    endLat: pointData[i+1].lat,
                    endLng: pointData[i+1].lng,
                    color: ['#00ffff', '#ff0055']
                })) : []}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={4}
                arcDashAnimateTime={2000}
                arcStroke={0.5}

                atmosphereColor="#00f3ff"
                atmosphereAltitude={0.15}
              />
            )}
          </div>

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Neural Mapping Active</div>
                    <div className="text-[9px] opacity-40 uppercase tracking-widest">Triangulating Distress Signals...</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-6 right-6 z-10 space-y-2 pointer-events-auto">
             <Button
               variant="outline"
               size="sm"
               onClick={handleLocateMe}
               disabled={isLocating}
               className="bg-black/60 backdrop-blur-md border-primary/20 hover:bg-primary/20 text-primary uppercase text-[9px] font-bold tracking-widest px-4 py-2"
             >
               <Navigation className={`mr-2 h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
               {isLocating ? 'Tracking...' : 'Broadcast Location'}
             </Button>
          </div>

          <div className="absolute bottom-6 left-6 z-10 flex flex-wrap gap-4 pointer-events-none">
             <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
               <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Telemetry Stream: OK</span>
             </div>
             <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl flex items-center gap-3">
               <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 text-white/50">Signals:</span>
               <span className="text-[9px] font-bold tracking-widest">{pointData.length}</span>
             </div>
          </div>
        </Card>

        <Card className="lg:col-span-1 border-foreground/5 bg-foreground/[0.02] dark:bg-black/40 backdrop-blur-xl flex flex-col rounded-3xl">
          <CardHeader className="pb-4 border-b border-foreground/5 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 flex items-center gap-2">
               <Search className="h-3 w-3" />
               Regional Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[430px]">
              <div className="p-4 space-y-3">
                {pointData.length > 0 ? pointData.map((point, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl border border-foreground/10 dark:border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => globeReRef.current?.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.5 }, 1200)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                       <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           point.priority === 'Critical' ? 'bg-red-500' : 
                           point.priority === 'High' ? 'bg-amber-500' : 'bg-primary'
                         } group-hover:animate-ping`}></div>
                         <span className="text-xs font-black uppercase tracking-tight truncate max-w-[120px]">{point.label}</span>
                       </div>
                       <Badge 
                        className={`text-[8px] font-bold px-1.5 py-0 border-none h-4 ${
                          point.priority === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                          point.priority === 'High' ? 'bg-amber-500/20 text-amber-500' : 
                          'bg-primary/20 text-primary'
                        }`}
                      >
                        {point.priority}
                      </Badge>
                    </div>
                    <p className="text-[10px] opacity-60 font-serif italic line-clamp-2 leading-relaxed mb-3">
                      {point.desc}
                    </p>
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
                       <div className="flex items-center gap-1.5 opacity-40">
                          <MapPin className="h-2.5 w-2.5" />
                          <span>{point.lat.toFixed(1)}°, {point.lng.toFixed(1)}°</span>
                       </div>
                       <div className="text-primary group-hover:translate-x-1 transition-transform">
                          REQ: {point.resource}
                       </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-20 flex flex-col items-center gap-4 opacity-20 text-center">
                    <Globe className="h-8 w-8 animate-pulse" />
                    <div className="text-[9px] uppercase tracking-[0.3em] font-black">
                      Neural Static Detected<br/>
                      <span className="font-normal opacity-50">No priority signatures found</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            type="button"
            onClick={() => toggleAction('triangulation')}
            className={`text-left p-6 rounded-3xl border flex flex-col gap-2 relative overflow-hidden group transition-all outline-none focus:ring-2 focus:ring-primary/50 ${toggles.triangulation ? 'bg-primary/10 border-primary/30' : 'bg-foreground/5 dark:bg-white/[0.02] border-foreground/10 dark:border-white/5 hover:bg-foreground/10 cursor-pointer'}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
               <AlertTriangle className="h-12 w-12" />
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Triangulation Precision</div>
            <div className={`text-2xl font-black italic tracking-tighter ${toggles.triangulation ? 'text-primary' : ''}`}>
               {toggles.triangulation ? 'MAX RES' : 'SEC_LVL_9'}
            </div>
            <p className="text-[9px] opacity-40 uppercase tracking-widest leading-relaxed">
              {toggles.triangulation ? 'Resolution locked geographically.' : 'Centroid mapping powered by Gemini 3.1 contextual extraction.'}
            </p>
          </button>

          <button 
            type="button"
            onClick={() => toggleAction('scan')}
            className={`text-left p-6 rounded-3xl border flex flex-col gap-2 relative overflow-hidden group transition-all outline-none focus:ring-2 focus:ring-primary/50 ${toggles.scan ? 'bg-primary/20 border-primary/40' : 'bg-primary/5 border-primary/10 hover:bg-primary/10 cursor-pointer'}`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
               <Zap className="h-12 w-12 text-primary" />
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 text-primary">Live Scan Status</div>
            <div className="text-2xl font-black italic tracking-tighter text-primary">
              {toggles.scan ? 'ENHANCED' : 'NOMINAL'}
            </div>
            <p className="text-[9px] opacity-40 uppercase tracking-widest leading-relaxed text-blue-900 dark:text-blue-200">
              {toggles.scan ? 'Actively filtering out neural static and low-priority signals.' : 'Continuous feed analysis currently maintaining green-light state.'}
            </p>
          </button>

          <button 
            type="button"
            onClick={() => toggleAction('density')}
            className={`text-left p-6 rounded-3xl border flex flex-col gap-2 relative overflow-hidden group transition-all outline-none focus:ring-2 focus:ring-primary/50 ${toggles.density ? 'bg-primary/10 border-primary/30' : 'bg-foreground/5 dark:bg-white/[0.02] border-foreground/10 dark:border-white/5 hover:bg-foreground/10 cursor-pointer'}`}
          >
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-magenta">
               <Target className="h-12 w-12" />
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Regional Signal Density</div>
            <div className={`text-2xl font-black italic tracking-tighter ${toggles.density ? 'text-primary' : ''}`}>
               {toggles.density ? 'HYPER LOCAL' : 'OPTIMIZED'}
            </div>
            <p className="text-[9px] opacity-40 uppercase tracking-widest leading-relaxed">
              {toggles.density ? 'Micro-targeting local social channels and grid reports.' : 'Aggregated signals from 400+ NGO datasets and news feeds.'}
            </p>
          </button>
      </div>
    </div>
  );
});

GlobeDistress.displayName = 'GlobeDistress';
