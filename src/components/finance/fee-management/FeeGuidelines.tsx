
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export const FeeGuidelines = () => {
  const guidelines = [
    {
      title: "Supplementary Exam",
      amount: "KSh 2,000",
      description: "For students who missed main exams",
      color: "text-green-600"
    },
    {
      title: "Special Exam",
      amount: "KSh 1,500",
      description: "For special circumstances",
      color: "text-blue-600"
    },
    {
      title: "Unit Retake",
      amount: "KSh 5,000",
      description: "For repeating a unit",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {guidelines.map((guideline) => (
        <Card key={guideline.title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${guideline.color}`} />
              {guideline.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${guideline.color}`}>{guideline.amount}</div>
            <p className="text-sm text-gray-600">{guideline.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
