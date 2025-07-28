import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EldTimeline, { type DutyStatusChange } from "./eld-timeline";
import type { EldLogOutput } from "@/ai/flows/eld-log-generation";
import { FileText, Hourglass, PlusCircle } from "lucide-react";

type EldLogDisplayProps = {
  logData: EldLogOutput;
  onNewLog: () => void;
};

export default function EldLogDisplay({ logData, onNewLog }: EldLogDisplayProps) {

  const parseDutyStatusChanges = (logText: string): DutyStatusChange[] => {
    const lines = logText.split('\n');
    const changes: DutyStatusChange[] = [];
    const regex = /- Time: (.*?),\s*Location: (.*?),\s*Status: (.*)/;
  
    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        changes.push({
          time: match[1].trim(),
          location: match[2].trim(),
          status: match[3].trim() as any, // Cast because we trust the AI output format
        });
      }
    }
    return changes;
  };
  
  const dutyStatusChanges = parseDutyStatusChanges(logData.logSheet);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">Generated Daily Log</h2>
          <Button onClick={onNewLog} variant="default">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Log
          </Button>
      </div>

      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Hourglass className="w-5 h-5 text-primary" /> Remaining Hours Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Driving Hours Available</p>
                  <p className="text-3xl font-bold text-primary">{logData.remainingHours.drivingHours} hrs</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">On-Duty Hours Available</p>
                  <p className="text-3xl font-bold text-primary">{logData.remainingHours.onDutyHours} hrs</p>
              </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary"/> Generated Log Sheet</CardTitle>
            <CardDescription>This is the formatted log sheet based on your inputs.</CardDescription>
        </CardHeader>
        <CardContent>
            <EldTimeline dutyStatusChanges={dutyStatusChanges} />
            <pre className="w-full p-4 mt-4 overflow-x-auto text-sm rounded-md bg-muted font-code whitespace-pre-wrap">
                {logData.logSheet}
            </pre>
        </CardContent>
      </Card>
    </div>
  );
}
