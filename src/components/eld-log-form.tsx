"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EldLogSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { generateEldLogAction } from "@/lib/actions";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import type { EldLogOutput } from "@/ai/flows/eld-log-generation";
import { useState } from "react";

type EldLogFormProps = {
  onLogGenerated: (data: EldLogOutput) => void;
};

export default function EldLogForm({ onLogGenerated }: EldLogFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof EldLogSchema>>({
    resolver: zodResolver(EldLogSchema),
    defaultValues: {
      driverName: "John Doe",
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      truckNumber: "T-123",
      trailerNumber: "TR-456",
      carrierName: "Speedy Logistics",
      homeTerminalTimezone: "EST",
      shippingDocumentNumbers: "BOL #789123",
      currentLocation: "Newark, NJ",
      pickupLocation: "Richmond, VA",
      dropoffLocation: "Newark, NJ",
      cycleHoursUsed: 45,
      dutyStatusChanges: [
        { time: "6:00 a.m.", location: "Richmond, VA", status: "On Duty (Not Driving)" },
        { time: "7:30 a.m.", location: "Richmond, VA", status: "Driving" },
        { time: "10:00 a.m.", location: "Fredericksburg, VA", status: "On Duty (Not Driving)" },
        { time: "10:30 a.m.", location: "Fredericksburg, VA", status: "Driving" },
        { time: "1:00 p.m.", location: "Baltimore, MD", status: "Off Duty" },
        { time: "1:30 p.m.", location: "Baltimore, MD", status: "Driving" },
        { time: "9:00 p.m.", location: "Newark, NJ", status: "Off Duty" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dutyStatusChanges",
  });

  const onSubmit = async (values: z.infer<typeof EldLogSchema>) => {
    setIsSubmitting(true);
    const result = await generateEldLogAction(values);
    setIsSubmitting(false);

    if (result.error || !result.data) {
      toast({
        variant: "destructive",
        title: "Error Generating Log",
        description: result.error || "An unknown error occurred.",
      });
    } else {
      toast({
        title: "Log Generated Successfully",
        description: "Your ELD daily log is ready.",
      });
      onLogGenerated({
        logSheet: result.data.log_sheet,
        remainingHours: {
          drivingHours: result.data.remaining_hours.driving_hours,
          onDutyHours: result.data.remaining_hours.on_duty_hours,
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Daily Log</CardTitle>
        <CardDescription>Fill in the details to generate your ELD log for the day.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <fieldset className="grid grid-cols-1 gap-6 p-4 border rounded-lg md:grid-cols-2 lg:grid-cols-3">
              <legend className="px-1 text-sm font-medium text-muted-foreground">Driver & Trip Info</legend>
              <FormField control={form.control} name="driverName" render={({ field }) => (
                <FormItem><FormLabel>Driver Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="truckNumber" render={({ field }) => (
                <FormItem><FormLabel>Truck Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="trailerNumber" render={({ field }) => (
                <FormItem><FormLabel>Trailer Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="carrierName" render={({ field }) => (
                <FormItem><FormLabel>Carrier Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="homeTerminalTimezone" render={({ field }) => (
                <FormItem><FormLabel>Home Terminal Timezone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="shippingDocumentNumbers" render={({ field }) => (
                <FormItem><FormLabel>Shipping Documents</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="currentLocation" render={({ field }) => (
                <FormItem><FormLabel>End of Day Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                <FormItem><FormLabel>Pickup Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dropoffLocation" render={({ field }) => (
                <FormItem><FormLabel>Dropoff Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cycleHoursUsed" render={({ field }) => (
                <FormItem><FormLabel>Start of Day Cycle Hours</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </fieldset>

            <fieldset className="p-4 border rounded-lg">
                <legend className="px-1 text-sm font-medium text-muted-foreground">Duty Status Changes</legend>
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid items-start grid-cols-1 gap-4 p-4 rounded-md bg-muted/50 md:grid-cols-10">
                        <FormField control={form.control} name={`dutyStatusChanges.${index}.time`} render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Time</FormLabel><FormControl><Input placeholder="e.g., 7:30 a.m." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`dutyStatusChanges.${index}.location`} render={({ field }) => (
                            <FormItem className="md:col-span-4"><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., City, ST" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`dutyStatusChanges.${index}.status`} render={({ field }) => (
                            <FormItem className="md:col-span-3"><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Off Duty">Off Duty</SelectItem>
                                    <SelectItem value="Sleeper Berth">Sleeper Berth</SelectItem>
                                    <SelectItem value="Driving">Driving</SelectItem>
                                    <SelectItem value="On Duty (Not Driving)">On Duty (Not Driving)</SelectItem>
                                </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <div className="flex items-end h-full md:col-span-1">
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ time: "", location: "", status: "Off Duty" })}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Status Change
                </Button>
            </fieldset>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Log
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
