import { Toaster as SonnerToaster } from "sonner";

export function Toaster(props) {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-[#1A1A1A] border-white/10 text-white",
          description: "text-zinc-400",
          actionButton: "bg-[#2EC4B6] text-white",
          cancelButton: "bg-zinc-700 text-white",
        },
      }}
      {...props}
    />
  );
}
