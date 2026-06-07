"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarDivider } from "@/components/ui/sidebar";
import { SidebarLogo } from "@/components/sidebar/SidebarLogo";
import { SidebarNavLinks } from "@/components/sidebar/SidebarNavLinks";
import { SidebarBottom } from "@/components/sidebar/SidebarBottom";

export function SidebarWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between">
        <div className="flex flex-col h-full">
          <SidebarLogo open={open} />
          <SidebarDivider />
          <div className="px-2.5">
            <SidebarNavLinks />
          </div>
        </div>

        <div className="flex flex-col gap-2 pb-4">
          <div className="px-2.5">
            <SidebarBottom />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
