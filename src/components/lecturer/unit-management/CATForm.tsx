
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Trash2 } from "lucide-react";

interface CATFormProps {
  onAddCAT: (cat: any) => void;
}

export const CATForm = ({ onAddCAT }: CATFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(30); // minutes
  const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const cat = {
      type: "cat",
      title,
      description,
      scheduledDate,
      duration,
      questions,
      isLive: true,
      createdAt: new Date().toISOString()
    };
    
    onAddCAT(cat);
    
    // Reset form
    setTitle("");
    setDescription("");
    setScheduledDate("");
    setDuration(30);
    setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Add New CAT (Timed Multiple Choice)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>CAT Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CAT title"
            />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="5"
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
          <Label>Instructions</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="CAT instructions and guidelines"
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Questions</Label>
            <Button onClick={handleAddQuestion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
          
          {questions.map((q, qIndex) => (
            <Card key={qIndex} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <Label>Question {qIndex + 1}</Label>
                  {questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Input
                  value={q.question}
                  onChange={(e) => handleUpdateQuestion(qIndex, "question", e.target.value)}
                  placeholder="Enter question"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctAnswer === oIndex}
                        onChange={() => handleUpdateQuestion(qIndex, "correctAnswer", oIndex)}
                      />
                      <Input
                        value={option}
                        onChange={(e) => handleUpdateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Schedule CAT
        </Button>
      </CardContent>
    </Card>
  );
};
