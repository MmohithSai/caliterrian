import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ChatBot from "@/components/ChatBot";
import TrialBookingModal from "@/components/TrialBookingModal";
import Home from "@/pages/Home";
import Programs from "@/pages/Programs";
import Coaches from "@/pages/Coaches";
import Transformations from "@/pages/Transformations";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";

function AppContent({ bookingOpen, setBookingOpen }) {
  const location = useLocation();
  return (
    <>
      <Navbar onBookTrial={() => setBookingOpen(true)} />
      <Routes>
        <Route path="/" element={<Home onBookTrial={() => setBookingOpen(true)} />} />
        <Route path="/programs" element={<Programs onBookTrial={() => setBookingOpen(true)} />} />
        <Route path="/coaches" element={<Coaches onBookTrial={() => setBookingOpen(true)} />} />
        <Route path="/transformations" element={<Transformations onBookTrial={() => setBookingOpen(true)} />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/pricing" element={<Pricing onBookTrial={() => setBookingOpen(true)} />} />
        <Route path="/contact" element={<Contact onBookTrial={() => setBookingOpen(true)} />} />
      </Routes>
      <Footer />
      <FloatingButtons onBookTrial={() => setBookingOpen(true)} />
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
          <AppContent bookingOpen={bookingOpen} setBookingOpen={setBookingOpen} />
        </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;
