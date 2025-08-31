import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Home,
  Bed,
  Bath,
  UtensilsCrossed,
  Sofa
} from 'lucide-react';

interface VirtualTourProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
}

const tourSpots: { id: string; name: string; icon: any; image?: string }[] = [
  { id: 'living', name: 'Living Room', icon: Sofa },
  { id: 'bedroom', name: 'Master Bedroom', icon: Bed },
  { id: 'kitchen', name: 'Kitchen', icon: UtensilsCrossed },
  { id: 'bathroom', name: 'Bathroom', icon: Bath },
  { id: 'entrance', name: 'Entrance', icon: Home },
];

export default function VirtualTour({ isOpen, onClose, propertyTitle }: VirtualTourProps) {
  const [currentSpot, setCurrentSpot] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextSpot = () => {
    setCurrentSpot((prev) => (prev + 1) % tourSpots.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    // Reset 360 view to default position
    console.log('Resetting view...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`p-0 ${isFullscreen ? 'max-w-full h-full' : 'max-w-6xl'}`}>
        <div className="relative bg-black">
          {/* Header */}
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <DialogTitle className="text-white">
              Virtual Tour - {propertyTitle}
            </DialogTitle>
          </DialogHeader>

          {/* Main 360 View */}
          <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 md:h-[600px]'}`}>
            {tourSpots[currentSpot].image ? (
              <img
                src={tourSpots[currentSpot].image}
                alt={`360° view of ${tourSpots[currentSpot].name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/80">
                No tour image available
              </div>
            )}
            
            {/* 360 View Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
            
            {/* Tour Instructions */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-center">
                <p className="text-sm">Drag to look around • Click hotspots to navigate</p>
              </div>
            </div>

            {/* Navigation Hotspots */}
            <div className="absolute top-20 left-20">
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 animate-pulse"
                onClick={nextSpot}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </Button>
            </div>
            
            <div className="absolute top-32 right-32">
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 animate-pulse"
                onClick={nextSpot}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              {/* Room Navigation */}
              <div className="flex items-center gap-2">
                {tourSpots.map((spot, index) => {
                  const IconComponent = spot.icon;
                  return (
                    <Button
                      key={spot.id}
                      variant={index === currentSpot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSpot(index)}
                      className={`${
                        index === currentSpot 
                          ? 'bg-white text-black' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {spot.name}
                    </Button>
                  );
                })}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetView}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Current Room Info */}
            <div className="mt-3">
              <Badge className="bg-white/20 text-white">
                Now viewing: {tourSpots[currentSpot].name}
              </Badge>
            </div>
          </div>

          {/* Loading State */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading 360° view...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
