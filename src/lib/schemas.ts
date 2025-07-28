import { z } from "zod";

export const RouteSchema = z.object({
  currentLocation: z.string().min(3, "Current location is required."),
  pickupLocation: z.string().min(3, "Pickup location is required."),
  dropoffLocation: z.string().min(3, "Dropoff location is required."),
  currentCycleHoursUsed: z.coerce.number().min(0, "Hours must be a positive number."),
});

export const EldLogSchema = z.object({
  driverName: z.string().min(1, "Driver name is required"),
  date: z.string().min(1, "Date is required"),
  truckNumber: z.string().min(1, "Truck number is required"),
  trailerNumber: z.string().min(1, "Trailer number is required"),
  carrierName: z.string().min(1, "Carrier name is required"),
  homeTerminalTimezone: z.string().min(1, "Timezone is required"),
  shippingDocumentNumbers: z.string().min(1, "Shipping documents are required"),
  currentLocation: z.string().min(1, "Current location is required"),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropoffLocation: z.string().min(1, "Dropoff location is required"),
  cycleHoursUsed: z.coerce.number().min(0),
  dutyStatusChanges: z.array(z.object({
    time: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s(a\.m\.|p\.m\.)$/i, "Invalid time format (e.g., 7:30 a.m.)"),
    location: z.string().min(1, "Location is required"),
    status: z.enum(['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (Not Driving)']),
  })).min(1, "At least one duty status change is required"),
});
