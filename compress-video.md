# 🚨 VIDEO COMPRESSION URGENTLY NEEDED

Your video is **350MB** - this needs to be reduced to **15-25MB** for web use!

## 🎯 Target: Reduce from 350MB to ~20MB (94% reduction)

## ⚡ FASTEST SOLUTION (Recommended)

### **Option 1: Online Compression (3 minutes)**
1. Go to: https://www.freeconvert.com/video-compressor
2. Upload your 350MB video
3. Choose these settings:
   - **Quality**: Medium (or Custom)
   - **Resolution**: 720p (1280x720)
   - **Target size**: 20-25MB
4. Download the compressed version
5. Rename it to `hotel-booking-demo.mp4`
6. Place in `/public/videos/` folder

### **Option 2: macOS Built-in (if you have final cut or compressor)**
```bash
# If you have ffmpeg installed (install via: brew install ffmpeg)
ffmpeg -i your-original-video.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 -c:a aac -b:a 128k hotel-booking-demo.mp4
```

### **Option 3: HandBrake (Free Software)**
1. Download HandBrake: https://handbrake.fr/
2. Open your video
3. Choose "Web Optimized" preset
4. Set:
   - Resolution: 720p
   - Quality: RF 25-28
   - Framerate: 24-30fps
5. Start encoding

## 📊 Size Comparison:
- **Before**: 350MB ❌ (unusable for web)
- **After**: ~20MB ✅ (perfect for web)
- **Reduction**: 94% smaller!

## ⏱️ Loading Time Comparison:
- **350MB**: ~2-5 minutes on average connection
- **20MB**: ~5-15 seconds on average connection

## 🔧 Settings That Work:
- **Resolution**: 720p (1280x720) - still looks great
- **Bitrate**: 2-4 Mbps
- **Codec**: H.264
- **Audio**: AAC, 128kbps

## ✅ After Compression:
1. Place the compressed video as `hotel-booking-demo.mp4` in `/public/videos/`
2. Update the file size in the portfolio config
3. Test the loading speed

**Your visitors will thank you!** 🎉
