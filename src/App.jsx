import { useState, lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ChatBot from "@/components/ChatBot";
import TrialBookingModal from "@/components/TrialBookingModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trackBookTrial } from "@/lib/analytics";

// Each public page is code-split into its own chunk so the initial load only
// ships the shell + the landing route, not all 10 pages at once.
const Home = lazy(() => import("@/pages/Home"));
const Programs = lazy(() => import("@/pages/Programs"));
const Coaches = lazy(() => import("@/pages/Coaches"));
const Transformations = lazy(() => import("@/pages/Transformations"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Contact = lazy(() => import("@/pages/Contact"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin is code-split out of the public bundle.
const AdminApp = lazy(() => import("@/admin/AdminApp"));

// Shown while a route chunk loads — a quiet brand-colored screen, no flash.
const PageSkeleton = () => <div className="min-h-screen bg-obsidian" />;

function AppContent({ bookingOpen, setBookingOpen }) {
  const location = useLocation();

  // Single entry point for every "Book Trial" CTA — tracks the click (tagged
  // with the page it fired from) before opening the modal.
  const openBooking = () => {
    trackBookTrial(location.pathname);
    setBookingOpen(true);
  };

  // The /admin area is a self-contained app: no public Navbar/Footer/ChatBot.
  if (location.pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <Toaster position="top-right" />
      </Suspense>
    );
  }

  return (
    <>
      <Navbar onBookTrial={openBooking} />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home onBookTrial={openBooking} />} />
          <Route path="/programs" element={<Programs onBookTrial={openBooking} />} />
          <Route path="/coaches" element={<Coaches onBookTrial={openBooking} />} />
          <Route path="/transformations" element={<Transformations onBookTrial={openBooking} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/pricing" element={<Pricing onBookTrial={openBooking} />} />
          <Route path="/contact" element={<Contact onBookTrial={openBooking} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <FloatingButtons onBookTrial={openBooking} />
      <ChatBot />
      <TrialBookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <div className="App min-h-screen bg-obsidian text-white">
      <HelmetProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppContent bookingOpen={bookingOpen} setBookingOpen={setBookingOpen} />
          </ErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;
