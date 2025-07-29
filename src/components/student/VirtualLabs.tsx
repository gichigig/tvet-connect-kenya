import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FlaskConical, Microscope, Cpu, Heart, Play, Clock, Star, Trophy, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

interface VirtualLab {
  id: string;
  title: string;
  domain: 'science' | 'engineering' | 'medical';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learning_objectives: string[];
  created_at: string;
  is_active: boolean;
}

interface Experiment {
  id: string;
  lab_id: string;
  title: string;
  description: string;
  simulation_url: string;
  max_score: number;
  time_limit_minutes: number;
  created_at: string;
}

interface ExperimentAttempt {
  id: string;
  experiment_id: string;
  score: number;
  completed_at: string;
  status: string;
}

const VirtualLabs = () => {
  const { user } = useAuth();
  const [labs, setLabs] = useState<VirtualLab[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [attempts, setAttempts] = useState<ExperimentAttempt[]>([]);
  const [selectedLab, setSelectedLab] = useState<VirtualLab | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    // Listen for labs
    const labsRef = collection(db, 'virtual_labs');
    const labsQuery = query(labsRef, where('is_active', '==', true), orderBy('created_at', 'desc'));
    const unsubLabs = onSnapshot(labsQuery, (snapshot) => {
      setLabs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VirtualLab[]);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching labs:', error);
      toast.error('Failed to load virtual labs');
      setLoading(false);
    });

    // Listen for attempts
    const attemptsRef = collection(db, 'experiment_attempts');
    const attemptsQuery = query(attemptsRef, where('student_id', '==', user.id));
    const unsubAttempts = onSnapshot(attemptsQuery, (snapshot) => {
      setAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ExperimentAttempt[]);
    }, (error) => {
      console.error('Error fetching attempts:', error);
    });

    return () => {
      unsubLabs();
      unsubAttempts();
    };
  }, [user]);

  const fetchExperiments = (labId: string) => {
    const db = getFirestore(firebaseApp);
    const experimentsRef = collection(db, 'experiments');
    const experimentsQuery = query(experimentsRef, where('lab_id', '==', labId));
    const unsub = onSnapshot(experimentsQuery, (snapshot) => {
      setExperiments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Experiment[]);
    }, (error) => {
      console.error('Error fetching experiments:', error);
      toast.error('Failed to load experiments');
    });
    // Optionally return unsub for cleanup if needed
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

  const startExperiment = async (experiment: Experiment) => {
    if (!user) return;
    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, 'experiment_attempts'), {
        experiment_id: experiment.id,
        student_id: user.id,
        status: 'in_progress',
        completed_at: null,
        score: null
      });
      if (experiment.simulation_url) {
        window.open(experiment.simulation_url, '_blank');
      }
      toast.success('Experiment started successfully!');
    } catch (error) {
      console.error('Error starting experiment:', error);
      toast.error('Failed to start experiment');
    }
  };

  const filteredLabs = labs.filter(lab => {
    if (activeTab === 'all') return true;
    return lab.domain === activeTab;
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
                        {getDomainIcon(lab.domain)}
                        <CardTitle className="text-lg">{lab.title}</CardTitle>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-white ${getDifficultyColor(lab.difficulty)}`}
                      >
                        {lab.difficulty}
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
                      <h4 className="font-medium text-sm">Learning Objectives:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {lab.learning_objectives?.slice(0, 3).map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setSelectedLab(lab);
                            fetchExperiments(lab.id);
                          }}
                        >
                          View Experiments
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getDomainIcon(selectedLab?.domain || '')}
                            {selectedLab?.title}
                          </DialogTitle>
                          <DialogDescription>
                            {selectedLab?.description}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {experiments.map((experiment) => {
                              const score = getAttemptScore(experiment.id);
                              const isCompleted = attempts.some(
                                attempt => attempt.experiment_id === experiment.id && attempt.status === 'completed'
                              );

                              return (
                                <Card key={experiment.id}>
                                  <CardHeader>
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">{experiment.title}</CardTitle>
                                      {isCompleted && (
                                        <div className="flex items-center gap-1">
                                          <Trophy className="h-4 w-4 text-yellow-500" />
                                          <span className="text-sm font-medium">{score}/{experiment.max_score}</span>
                                        </div>
                                      )}
                                    </div>
                                    <CardDescription>{experiment.description}</CardDescription>
                                  </CardHeader>
                                  
                                  <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {experiment.time_limit_minutes} minutes
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {experiment.max_score} points
                                      </div>
                                    </div>

                                    <Button 
                                      className="w-full"
                                      onClick={() => startExperiment(experiment)}
                                      disabled={!experiment.simulation_url}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      {isCompleted ? 'Retry Experiment' : 'Start Experiment'}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>

                          {experiments.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              No experiments available for this lab yet.
                            </div>
                          )}
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