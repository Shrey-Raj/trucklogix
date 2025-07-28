"use server";

import { OptimizeRouteOutput } from "@/ai/flows/route-optimization";
import { routeApi, eldLogApi } from "./api";
import { RouteSchema, EldLogSchema } from "./schemas";
import { z } from "zod";

type RouteOptimizationState =
  | { data: null; error: string }
  | { data: OptimizeRouteOutput; error: null };

export async function optimizeRouteAction(
  prevState: RouteOptimizationState,
  formData: FormData
): Promise<RouteOptimizationState> {
  const validatedFields = RouteSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      data: null,
      error: "Invalid input. Please check your entries.",
    };
  }

  try {
    const result = await routeApi.optimize({
      current_location: validatedFields.data.currentLocation,
      pickup_location: validatedFields.data.pickupLocation,
      dropoff_location: validatedFields.data.dropoffLocation,
      current_cycle_hours_used: validatedFields.data.currentCycleHoursUsed,
    });

    // Transform the response to match OptimizeRouteOutput
    const transformedResult: OptimizeRouteOutput = {
      optimizedRoute: result.optimized_route,
      fuelStops: result.fuel_stops.map(stop => stop.location),
      restBreakStops: result.rest_break_stops.map(stop => stop.location),
      estimatedTravelTime: result.estimated_travel_time,
      estimatedFuelConsumption: result.estimated_fuel_consumption,
      coordinates: {
        current: result.coordinates.current || [0, 0],
        pickup: result.coordinates.pickup || [0, 0],
        dropoff: result.coordinates.dropoff || [0, 0],
      },
    };

    return { data: transformedResult, error: null };
  } catch (error) {
    console.error("Error optimizing route:", error);
    return {
      data: null,
      error: "Failed to optimize route. Please try again.",
    };
  }
}

export async function generateEldLogAction(data: z.infer<typeof EldLogSchema>) {
    const validatedFields = EldLogSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            data: null,
            error: "Invalid input. Please check your entries."
        }
    }

    try {
        const result = await eldLogApi.generate({
            driver_name: validatedFields.data.driverName,
            date: validatedFields.data.date,
            truck_number: validatedFields.data.truckNumber,
            trailer_number: validatedFields.data.trailerNumber,
            carrier_name: validatedFields.data.carrierName,
            home_terminal_timezone: validatedFields.data.homeTerminalTimezone,
            shipping_document_numbers: validatedFields.data.shippingDocumentNumbers,
            current_location: validatedFields.data.currentLocation,
            pickup_location: validatedFields.data.pickupLocation,
            dropoff_location: validatedFields.data.dropoffLocation,
            cycle_hours_used: validatedFields.data.cycleHoursUsed,
            duty_status_changes: validatedFields.data.dutyStatusChanges.map((change, index) => ({
                time: change.time,
                location: change.location,
                status: change.status,
                order: index,
            })),
        });
        
        // Transform the response to match the expected format
        const transformedResult = {
            logSheet: result.log_sheet,
            remainingHours: result.remaining_hours,
        };
        
        return { data: result, error: null };
    } catch (error) {
        console.error("Error generating ELD log:", error);
        return { data: null, error: "Failed to generate ELD log. Please try again." };
    }
}

// ELD Log History
export async function getEldLogHistory() {
  try {
    const result = await eldLogApi.getHistory();
    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching ELD log history:", error);
    return { data: null, error: "Failed to fetch ELD log history. Please try again." };
  }
}

// ELD Log Detail
export async function getEldLogDetail(id: number) {
  try {
    const result = await eldLogApi.getDetail(id);
    return { data: result, error: null };
  } catch (error) {
    console.error("Error fetching ELD log detail:", error);
    return { data: null, error: "Failed to fetch ELD log detail. Please try again." };
  }
}

// ELD Log Delete
export async function deleteEldLog(id: number) {
  try {
    await eldLogApi.delete(id);
    return { data: true, error: null };
  } catch (error) {
    console.error("Error deleting ELD log:", error);
    return { data: null, error: "Failed to delete ELD log. Please try again." };
  }
}

