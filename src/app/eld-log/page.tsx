"use client";

import { useState } from "react";
import EldLogForm from "@/components/eld-log-form";
import EldLogDisplay from "@/components/eld-log-display";
import type { EldLogOutput } from "@/ai/flows/eld-log-generation";

export default function EldLogPage() {
  const [logData, setLogData] = useState<EldLogOutput | null>(null);

  const handleNewLog = () => {
    setLogData(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Electronic Logging Device (ELD)
        </h1>
        <p className="text-muted-foreground">
          Generate and manage your daily HOS logs.
        </p>
      </div>
      
      {!logData ? (
        <EldLogForm onLogGenerated={setLogData} />
      ) : (
        <EldLogDisplay logData={logData} onNewLog={handleNewLog} />
      )}
    </div>
  );
}
