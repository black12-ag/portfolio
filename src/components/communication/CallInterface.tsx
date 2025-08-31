import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff,
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Monitor,
  MoreHorizontal,
  Minimize2,
  Maximize2,
  Settings,
  Signal,
  Clock,
  User,
  Camera,
  CameraOff
} from 'lucide-react';
import { CallSession, NetworkQuality } from '@/services/communication/voiceCallService';
import { VideoCallSession } from '@/services/communication/videoCallService';

export interface CallInterfaceProps {
  callSession: CallSession | VideoCallSession;
  isIncoming?: boolean;
  onCallEnd: () => void;
  onCallAccept?: () => void;
  onCallDecline?: () => void;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  networkQuality?: NetworkQuality;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  callSession,
  isIncoming = false,
  onCallEnd,
  onCallAccept,
  onCallDecline,
  localStream,
  remoteStream,
  networkQuality
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // State management
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (callSession.status === 'active' && callSession.startTime) {
      interval = setInterval(() => {
        const duration = Date.now() - callSession.startTime!.getTime();
        setCallDuration(Math.floor(duration / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callSession.status, callSession.startTime]);

  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get network quality color
  const getNetworkQualityColor = (quality?: NetworkQuality['quality']) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get participant name
  const getParticipantName = () => {
    if (callSession.type === 'video' && 'participants' in callSession) {
      const remoteParticipant = callSession.participants.find(p => p.id !== callSession.callerId);
      return remoteParticipant?.name || 'Unknown User';
    }
    return 'Unknown User';
  };

  // Incoming call interface
  if (isIncoming && callSession.status === 'ringing') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className={`w-full max-w-sm mx-4 ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <CardContent className="p-8 text-center">
            {/* Caller Avatar */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            {/* Caller Info */}
            <div className="mb-6">
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {getParticipantName()}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Incoming {callSession.type} call...
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>

            {/* Call Actions */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onCallDecline}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={onCallAccept}
                className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active call interface
  return (
    <div className={`fixed inset-0 z-50 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-900'
    } ${isMinimized ? 'w-80 h-60 bottom-4 right-4 top-auto left-auto rounded-lg' : ''}`}>
      
      {/* Video Display */}
      {callSession.type === 'video' && !isMinimized && (
        <div className="relative w-full h-full">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden bg-gray-800 border-2 border-white">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror local video
            />
          </div>

          {/* Screen Sharing Indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-red-500 text-white">
                <Monitor className="w-3 h-3 mr-1" />
                Screen Sharing
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Audio Call Display */}
      {callSession.type === 'voice' && !isMinimized && (
        <div className="flex flex-col items-center justify-center h-full p-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-8">
            <User className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          
          {/* Caller Info */}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {getParticipantName()}
          </h2>
          <p className="text-gray-400 mb-8">
            {callSession.status === 'connecting' ? 'Connecting...' : 
             callSession.status === 'active' ? formatDuration(callDuration) : 
             callSession.status}
          </p>

          {/* Audio Visualizer */}
          <div className="flex items-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-blue-500 rounded-full animate-pulse ${
                  i % 2 === 0 ? 'h-4' : 'h-6'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Call Status Bar */}
      <div className={`absolute top-0 left-0 right-0 p-4 ${
        callSession.type === 'video' ? 'bg-black/50' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Call Duration */}
            {callSession.status === 'active' && (
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(callDuration)}
              </Badge>
            )}

            {/* Network Quality */}
            {networkQuality && (
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Signal className={`w-3 h-3 mr-1 ${getNetworkQualityColor(networkQuality.quality)}`} />
                {networkQuality.quality}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Minimize Button */}
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 ${
        callSession.type === 'video' ? 'bg-black/50' : ''
      }`}>
        <div className="flex items-center justify-center gap-4">
          {/* Audio Mute */}
          <Button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            variant={isAudioMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>

          {/* Video Toggle (for video calls) */}
          {callSession.type === 'video' && (
            <Button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              variant={isVideoMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full w-14 h-14"
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
          )}

          {/* Speaker Toggle (for voice calls) */}
          {callSession.type === 'voice' && (
            <Button
              onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
              variant={isSpeakerEnabled ? "default" : "secondary"}
              size="lg"
              className="rounded-full w-14 h-14"
            >
              {isSpeakerEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </Button>
          )}

          {/* Camera Switch (for video calls) */}
          {callSession.type === 'video' && (
            <Button
              onClick={() => {
                // Handle camera switch
                console.log('Switch camera');
              }}
              variant="secondary"
              size="lg"
              className="rounded-full w-14 h-14"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          )}

          {/* End Call */}
          <Button
            onClick={onCallEnd}
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          {/* More Options */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="secondary"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        </div>

        {/* Network Quality Indicator */}
        {networkQuality && (
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              <Signal className={`w-4 h-4 ${getNetworkQualityColor(networkQuality.quality)}`} />
              <span>
                {networkQuality.rtt}ms • {networkQuality.quality} connection
              </span>
            </div>
            {networkQuality.quality === 'poor' && (
              <p className="text-xs text-red-400 mt-1">
                Poor connection may affect call quality
              </p>
            )}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute bottom-20 right-6 w-64 bg-black/80 backdrop-blur-sm rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Audio Quality</span>
              <select className="bg-gray-700 text-white text-xs rounded px-2 py-1">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            
            {callSession.type === 'video' && (
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Video Quality</span>
                <select className="bg-gray-700 text-white text-xs rounded px-2 py-1">
                  <option>1080p</option>
                  <option>720p</option>
                  <option>480p</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Noise Reduction</span>
              <input type="checkbox" className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Echo Cancellation</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Call Status Messages */}
      {callSession.status === 'connecting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Connecting...</p>
        </div>
      )}

      {callSession.status === 'failed' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-red-400 mb-4">Call failed to connect</p>
          <Button onClick={onCallEnd} variant="outline" className="text-white border-white">
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

export default CallInterface;
