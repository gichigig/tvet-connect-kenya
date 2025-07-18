
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, Hand, Monitor } from "lucide-react";

interface OnlineClassFormProps {
  onAddOnlineClass: (onlineClass: any) => void;
}

export const OnlineClassForm = ({ onAddOnlineClass }: OnlineClassFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60); // minutes
  const [googleLink, setGoogleLink] = useState("");
  const [allowScreenShare, setAllowScreenShare] = useState(true);
  const [allowHandRaising, setAllowHandRaising] = useState(true);
  const [recordSession, setRecordSession] = useState(false);

  const handleSubmit = () => {
    const onlineClass = {
      type: "online_class",
      title,
      description,
      scheduledDate,
      duration,
      googleLink,
      features: {
        liveAudio: true,
        screenShare: allowScreenShare,
        handRaising: allowHandRaising,
        recording: recordSession
      },
      isLive: true,
      status: "scheduled",
      createdAt: new Date().toISOString()
    };
    onAddOnlineClass(onlineClass);
    // Reset form
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(60);
    setGoogleLink("");
    setAllowScreenShare(true);
    setAllowHandRaising(true);
    setRecordSession(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Video className="w-4 h-4 mr-2" />
            Schedule Online Class
          </div>
          <Badge variant="outline" className="text-green-600">
            <Mic className="w-3 h-3 mr-1" />
            Live Audio
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Class Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lecture: Introduction to..."
            />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="15"
              max="180"
            />
          </div>
        </div>

        <div>
          <Label>Scheduled Date & Time</Label>
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </div>

        <div>
          <Label>Class Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will be covered in this class?"
            rows={3}
          />
        </div>
        <div>
          <Label>Google Meet/Class Link</Label>
          <Input
            type="url"
            value={googleLink}
            onChange={e => setGoogleLink(e.target.value)}
            placeholder="https://meet.google.com/xyz-abc-def"
          />
        </div>

        <div className="space-y-4">
          <Label>Interactive Features</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">Screen Sharing</p>
                  <p className="text-sm text-gray-600">Allow students to share their screens</p>
                </div>
              </div>
              <Switch
                checked={allowScreenShare}
                onCheckedChange={setAllowScreenShare}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Hand className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">Hand Raising</p>
                  <p className="text-sm text-gray-600">Allow students to raise hands for questions</p>
                </div>
              </div>
              <Switch
                checked={allowHandRaising}
                onCheckedChange={setAllowHandRaising}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Video className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium">Record Session</p>
                  <p className="text-sm text-gray-600">Save recording for later access</p>
                </div>
              </div>
              <Switch
                checked={recordSession}
                onCheckedChange={setRecordSession}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Schedule Online Class
        </Button>
      </CardContent>
    </Card>
  );
};
