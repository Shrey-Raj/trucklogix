"use client";

import { useEffect, useState } from "react";
import { getEldLogHistory, getEldLogDetail, deleteEldLog } from "@/lib/actions";
import { EldLogResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"; 

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2, FileText } from "lucide-react";

export default function EldLogsListPage() {
  const [logs, setLogs] = useState<EldLogResponse[]>([]);
  const [selectedLog, setSelectedLog] = useState<EldLogResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<number | null>(null);

  const { toast } = useToast();

  // Fetch history on mount
  useEffect(() => {
    setLoading(true);
    getEldLogHistory()
      .then((res) => {
        if (res.error) {
          toast({
            variant: "destructive",
            title: "Error loading logs",
            description: res.error,
          });
        } else {
          setLogs(res.data || []);
        }
      })
      .catch(() =>
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Failed to load ELD logs.",
        })
      )
      .finally(() => setLoading(false));
  }, [toast]);

  const handleSelectLog = async (id: number) => {
    setLoading(true);
    setSelectedLog(null);
    const res = await getEldLogDetail(id);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setSelectedLog(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const res = await deleteEldLog(id);
    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setLogs((prev) => prev.filter((log) => log.id !== id));
      if (selectedLog?.id === id) setSelectedLog(null);
      toast({ variant:"default", title: "Log deleted", description: "The ELD log was removed." });
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">ELD Logs History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logs list */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Logs
            </CardTitle>
            <CardDescription>Click a log to view its details</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-full">
                <ul className="divide-y rounded-md border">
                  {logs.length === 0 && (
                    <li className="p-4 text-center text-muted-foreground">
                      No logs found.
                    </li>
                  )}
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 hover:cursor-pointer"
                      onClick={() => handleSelectLog(log.id)}
                    >
                      <div>
                        <button
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {log.driver_name} – {log.date}
                        </button>
                        <div className="text-xs text-muted-foreground">
                          {log.truck_number} | {log.carrier_name}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmDeleteLogId(log.id)}
                        disabled={deletingId === log.id}
                      >
                        {deletingId === log.id ? (
                          <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Log detail */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Log Detail</CardTitle>
            <CardDescription>
              {selectedLog
                ? `${selectedLog.driver_name} – ${selectedLog.date}`
                : "Select a log to view its details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {!selectedLog && (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No log selected
              </div>
            )}
            {selectedLog && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">
                  Truck: {selectedLog.truck_number} | Trailer:{" "}
                  {selectedLog.trailer_number}
                </div>
                <div>Carrier: {selectedLog.carrier_name}</div>
                <div>Home TZ: {selectedLog.home_terminal_timezone}</div>
                <div>Shipping Docs: {selectedLog.shipping_document_numbers}</div>
                <div>Location: {selectedLog.current_location}</div>
                <div>
                  Pickup: {selectedLog.pickup_location} | Dropoff:{" "}
                  {selectedLog.dropoff_location}
                </div>
                <div>Cycle Hours Used: {selectedLog.cycle_hours_used}</div>
                <div>
                  Remaining Hours – Driving:{" "}
                  {selectedLog.remaining_hours?.driving_hours ?? "-"} | On Duty:{" "}
                  {selectedLog.remaining_hours?.on_duty_hours ?? "-"}
                </div>
                <div className="pt-2">
                  <strong>Duty Status Changes:</strong>
                  <ul className="list-disc ml-5">
                    {selectedLog.duty_status_changes.map((change, idx) => (
                      <li key={idx}>
                        {change.time} – {change.status} @ {change.location}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3">
                  <strong>Log Sheet:</strong>
                  <ScrollArea className="mt-1 h-40 border rounded bg-muted p-2">
                    <pre className="text-xs">{selectedLog.log_sheet}</pre>
                  </ScrollArea>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    {/* Delete confirmation dialog */}
    <Dialog open={confirmDeleteLogId !== null} onOpenChange={(open) => {
      if (!open) setConfirmDeleteLogId(null);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this ELD log? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setConfirmDeleteLogId(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (confirmDeleteLogId != null) {
                await handleDelete(confirmDeleteLogId);
                setConfirmDeleteLogId(null);
              }
            }}
            disabled={deletingId === confirmDeleteLogId}
          >
            {deletingId === confirmDeleteLogId ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  );
}
