
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, FileText, Trophy, DollarSign, Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResearchProject {
  id: string;
  title: string;
  principalInvestigator: string;
  coInvestigators: string[];
  startDate: string;
  endDate: string;
  budget: number;
  status: "active" | "completed" | "on_hold" | "proposal";
  progress: number;
  fundingSource: string;
}

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  type: "journal" | "conference" | "book_chapter";
  status: "published" | "accepted" | "under_review" | "draft";
  impactFactor?: number;
}

export const ResearchCoordination = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("projects");

  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([
    {
      id: "1",
      title: "Sustainable Manufacturing Processes in TVET",
      principalInvestigator: "Dr. John Kamau",
      coInvestigators: ["Ms. Sarah Wanjiku", "Mr. Peter Ochieng"],
      startDate: "2024-01-15",
      endDate: "2025-12-31",
      budget: 2500000,
      status: "active",
      progress: 45,
      fundingSource: "Kenya National Research Fund"
    },
    {
      id: "2",
      title: "Digital Skills Integration in Technical Education",
      principalInvestigator: "Ms. Sarah Wanjiku",
      coInvestigators: ["Dr. John Kamau"],
      startDate: "2024-03-01",
      endDate: "2024-11-30",
      budget: 1800000,
      status: "active",
      progress: 65,
      fundingSource: "World Bank Education Project"
    },
    {
      id: "3",
      title: "Industry 4.0 Readiness Assessment",
      principalInvestigator: "Mr. Peter Ochieng",
      coInvestigators: [],
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      budget: 1200000,
      status: "proposal",
      progress: 10,
      fundingSource: "National Innovation Agency"
    }
  ]);

  const [publications, setPublications] = useState<Publication[]>([
    {
      id: "1",
      title: "Integrating Practical Skills in TVET Curriculum: A Kenyan Perspective",
      authors: ["Dr. John Kamau", "Ms. Sarah Wanjiku"],
      journal: "International Journal of Technical Education",
      publicationDate: "2024-05-15",
      type: "journal",
      status: "published",
      impactFactor: 2.3
    },
    {
      id: "2",
      title: "Digital Transformation in Technical Education",
      authors: ["Ms. Sarah Wanjiku", "Dr. John Kamau", "Mr. Peter Ochieng"],
      journal: "Africa Education Review",
      publicationDate: "2024-07-20",
      type: "journal",
      status: "accepted",
      impactFactor: 1.8
    },
    {
      id: "3",
      title: "Industry-Academia Partnerships in TVET",
      authors: ["Mr. Peter Ochieng"],
      journal: "Technical Education Conference 2024",
      publicationDate: "2024-09-10",
      type: "conference",
      status: "under_review"
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'on_hold':
        return <Badge className="bg-yellow-100 text-yellow-800">On Hold</Badge>;
      case 'proposal':
        return <Badge className="bg-purple-100 text-purple-800">Proposal</Badge>;
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'under_review':
        return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const activeProjects = researchProjects.filter(p => p.status === 'active').length;
  const totalBudget = researchProjects.reduce((sum, project) => sum + project.budget, 0);
  const publishedPapers = publications.filter(p => p.status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeProjects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Research Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{publishedPapers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Impact</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1</div>
            <p className="text-xs text-muted-foreground">Avg Impact Factor</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Research Projects
          </TabsTrigger>
          <TabsTrigger value="publications" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Publications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Research Projects
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </CardTitle>
              <CardDescription>
                Manage departmental research initiatives and funding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Title</TableHead>
                    <TableHead>Principal Investigator</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Funding Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {researchProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{project.title}</div>
                          <div className="text-sm text-gray-500">
                            {project.startDate} - {project.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{project.principalInvestigator}</TableCell>
                      <TableCell>{formatCurrency(project.budget)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="w-16" />
                          <span className="text-sm">{project.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell className="max-w-32 truncate">{project.fundingSource}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Research Publications
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Publication
                </Button>
              </CardTitle>
              <CardDescription>
                Track departmental research outputs and publications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Journal/Venue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Impact Factor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.map((publication) => (
                    <TableRow key={publication.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">{publication.title}</div>
                          <div className="text-sm text-gray-500">{publication.publicationDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate">
                          {publication.authors.join(", ")}
                        </div>
                      </TableCell>
                      <TableCell>{publication.journal}</TableCell>
                      <TableCell className="capitalize">{publication.type.replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(publication.status)}</TableCell>
                      <TableCell>
                        {publication.impactFactor ? publication.impactFactor.toFixed(1) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
