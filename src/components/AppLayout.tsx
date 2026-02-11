import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "@/components/NavLink";
import { Sparkles, Search, Wand2, LayoutDashboard, LogOut, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/detect", label: "Detector", icon: Search },
  { to: "/humanize", label: "Humanizer", icon: Wand2 },
  { to: "/history", label: "History", icon: History },
];

function AppSidebarContent() {
  const { signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2.5 px-4 py-4 h-14">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary/20">
          <Sparkles className="h-4 w-4 text-sidebar-primary" />
        </div>
        {!collapsed && (
          <span className="text-base font-bold tracking-tight text-sidebar-primary-foreground">
            HumanizeAI
          </span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50 px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <NavLink
                        to={item.to}
                        end
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <Separator className="bg-sidebar-border" />

      <div className="p-3 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-1.5">
            <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Sign Out">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="h-5" />
            <PageTitle />
          </header>

          {/* Main content with scroll */}
          <ScrollArea className="flex-1">
            <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}

function PageTitle() {
  const location = useLocation();
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/detect": "AI Detector",
    "/humanize": "Text Humanizer",
    "/history": "History",
  };
  return (
    <h2 className="text-sm font-medium text-muted-foreground">
      {titles[location.pathname] || ""}
    </h2>
  );
}
