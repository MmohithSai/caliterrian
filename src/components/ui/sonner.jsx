import { Toaster as SonnerToaster } from "sonner";

export function Toaster(props) {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-[#0E2740] border-white/10 text-white",
          description: "text-[#92ABC4]",
          actionButton: "bg-[#8DB6D7] text-[#041C38]",
          cancelButton: "bg-[#2E4A66] text-white",
        },
      }}
      {...props}
    />
  );
}
