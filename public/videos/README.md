# Video Files

## Instructions

Place your hotel booking website demo video in this folder with the filename:
`hotel-booking-demo.mp4`

## Video Requirements

### **Optimal Settings:**
- **Format**: MP4 (H.264 codec)
- **Duration**: 3-6 minutes (sweet spot for attention span)
- **Size**: **10-25MB** (optimal for web)
- **Quality**: 1080p (1920x1080) or 720p (1280x720)
- **Frame Rate**: 24-30 FPS
- **Bitrate**: 2-5 Mbps for good quality/size balance

### **Size Guidelines:**
- ✅ **10-15MB**: Excellent (fast loading)
- ✅ **15-25MB**: Good (reasonable loading)
- ⚠️ **25-40MB**: Acceptable (slower loading)
- ❌ **40MB+**: Too large (poor user experience)

## Current Video Setup

The portfolio is configured to look for:
- **File**: `/videos/hotel-booking-demo.mp4`
- **Thumbnail**: Auto-generated or you can add a custom thumbnail
- **Features**: 
  - Built-in video player with controls
  - Download functionality
  - Fullscreen support
  - Progress bar and time display

## Adding Your Video

1. Place your video file as `hotel-booking-demo.mp4` in this directory
2. The video will automatically appear in the "Project Showcase" section
3. Users can watch it inline or download it directly
4. The video includes technology tags and project information

## Optional: Custom Thumbnail

If you want a custom video thumbnail, add:
`hotel-booking-thumbnail.jpg` (1920x1080 recommended)

Then update the `thumbnailUrl` in `/src/pages/Portfolio.tsx` to:
```typescript
thumbnailUrl: '/videos/hotel-booking-thumbnail.jpg'
```

## Video Optimization Tips

### **If Your Video is Too Large:**

**Option 1: Online Compression (Easy)**
- Use https://www.freeconvert.com/video-compressor
- Upload your video and compress to target 15-20MB
- Choose "Custom" settings: 720p, 3-4 Mbps bitrate

**Option 2: HandBrake (Free Software)**
1. Download HandBrake (free)
2. Use "Web Optimized" preset
3. Set video quality to RF 23-25
4. Choose H.264 codec

**Option 3: FFmpeg (Command Line)**
```bash
# Compress to ~15MB with good quality
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -c:a aac -b:a 128k hotel-booking-demo.mp4
```

### **Quick Size Check:**
```bash
# Check your video file size on Mac/Linux
ls -lh hotel-booking-demo.mp4

# On Windows
dir hotel-booking-demo.mp4
```

## Update Configuration

After adding your video, update the file size in `/src/pages/Portfolio.tsx`:
```typescript
fileSize: 'YourActualSizeMB', // e.g., '18MB'
```

## GitHub/Demo Links

Don't forget to update the actual GitHub and demo URLs in the video project configuration:
- `githubUrl`: Your actual repository URL
- `liveUrl`: Your actual deployed application URL
