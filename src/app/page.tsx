import RoutePlanner from "@/components/route-planner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          Plan your trips and optimize your routes with ease.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Route Optimizer</CardTitle>
        </CardHeader>
        <CardContent>
          <RoutePlanner />
        </CardContent>
      </Card>
    </div>
  );
}
