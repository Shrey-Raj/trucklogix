"use client";

import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type DutyStatusChange = {
  time: string;
  location: string;
  status: 'Off Duty' | 'Sleeper Berth' | 'Driving' | 'On Duty (Not Driving)';
};

type TimelineSegment = {
  status: DutyStatusChange['status'];
  duration: number; // in minutes
  startTime: string;
  endTime: string;
  startMinutes: number;
};

const STATUS_COLORS: Record<DutyStatusChange['status'], string> = {
  'Driving': 'bg-primary',
  'On Duty (Not Driving)': 'bg-accent',
  'Sleeper Berth': 'bg-secondary',
  'Off Duty': 'bg-muted-foreground/50',
};

const timeStringToMinutes = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12) {
    hours = (modifier.toLowerCase() === 'a.m.' ? 0 : 12);
  } else if (modifier.toLowerCase() === 'p.m.') {
    hours += 12;
  }

  return hours * 60 + minutes;
};

export default function EldTimeline({ dutyStatusChanges }: { dutyStatusChanges: DutyStatusChange[] }) {
  const timelineSegments = useMemo((): TimelineSegment[] => {
    if (!dutyStatusChanges || dutyStatusChanges.length === 0) return [];
    
    const sortedChanges = [...dutyStatusChanges].sort((a, b) => timeStringToMinutes(a.time) - timeStringToMinutes(b.time));

    const segments: TimelineSegment[] = [];
    let lastMinute = 0;
    
    // Add segment from midnight to the first change
    segments.push({
      status: sortedChanges[0].status,
      duration: timeStringToMinutes(sortedChanges[0].time),
      startTime: '12:00 a.m.',
      endTime: sortedChanges[0].time,
      startMinutes: 0,
    });
    lastMinute = timeStringToMinutes(sortedChanges[0].time);


    for (let i = 0; i < sortedChanges.length - 1; i++) {
      const currentChange = sortedChanges[i];
      const nextChange = sortedChanges[i + 1];
      const startMinutes = timeStringToMinutes(currentChange.time);
      const endMinutes = timeStringToMinutes(nextChange.time);
      
      segments.push({
        status: nextChange.status,
        duration: endMinutes - startMinutes,
        startTime: currentChange.time,
        endTime: nextChange.time,
        startMinutes,
      });
      lastMinute = endMinutes;
    }

    // Add last segment to the end of the day
    const lastChange = sortedChanges[sortedChanges.length - 1];
    const lastChangeMinutes = timeStringToMinutes(lastChange.time);
    const endOfDayMinutes = 24 * 60;

    if (lastMinute < endOfDayMinutes) {
       segments.push({
        status: lastChange.status,
        duration: endOfDayMinutes - lastChangeMinutes,
        startTime: lastChange.time,
        endTime: '11:59 p.m.',
        startMinutes: lastChangeMinutes,
      });
    }

    return segments.filter(s => s.duration > 0);
  }, [dutyStatusChanges]);

  const totalMinutes = 24 * 60;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full p-4 border rounded-lg">
        <div className="relative flex w-full h-8 rounded-full bg-muted overflow-hidden">
          {timelineSegments.map((segment, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn('h-full', STATUS_COLORS[segment.status])}
                  style={{ width: `${(segment.duration / totalMinutes) * 100}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{segment.status}</p>
                <p className="text-sm text-muted-foreground">{`${segment.startTime} - ${segment.endTime}`}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>12 AM</span>
            <span>3 AM</span>
            <span>6 AM</span>
            <span>9 AM</span>
            <span>12 PM</span>
            <span>3 PM</span>
            <span>6 PM</span>
            <span>9 PM</span>
        </div>
        <div className='flex flex-wrap gap-4 mt-4'>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className='flex items-center gap-2 text-sm'>
                    <div className={cn('w-4 h-4 rounded-full', color)} />
                    <span>{status}</span>
                </div>
            ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
