"use client";

import { useActionState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { optimizeRouteAction } from "@/lib/actions";
import { RouteSchema } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
import MapPlaceholder from "./map-placeholder";
import { Clock, Fuel, Bed, MapPin, Route, Gauge, Loader2, Sandwich } from "lucide-react";
import type { OptimizeRouteOutput } from "@/ai/flows/route-optimization";
import { parsePythonString } from "@/lib/utils";
import { useFormStatus } from "react-dom";

type RouteOptimizationState =
  | { data: null; error: string }
  | { data: OptimizeRouteOutput; error: null };

const initialState: RouteOptimizationState = {
  data: null,
  error: "",
};

const RouteMap = dynamic(() => import("./map-placeholder"), { ssr: false });


function RouteResults({ data }: { data: OptimizeRouteOutput }) {
  const [mapType, setMapType] = useState<"route" | "fuel" | "rest">("route");
  
  const route_coordinates = data.coordinates || {}; 
  const currentCoords = route_coordinates.current || [0, 0];
  const pickupCoords = route_coordinates.pickup || [0, 0];
  const dropoffCoords = route_coordinates.dropoff || [0, 0];
  const { toast } = useToast();
  
const routeLocations = useMemo(() => [
  {
    lat: currentCoords[1],
    lng: currentCoords[0],
    name: "Current Location"
  },
  {
    lat: pickupCoords[1],
    lng: pickupCoords[0],
    name: "Pickup Location"
  },
  {
    lat: dropoffCoords[1],
    lng: dropoffCoords[0],
    name: "Dropoff Location"
  },
], [currentCoords, pickupCoords, dropoffCoords]);

const [locations, setLocations] = useState(routeLocations);

const fuelLocations = useMemo(() =>
  data.fuelStops.map((f: string) => {
    const obj = parsePythonString(f);
    return {
      name: obj.name,
      lat: obj.coordinates[1],
      lng: obj.coordinates[0],
    };
  }), [data.fuelStops]);

const restLocations = useMemo(() =>
  data.restBreakStops.map((r: string) => {
    const obj = parsePythonString(r);
    return {
      name: obj.name,
      lat: obj.coordinates[1],
      lng: obj.coordinates[0],
    };
  }), [data.restBreakStops]);



  useEffect(() => {
    if (mapType === "fuel") {
      if (fuelLocations.length === 0) {
        toast({
          variant: "destructive",
          title: "No Fuel Stops",
          description: "No fuel stops found for this route.",
        });
        setLocations(routeLocations);
      } else {
        setLocations(fuelLocations);
        toast({
          variant: "default",
          title: "Fuel Stops",
          description: "Zoom near the Pickup, Dropoff, or Current Location to see the locations of fuel stops.",
        });
      }
    } else if (mapType === "rest") {
      if (restLocations.length === 0) {
        toast({
          variant: "destructive",
          title: "No Rest Stops",
          description: "No rest stops found for this route.",
        });
        setLocations(routeLocations);
      } else {
        setLocations(restLocations);
        toast({
          variant: "default",
          title: "Rest Stops",
          description: "Zoom near the Pickup, Dropoff, or Current Location to see the locations of rest stops.",
        });
      }
    } else {
      setLocations(routeLocations);
    }
  }, [mapType, fuelLocations, restLocations, routeLocations, toast]);

  return (
    <div className="grid gap-6 mt-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Route className="w-5 h-5 text-primary"/> Route Summary</CardTitle>
          <CardDescription>Estimated trip details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Est. Travel Time</span>
            <span className="font-semibold">{data.estimatedTravelTime}</span>
          </div>
           <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Gauge className="w-4 h-4" /> Est. Fuel Consumption</span>
            <span className="font-semibold">{data.estimatedFuelConsumption}</span>
          </div>
          <p className="p-3 text-sm rounded-md bg-muted">{data.optimizedRoute}</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-accent" /> Fuel Stops
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setMapType("fuel")}>
              Show on Map
            </Button>
          </CardHeader>
          <CardContent>
            <StopsTable title="Fuel Stops" stops={data.fuelStops} />
          </CardContent>

        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Sandwich className="w-5 h-5 text-accent" /> Rest Stops</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setMapType("rest")}>
              Show on Map
            </Button>
          </CardHeader>
          <CardContent>
           <StopsTable title="Rest Stops" stops={data.restBreakStops} />
          </CardContent>

        </Card>
      </div>

      <div className="md:col-span-2">
        <RouteMap locations={locations} />
          <Button 
            className="mt-4"
            variant={mapType === "fuel" ? "default" : "outline"}
            size="sm"
            onClick={() => setMapType("route")}
          >
            Show Destination Points
          </Button>
      </div>
    </div>
  )
}



export default function RoutePlanner() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(optimizeRouteAction, initialState);
  

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof RouteSchema>>({
    resolver: zodResolver(RouteSchema),
    defaultValues: {
      currentLocation: "",
      pickupLocation: "",
      dropoffLocation: "",
      currentCycleHoursUsed: 0,
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsLoading(true);
  }

  useEffect(() => {
    if (state.data || state.error) {
      setIsLoading(false);
    }
  }, [state.data, state.error]);

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", title: "Error", description: state.error });
    }
  }, [state.error, toast]);



  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <div>
      <Form {...form}>
        <form
          action={formAction}
          className="space-y-8"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="currentLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dallas, TX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicago, IL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dropoffLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropoff Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Los Angeles, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentCycleHoursUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cycle Hours Used</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={event => field.onChange(+event.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
             {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Optimize Route
          </Button>
        </form>
      </Form>

      {state.data && <RouteResults data={state.data} />}
    </div>
  );
}


type StopsTableProps = {
  title: string;
  stops: string[]; 
};

export function StopsTable({ title, stops }: StopsTableProps) {
  return (
    <div className="max-h-48 overflow-y-auto border rounded-lg">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-muted sticky top-0">
          <tr>
            <th className="text-left px-3 py-2 font-medium">#</th>
            <th className="text-left px-3 py-2 font-medium">{title}</th>
            <th className="text-left px-3 py-2 font-medium">Distance (m)</th>
          </tr>
        </thead>
        <tbody>
          {stops.map((stop, index) => {
            const obj = parsePythonString(stop);
            return (
              <tr
                key={index}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground capitalize" />
                  {obj.name}
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {obj.distance_meters
                    ? Number(obj.distance_meters).toFixed(2)
                    : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
