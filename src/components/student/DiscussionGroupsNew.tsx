import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useUnits } from "@/contexts/units/UnitsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Users, Calendar, GraduationCap, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiscussionPost {
  id: string;
  unitCode: string;
  author: string;
  authorId: string;
  title: string;
  content: string;
  timestamp: string;
  replies: DiscussionReply[];
}

interface DiscussionReply {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export const DiscussionGroups = () => {
  const { user, pendingUnitRegistrations } = useAuth();
  const { createdUnits } = useUnits();
  const { toast } = useToast();
  
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [replyContent, setReplyContent] = useState<{ [postId: string]: string }>({});

  // Mock discussion posts
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([
    {
      id: "1",
      unitCode: "CS101",
      author: "John Doe",
      authorId: "student1",
      title: "Question about Assignment 1",
      content: "I'm having trouble understanding the requirements for the first assignment. Can someone help clarify the expected output format?",
      timestamp: "2025-01-20T10:30:00Z",
      replies: [
        {
          id: "r1",
          author: "Jane Smith",
          authorId: "student2",
          content: "I had the same question! I think we need to output the results in JSON format based on the examples given.",
          timestamp: "2025-01-20T11:00:00Z"
        }
      ]
    }
  ]);

  // Get approved units for the current user
  const approvedRegistrations = pendingUnitRegistrations.filter(
    reg => reg.studentId === user?.id && reg.status === 'approved'
  );

  // Get units with discussion groups enabled
  const unitsWithDiscussion = approvedRegistrations.filter(reg => {
    const unit = createdUnits.find(u => u.code === reg.unitCode);
    return unit?.hasDiscussionGroup;
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !selectedUnit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a unit",
        variant: "destructive"
      });
      return;
    }

    const post: DiscussionPost = {
      id: Date.now().toString(),
      unitCode: selectedUnit,
      author: `${user?.firstName} ${user?.lastName}`,
      authorId: user?.id || "",
      title: newPost.title,
      content: newPost.content,
      timestamp: new Date().toISOString(),
      replies: []
    };

    setDiscussionPosts(prev => [post, ...prev]);
    setNewPost({ title: "", content: "" });
    setSelectedUnit("");
    setIsCreatePostOpen(false);

    toast({
      title: "Post Created",
      description: "Your discussion post has been added successfully"
    });
  };

  const handleAddReply = (postId: string) => {
    const content = replyContent[postId]?.trim();
    if (!content) return;

    const reply: DiscussionReply = {
      id: Date.now().toString(),
      author: `${user?.firstName} ${user?.lastName}`,
      authorId: user?.id || "",
      content: content,
      timestamp: new Date().toISOString()
    };

    setDiscussionPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, reply] }
        : post
    ));

    setReplyContent(prev => ({ ...prev, [postId]: "" }));

    toast({
      title: "Reply Added",
      description: "Your reply has been posted successfully"
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (approvedRegistrations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Discussion Groups</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Discussion Groups Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You need to have approved unit registrations to join discussion groups.
          </p>
        </div>
      </div>
    );
  }

  if (unitsWithDiscussion.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Discussion Groups</h2>
        </div>
        
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Discussion Groups Enabled</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            None of your units have discussion groups enabled yet.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Your registered units:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {approvedRegistrations.map((reg) => (
                <Badge key={reg.id} variant="outline">
                  {reg.unitCode} - {reg.unitName}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discussion Groups</h2>
          <p className="text-muted-foreground">
            Engage with classmates in unit-specific discussions
          </p>
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Discussion</DialogTitle>
              <DialogDescription>
                Start a new discussion topic for your classmates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                >
                  <option value="">Select a unit</option>
                  {unitsWithDiscussion.map(reg => (
                    <option key={reg.id} value={reg.unitCode}>
                      {reg.unitCode} - {reg.unitName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter discussion title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your thoughts, questions, or ideas..."
                  rows={5}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Create Discussion
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Units */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {unitsWithDiscussion.map(reg => (
          <Card key={reg.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{reg.unitCode}</div>
                  <div className="text-sm text-muted-foreground">{reg.unitName}</div>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="default">Discussion Active</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Discussion Posts */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Recent Discussions</h3>
        
        {discussionPosts.length > 0 ? (
          <div className="space-y-4">
            {discussionPosts.map(post => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>
                        By {post.author} in {post.unitCode} • {formatDate(post.timestamp)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{post.unitCode}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{post.content}</p>
                  
                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Replies ({post.replies.length})
                      </h4>
                      {post.replies.map(reply => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-3 h-3" />
                            <span className="text-sm font-medium">{reply.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Reply */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a reply..."
                        value={replyContent[post.id] || ""}
                        onChange={(e) => setReplyContent(prev => ({ 
                          ...prev, 
                          [post.id]: e.target.value 
                        }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddReply(post.id);
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleAddReply(post.id)}
                        disabled={!replyContent[post.id]?.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-muted-foreground">No discussions yet. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
};
