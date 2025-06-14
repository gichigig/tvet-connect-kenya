
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Users, Search, Send, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiscussionGroup {
  id: string;
  unitCode: string;
  unitName: string;
  lecturer: string;
  memberCount: number;
  lastActivity: string;
  description: string;
  isPinned: boolean;
}

interface Discussion {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  isLecturer: boolean;
}

const discussionGroups: DiscussionGroup[] = [
  {
    id: "1",
    unitCode: "PROG101",
    unitName: "Introduction to Programming",
    lecturer: "Dr. John Kamau",
    memberCount: 45,
    lastActivity: "2 hours ago",
    description: "Discussion forum for programming fundamentals, assignments, and Q&A",
    isPinned: true
  },
  {
    id: "2",
    unitCode: "OOP201",
    unitName: "Object Oriented Programming",
    lecturer: "Dr. Sarah Kimani",
    memberCount: 38,
    lastActivity: "5 hours ago",
    description: "Object-oriented programming concepts, Java discussions, and project help",
    isPinned: false
  },
  {
    id: "3",
    unitCode: "WEB301",
    unitName: "Web Development",
    lecturer: "Ms. Grace Wanjiru",
    memberCount: 42,
    lastActivity: "1 day ago",
    description: "Web development technologies, frameworks, and project showcase",
    isPinned: true
  }
];

const sampleDiscussions: Discussion[] = [
  {
    id: "1",
    author: "Dr. John Kamau",
    message: "Welcome to the PROG101 discussion group! Please introduce yourselves and share your programming experience.",
    timestamp: "2 days ago",
    isLecturer: true
  },
  {
    id: "2",
    author: "Alice Wanjiku",
    message: "Hi everyone! I'm new to programming but excited to learn. Looking forward to working with you all!",
    timestamp: "2 days ago",
    isLecturer: false
  },
  {
    id: "3",
    author: "John Mwangi",
    message: "Can someone help me with the Python loops assignment? I'm having trouble with the nested loops part.",
    timestamp: "3 hours ago",
    isLecturer: false
  },
  {
    id: "4",
    author: "Dr. John Kamau",
    message: "Great question John! Remember that nested loops execute the inner loop completely for each iteration of the outer loop. I'll post some examples in the resources section.",
    timestamp: "2 hours ago",
    isLecturer: true
  }
];

export const DiscussionGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<DiscussionGroup | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const filteredGroups = discussionGroups.filter(group =>
    group.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.unitCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = (groupId: string) => {
    const group = discussionGroups.find(g => g.id === groupId);
    if (group) {
      toast({
        title: "Joined Discussion Group",
        description: `You've joined the discussion group for ${group.unitCode}`,
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup) {
      toast({
        title: "Message Sent",
        description: "Your message has been posted to the discussion group",
      });
      setNewMessage("");
    }
  };

  if (selectedGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedGroup(null)}>
              ← Back to Groups
            </Button>
            <h2 className="text-2xl font-bold">{selectedGroup.unitCode} Discussion</h2>
            <p className="text-gray-600">{selectedGroup.unitName}</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {selectedGroup.memberCount} members
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{selectedGroup.lecturer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedGroup.lecturer}</h3>
                  <p className="text-sm text-gray-600">Course Lecturer</p>
                </div>
              </div>
              {selectedGroup.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
            </div>
            <p className="text-sm text-gray-700">{selectedGroup.description}</p>
          </CardHeader>
        </Card>

        {/* Discussion Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sampleDiscussions.map((discussion) => (
                <div key={discussion.id} className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={discussion.isLecturer ? "bg-blue-100" : "bg-gray-100"}>
                      {discussion.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{discussion.author}</span>
                      {discussion.isLecturer && (
                        <Badge variant="secondary" className="text-xs">Lecturer</Badge>
                      )}
                      <span className="text-xs text-gray-500">{discussion.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{discussion.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="mt-6 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discussion Groups</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search discussion groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Discussion Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{group.unitCode}</CardTitle>
                  {group.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.memberCount}
                </Badge>
              </div>
              <CardDescription>{group.unitName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{group.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-blue-100 text-xs">
                    {group.lecturer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{group.lecturer}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last activity: {group.lastActivity}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery ? "No discussion groups found matching your search." : "No discussion groups available."}
          </p>
        </div>
      )}
    </div>
  );
};
