"use client";
import {
  Bot,
  CreditCard,
  LayoutDashboardIcon,
  MessageSquare,
  PlusIcon,
  Presentation,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";

const item = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meeting",
    url: "/meeting",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Chat",
    url: "/chat",
    icon: MessageSquare,
  },
];

export function AppSideBar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const { project, projects, projectId, setProjectId } = useProject();
  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <h1
            className={`p-2 text-xl font-bold text-primary/80 ${
              open ? "visible" : "invisible"
            } whitespace-nowrap`}
          >
            GIT-AI
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}

          <SidebarContent>
            <SidebarMenu>
              {item.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        {
                          "!bg-primary !text-white": pathname === item.url,
                        },
                        "list-none",
                      )}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <div
                      onClick={() => {
                        setProjectId(item.id);
                        redirect("/dashboard");
                      }}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                          { "bg-primary text-white": item.id === projectId },
                        )}
                      >
                        {item.name[0]}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create"}>
                    <Button size="sm" variant={"outline"} className="w-fit">
                      <PlusIcon />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
