import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  MapPin, 
  BriefcaseMedical, 
  Truck, 
  Wrench, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { AnalysisReport } from "@/types";

interface VolunteerMatcherProps {
  report: AnalysisReport;
}

// Generate some mock volunteers to match against the report's urgent needs
const SIMULATED_VOLUNTEER_DATABASE = [
  { id: 'v1', name: 'Dr. Sarah Chen', role: 'Medical First Responder', status: 'Available', distance: '1.2km', skills: ['Medical', 'Triage'], icon: BriefcaseMedical, rating: 4.9 },
  { id: 'v2', name: 'Marcus Johnson', role: 'Logistics Coordinator', status: 'In Transit', distance: '3.5km', skills: ['Logistics', 'Driving'], icon: Truck, rating: 4.7 },
  { id: 'v3', name: 'Elena Rodriguez', role: 'Community Liaison', status: 'Available', distance: '0.8km', skills: ['Translation', 'Local Ops'], icon: MessageSquare, rating: 5.0 },
  { id: 'v4', name: 'David Kim', role: 'Structural Engineer', status: 'Available', distance: '5.1km', skills: ['Engineering', 'Safety Check'], icon: Wrench, rating: 4.8 },
  { id: 'v5', name: 'Aisha Patel', role: 'General Volunteer', status: 'Available', distance: '2.0km', skills: ['Distribution', 'Support'], icon: Users, rating: 4.5 },
];

const PROFESSION_TYPES = [
  { role: 'Medical First Responder', skills: ['Medical', 'Triage'], icon: BriefcaseMedical },
  { role: 'Logistics Coordinator', skills: ['Logistics', 'Driving'], icon: Truck },
  { role: 'Structural Engineer', skills: ['Engineering', 'Safety Check'], icon: Wrench },
  { role: 'Community Liaison', skills: ['Translation', 'Local Ops'], icon: MessageSquare },
  { role: 'Security Personnel', skills: ['Security', 'Crowd Control'], icon: ShieldCheck },
  { role: 'General Volunteer', skills: ['Distribution', 'Support'], icon: Users },
];

export function VolunteerMatcher({ report }: VolunteerMatcherProps) {
  const [volunteers, setVolunteers] = useState(SIMULATED_VOLUNTEER_DATABASE);
  const [assignedMatches, setAssignedMatches] = useState<Record<string, string[]>>({});
  const [newVolName, setNewVolName] = useState('');
  const [newVolProfession, setNewVolProfession] = useState('');

  const handleAddVolunteer = () => {
    if (!newVolName.trim() || !newVolProfession) return;

    const profIdx = PROFESSION_TYPES.findIndex(p => p.role === newVolProfession);
    const profInfo = profIdx >= 0 ? PROFESSION_TYPES[profIdx] : PROFESSION_TYPES[PROFESSION_TYPES.length - 1];

    const newVol = {
      id: `v-custom-${Date.now()}`,
      name: newVolName.trim(),
      role: profInfo.role,
      status: 'Available',
      distance: (Math.random() * 5 + 0.5).toFixed(1) + 'km',
      skills: profInfo.skills,
      icon: profInfo.icon,
      rating: 5.0
    };

    setVolunteers(prev => [newVol, ...prev]);
    setNewVolName('');
    setNewVolProfession('');
  };

  const handleAssign = (needIndex: number, volunteerId: string) => {
    setAssignedMatches(prev => {
      const current = prev[needIndex] || [];
      if (current.includes(volunteerId)) {
        return { ...prev, [needIndex]: current.filter(id => id !== volunteerId) };
      }
      return { ...prev, [needIndex]: [...current, volunteerId] };
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      <div className="text-center space-y-3 mb-10">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight uppercase">Smart Resource Allocation</h2>
        <p className="text-xs opacity-60 uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
          Autonomously matching urgent community tasks with properly vetted, geographically available volunteer networks.
        </p>
      </div>

      <Card className="border border-foreground/10 bg-black/5 dark:bg-white/5 overflow-hidden mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm tracking-widest uppercase">Register New Volunteer</CardTitle>
          <CardDescription className="text-xs">Add field personnel to the active database for immediate task assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="vol-name" className="text-[10px] uppercase tracking-widest opacity-60">Volunteer Name</Label>
              <Input 
                id="vol-name" 
                placeholder="e.g. Jane Doe" 
                value={newVolName}
                onChange={(e) => setNewVolName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="vol-prof" className="text-[10px] uppercase tracking-widest opacity-60">Profession Type</Label>
              <Select value={newVolProfession} onValueChange={setNewVolProfession}>
                <SelectTrigger id="vol-prof" className="bg-background">
                  <SelectValue placeholder="Select Profession..." />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSION_TYPES.map(prof => (
                    <SelectItem key={prof.role} value={prof.role}>{prof.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAddVolunteer} 
              disabled={!newVolName || !newVolProfession}
              className="w-full md:w-auto uppercase tracking-widest text-xs h-10 px-6"
            >
              Add to Network
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {report.urgentNeeds.map((need, i) => {
          // Simplistic mock logic: medical needs match medical volunteers, etc.
          const localString = (need.resourceRequired + need.description).toLowerCase();
          const suggestedVols = volunteers.filter(v => {
            if (localString.includes('medic') || localString.includes('health') || localString.includes('aid')) return v.skills.includes('Medical');
            if (localString.includes('transport') || localString.includes('food') || localString.includes('water')) return v.skills.includes('Logistics') || v.skills.includes('Distribution');
            return true; // fallback
          }).slice(0, 3); // top 3 matches

          const assignedToThis = assignedMatches[i] || [];

          return (
            <Card key={`vol-match-${i}`} className="border border-foreground/5 bg-foreground/[0.02] overflow-hidden">
              <div className="md:grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-foreground/5">
                
                {/* Task Details */}
                <div className="col-span-5 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[9px] uppercase font-bold border-none ${
                        need.priority === 'Critical' ? 'bg-red-500/20 text-red-500' :
                        need.priority === 'High' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-blue-500/20 text-blue-500'
                    }`}>
                      {need.priority} TASK
                    </Badge>
                    <span className="text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {need.location}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight">{need.resourceRequired}</h3>
                  <p className="text-xs opacity-60 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                    "{need.description}"
                  </p>
                </div>

                {/* Volunteer Matching Panel */}
                <div className="col-span-7 bg-white/5 dark:bg-black/20 p-6">
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Available Local Matches</h4>
                    <span className="text-[10px] font-mono text-primary font-bold">
                      {assignedToThis.length} DEPLOYED
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {suggestedVols.map((vol, vIdx) => {
                      const isAssigned = assignedToThis.includes(vol.id);
                      
                      return (
                        <div 
                          key={`vol-${vol.id}-${vIdx}`}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isAssigned 
                              ? 'bg-primary/10 border-primary/30' 
                              : 'bg-foreground/5 border-foreground/5 hover:border-foreground/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isAssigned ? 'bg-primary text-black' : 'bg-foreground/10 text-foreground'}`}>
                              <vol.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isAssigned ? 'text-primary' : ''}`}>{vol.name}</span>
                                {vol.rating >= 4.8 && (
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] opacity-60 uppercase tracking-widest mt-0.5">
                                <span>{vol.role}</span>
                                <span>&bull;</span>
                                <span>{vol.distance}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant={isAssigned ? "default" : "outline"}
                            onClick={() => handleAssign(i, vol.id)}
                            className={`h-8 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all ${
                              isAssigned ? 'bg-primary text-black' : 'border-foreground/10'
                            }`}
                          >
                            {isAssigned ? (
                              <>
                                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                                Deployed
                              </>
                            ) : (
                              "Assign"
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
