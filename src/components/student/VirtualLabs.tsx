import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FlaskConical, Microscope, Cpu, Heart, Play, Clock, Star, Trophy, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { firebaseApp } from "@/integrations/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VirtualLab {
  id: string;
  name: string;
  description: string;
  category: string;
  unit_code: string;
  access_url: string;
  instructions: string;
  duration_minutes: number;
  difficulty_level: string;
  created_at: string;
}

interface Experiment {
  id: string;
  lab_id: string;
  user_id: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  results?: any;
  created_at: string;
}

const VirtualLabs = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState<VirtualLab[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [selectedLab, setSelectedLab] = useState<VirtualLab | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
    fetchAttempts();
  }, []);

  const fetchLabs = async () => {
    try {
      const { data, error } = await supabase
        .from('virtual_labs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLabs(data || []);
    } catch (error) {
      console.error('Error fetching labs:', error);
      toast.error('Failed to load virtual labs');
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiments = async (labId: string) => {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('lab_id', labId);

      if (error) throw error;
      setExperiments(data || []);
    } catch (error) {
      console.error('Error fetching experiments:', error);
      toast.error('Failed to load experiments');
    }
  };

  const fetchAttempts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'science':
        return <FlaskConical className="h-5 w-5" />;
      case 'engineering':
        return <Cpu className="h-5 w-5" />;
      case 'medical':
        return <Heart className="h-5 w-5" />;
      default:
        return <Microscope className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAttemptScore = (experimentId: string) => {
    return attempts.find(attempt => attempt.experiment_id === experimentId)?.score;
  };

  const getCompletedExperiments = (labId: string) => {
    const labExperiments = experiments.filter(exp => exp.lab_id === labId);
    const completedCount = labExperiments.filter(exp => 
      attempts.some(attempt => attempt.experiment_id === exp.id && attempt.status === 'completed')
    ).length;
    return { completed: completedCount, total: labExperiments.length };
  };

  const startExperiment = async (lab: VirtualLab) => {
    if (!user) return;

    try {
      // Create experiment record
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          lab_id: lab.id,
          user_id: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Open simulation in new window/iframe
      if (lab.access_url) {
        window.open(lab.access_url, '_blank');
      }
      
      toast.success('Experiment started successfully!');
      fetchAttempts();
    } catch (error) {
      console.error('Error starting experiment:', error);
      toast.error('Failed to start experiment');
    }
  };

  const filteredLabs = labs.filter(lab => {
    if (activeTab === 'all') return true;
    return lab.category === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Virtual Labs & Simulations</h2>
          <p className="text-muted-foreground">
            Interactive experiments across Science, Engineering, and Medical domains
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Labs</TabsTrigger>
          <TabsTrigger value="science">Science</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab) => {
              const progress = getCompletedExperiments(lab.id);
              const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

              return (
                <Card key={lab.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDomainIcon(lab.category)}
                        <CardTitle className="text-lg">{lab.name}</CardTitle>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-white ${getDifficultyColor(lab.difficulty_level)}`}
                      >
                        {lab.difficulty_level}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {lab.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.completed}/{progress.total} experiments</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Instructions:</h4>
                      <p className="text-sm text-muted-foreground">
                        {lab.instructions || 'No specific instructions provided'}
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => startExperiment(lab)}
                        >
                          Start Lab
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getDomainIcon(selectedLab?.category || '')}
                            {selectedLab?.name}
                          </DialogTitle>
                          <DialogDescription>
                            {selectedLab?.description}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="text-center py-8 text-muted-foreground">
                            Lab simulation will open in a new window when you click "Start Lab".
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredLabs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No virtual labs available for the selected domain.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualLabs;