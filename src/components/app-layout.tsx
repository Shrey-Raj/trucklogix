"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Truck, LayoutDashboard, List, UserCircle } from "lucide-react";
import { Button } from "./ui/button";

function TruckLogixLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-primary text-primary-foreground">
        <Truck className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold font-headline">TruckLogix</h1>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <TruckLogixLogo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip={{ children: "Dashboard" }}
              >
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/eld-log"}
                tooltip={{ children: "ELD Log" }}
              >
                <Link href="/eld-log">
                  <List />
                  <span>Create ELD Log</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/eld-logs-list"}
                tooltip={{ children: "ELD Logs List" }}
              >
                <Link href="/eld-logs-list">
                  <List />
                  <span>ELD Logs List</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
            <div className="flex items-center gap-2">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-semibold">Guest Driver</p>
                <p className="text-muted-foreground">Welcome!</p>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 bg-white border-b md:justify-end">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          {/* Placeholder for header actions */}
        </header>
        <main className="flex-1 p-4 overflow-auto md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
