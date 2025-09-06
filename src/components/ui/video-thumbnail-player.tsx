import * as React from "react";
import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";

// Interface for component props
interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  thumbnailUrl: string;
  videoUrl: string;
  title: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      className,
      thumbnailUrl,
      videoUrl,
      title,
      description,
      aspectRatio = "16/9",
      ...props
    },
    ref
  ) => {
    // State to manage the visibility of the video modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Effect to handle the 'Escape' key press for closing the modal
    React.useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }, []);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);


    return (
      <>
        <div
          ref={ref}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          style={{ aspectRatio }}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
          tabIndex={0}
          aria-label={`Play video: ${title}`}
          {...props}
        >
          {/* Thumbnail Image */}
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 group-hover:border-white/50">
              <Play className="h-8 w-8 fill-white text-white translate-x-0.5" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="absolute bottom-0 left-0 p-6 right-0">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
            {description && (
              <p className="text-sm text-white/80 line-clamp-2">{description}</p>
            )}
          </div>

          {/* Hover overlay for better UX */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Video Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in-0 duration-300"
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              // Close modal when clicking outside the video
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
              aria-label="Close video player"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Container */}
            <div className="w-full max-w-6xl mx-4">
              <div className="relative aspect-video w-full">
                <iframe
                  src={videoUrl}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full rounded-lg shadow-2xl"
                />
              </div>
              
              {/* Video info below */}
              <div className="mt-4 text-center">
                <h2 className="text-white text-xl font-semibold mb-1">{title}</h2>
                {description && (
                  <p className="text-white/80 text-sm">{description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);
VideoPlayer.displayName = "VideoPlayer";

export { VideoPlayer };
