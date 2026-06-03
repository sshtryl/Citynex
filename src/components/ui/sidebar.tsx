"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  // Close mobile sidebar when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "relative h-full hidden md:flex md:flex-col bg-white dark:bg-[#171717] border-r border-gray-200 dark:border-gray-800",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "72px") : "260px",
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
      onMouseEnter={() => animate && setOpen(true)}
      onMouseLeave={() => animate && setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 z-50 flex md:hidden items-center justify-between p-4 bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 w-full"
        )}
        {...props}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IconMenu2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={cn(
                "fixed top-0 left-0 h-full w-[260px] bg-white dark:bg-[#171717] z-50 flex flex-col shadow-xl",
                className
              )}
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <IconX className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  
  const handleClick = (e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    }
  };

  return (
    <a
      href={link.href}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800/50",
        "text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    >
      <div className="shrink-0">{link.icon}</div>
      <motion.span
        animate={{
          opacity: animate && !open ? 0 : 1,
          display: animate && !open ? "none" : "inline-block",
        }}
        transition={{ duration: 0.15 }}
        className="text-sm font-medium whitespace-nowrap"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

export const SidebarSection = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  const { open, animate } = useSidebar();
  
  return (
    <div className="mt-6 first:mt-0">
      {title && (
        <motion.div
          animate={{
            opacity: animate && !open ? 0 : 1,
            height: animate && !open ? 0 : "auto",
          }}
          className="px-3 mb-2 overflow-hidden"
        >
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {title}
          </span>
        </motion.div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export const SidebarDivider = () => {
  return (
    <div className="my-4 h-px bg-gray-200 dark:bg-gray-800" />
  );
};