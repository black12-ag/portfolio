import SearchForm, { SearchData } from './SearchForm';
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

interface HeroSectionProps {
  imageUrls?: string[];
}

export default function HeroSection({ imageUrls }: HeroSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearch = (searchData: SearchData) => {
    // Build URL params for search
    const params = new URLSearchParams();
    if (searchData.location) params.set('location', searchData.location);
    if (searchData.checkIn) params.set('checkIn', searchData.checkIn.toISOString());
    if (searchData.checkOut) params.set('checkOut', searchData.checkOut.toISOString());
    if (searchData.guests) params.set('guests', searchData.guests.toString());
    if (searchData.type) params.set('type', searchData.type);

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  // Build the images list: use provided urls only (no hardcoded fallbacks)
  const images = useMemo(
    () => imageUrls && imageUrls.length > 0 ? imageUrls : [],
    [imageUrls]
  );

  const [current, setCurrent] = useState(0);
  const [intervalMs, setIntervalMs] = useState(19000);

  // Read interval from settings (localStorage) so admin changes reflect
  useEffect(() => {
    const raw = localStorage.getItem('site-settings');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.slideshowIntervalSec) {
          setIntervalMs(Number(parsed.slideshowIntervalSec) * 1000);
        }
      } catch (error) {
        console.warn('Failed to parse site settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {images.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt="Hero background"
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/25"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 dark:bg-white/20 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-accent/20 dark:bg-accent/30 rounded-full animate-float animation-delay-1000 hidden lg:block"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-warning/20 rounded-full animate-float animation-delay-2000 hidden lg:block"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Text */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white dark:text-gray-100 leading-tight">
              {t("Hotels in")}
              <span className="block bg-gradient-to-r from-accent to-warning bg-clip-text text-transparent">
                {t("Addis Ababa")}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Discover the best hotels across Ethiopia's capital city. From international luxury chains to authentic local experiences.
            </p>
          </div>

          {/* Search Form */}
          <div className="animate-slide-up animation-delay-500">
            <SearchForm onSearch={handleSearch} className="max-w-5xl mx-auto" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-slide-up animation-delay-1000">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100">150+</div>
              <div className="text-sm text-white/80 dark:text-gray-300">Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100">8</div>
              <div className="text-sm text-white/80 dark:text-gray-300">Districts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100">21K+</div>
              <div className="text-sm text-white/80 dark:text-gray-300">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white dark:text-gray-100">15 hours</div>
              <div className="text-sm text-white/80 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 dark:border-gray-300/60 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 dark:bg-gray-200/80 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}