import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Lock, 
  Video, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Youtube,
  Upload,
  Image,
  Link,
  Code,
  Eye,
  EyeOff,
  LogOut,
  FileText,
  Download
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  videoUrl?: string;
  youtubeUrl?: string;
  technologies: string[];
  category: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  completedDate: string;
  status: 'completed' | 'in-progress' | 'coming-soon';
}

interface HeroImage {
  id: string;
  url: string;
  alt: string;
  name: string;
}

interface HeroSettings {
  slideshowInterval: number; // in milliseconds
  enableSlideshow: boolean;
}

const ADMIN_PASSWORD = '2580';
const STORAGE_KEY = 'portfolio_projects';
const AUTH_KEY = 'admin_authenticated';
const CV_KEY = 'portfolio_cv';
const HERO_IMAGES_KEY = 'hero_images';
const HERO_SETTINGS_KEY = 'hero_settings';
const PROFILE_PHOTO_KEY = 'profile_photo';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [cvUrl, setCvUrl] = useState<string>('');
  
  // Hero images state
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    slideshowInterval: 5000,
    enableSlideshow: true
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('/images/profile-photo.jpg');
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isVideoUploading, setIsVideoUploading] = useState<boolean>(false);
  
  // Form state for new/edit project
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    technologies: [],
    category: 'web',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    completedDate: new Date().toISOString().split('T')[0],
    status: 'completed'
  });

  // Check authentication on mount
  useEffect(() => {
    const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
      loadProjects();
      loadCV();
      loadHeroImages();
      loadHeroSettings();
      loadProfilePhoto();
    }
  }, []);

  // Load projects from localStorage
  const loadProjects = () => {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  };

  // Load CV URL from localStorage
  const loadCV = () => {
    const storedCV = localStorage.getItem(CV_KEY);
    if (storedCV) {
      setCvUrl(storedCV);
    }
  };

  // Load hero images from localStorage
  const loadHeroImages = () => {
    const storedImages = localStorage.getItem(HERO_IMAGES_KEY);
    if (storedImages) {
      setHeroImages(JSON.parse(storedImages));
    }
  };

  // Load hero settings from localStorage
  const loadHeroSettings = () => {
    const storedSettings = localStorage.getItem(HERO_SETTINGS_KEY);
    if (storedSettings) {
      setHeroSettings(JSON.parse(storedSettings));
    }
  };

  // Load profile photo from localStorage
  const loadProfilePhoto = () => {
    const storedPhoto = localStorage.getItem(PROFILE_PHOTO_KEY);
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }
  };

  // Save hero images to localStorage
  const saveHeroImages = (images: HeroImage[]) => {
    localStorage.setItem(HERO_IMAGES_KEY, JSON.stringify(images));
    setHeroImages(images);
    window.dispatchEvent(new CustomEvent('heroImagesUpdated', { detail: images }));
  };

  // Save hero settings to localStorage
  const saveHeroSettings = (settings: HeroSettings) => {
    localStorage.setItem(HERO_SETTINGS_KEY, JSON.stringify(settings));
    setHeroSettings(settings);
    window.dispatchEvent(new CustomEvent('heroSettingsUpdated', { detail: settings }));
  };

  // Save profile photo to localStorage
  const saveProfilePhoto = (photoUrl: string) => {
    localStorage.setItem(PROFILE_PHOTO_KEY, photoUrl);
    setProfilePhoto(photoUrl);
    window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { detail: photoUrl }));
  };

  // Save projects to localStorage
  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    
    // Trigger event for other components to update
    window.dispatchEvent(new CustomEvent('projectsUpdated', { 
      detail: updatedProjects 
    }));
  };

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      loadProjects();
      loadHeroImages();
      loadHeroSettings();
      loadProfilePhoto();
      toast({
        title: 'Welcome Admin!',
        description: 'You have successfully logged in.',
      });
    } else {
      toast({
        title: 'Invalid Password',
        description: 'Please enter the correct admin password.',
        variant: 'destructive'
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    navigate('/');
  };

  // Handle adding new hero image
  const handleAddHeroImage = () => {
    if (!newImageUrl || !newImageName) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both image URL and name.',
        variant: 'destructive'
      });
      return;
    }

    const newImage: HeroImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      alt: newImageName,
      name: newImageName
    };

    const updatedImages = [...heroImages, newImage];
    saveHeroImages(updatedImages);
    setNewImageUrl('');
    setNewImageName('');
    
    toast({
      title: 'Hero Image Added',
      description: `${newImageName} has been added to the hero slideshow.`,
    });
  };

  // Handle deleting hero image
  const handleDeleteHeroImage = (id: string) => {
    const image = heroImages.find(img => img.id === id);
    if (confirm(`Are you sure you want to delete "${image?.name}"?`)) {
      const updatedImages = heroImages.filter(img => img.id !== id);
      saveHeroImages(updatedImages);
      
      toast({
        title: 'Hero Image Deleted',
        description: `${image?.name} has been removed.`,
      });
    }
  };

  // Handle updating hero settings
  const handleUpdateHeroSettings = (newSettings: Partial<HeroSettings>) => {
    const updatedSettings = { ...heroSettings, ...newSettings };
    saveHeroSettings(updatedSettings);
    
    toast({
      title: 'Hero Settings Updated',
      description: 'Slideshow settings have been saved.',
    });
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image file.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        saveProfilePhoto(dataUrl);
        
        toast({
          title: 'Profile Photo Updated',
          description: 'Your profile photo has been updated successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle hero image file upload
  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload an image file.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setNewImageUrl(dataUrl);
        setNewImageName(file.name.split('.')[0]);
        
        toast({
          title: 'Image Loaded',
          description: 'Image is ready to be added to the hero section.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle CV upload
  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid File',
          description: 'Please upload a PDF file.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        localStorage.setItem(CV_KEY, dataUrl);
        setCvUrl(dataUrl);
        
        // Update the public CV file
        window.dispatchEvent(new CustomEvent('cvUpdated', { detail: dataUrl }));
        
        toast({
          title: 'CV Updated',
          description: 'Your CV has been updated successfully.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle CV URL update
  const handleCVUrlUpdate = (url: string) => {
    localStorage.setItem(CV_KEY, url);
    setCvUrl(url);
    window.dispatchEvent(new CustomEvent('cvUpdated', { detail: url }));
    toast({
      title: 'CV URL Updated',
      description: 'Your CV URL has been updated successfully.',
    });
  };

  // Handle project creation/update
  const handleSaveProject = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in at least title and description.',
        variant: 'destructive'
      });
      return;
    }

    const newProject: Project = {
      id: editingProject?.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description!,
      image: formData.image || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      videoUrl: formData.videoUrl,
      youtubeUrl: formData.youtubeUrl,
      technologies: typeof formData.technologies === 'string' 
        ? formData.technologies.split(',').map(t => t.trim())
        : formData.technologies || [],
      category: formData.category || 'web',
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      featured: formData.featured || false,
      completedDate: formData.completedDate || new Date().toISOString().split('T')[0],
      status: formData.status || 'completed'
    };

    let updatedProjects;
    if (editingProject) {
      updatedProjects = projects.map(p => 
        p.id === editingProject.id ? newProject : p
      );
      toast({
        title: 'Project Updated',
        description: `${newProject.title} has been updated successfully.`,
      });
    } else {
      updatedProjects = [...projects, newProject];
      toast({
        title: 'Project Created',
        description: `${newProject.title} has been added to your portfolio.`,
      });
    }

    saveProjects(updatedProjects);
    resetForm();
  };

  // Handle project deletion
  const handleDeleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (confirm(`Are you sure you want to delete "${project?.title}"?`)) {
      const updatedProjects = projects.filter(p => p.id !== id);
      saveProjects(updatedProjects);
      toast({
        title: 'Project Deleted',
        description: `${project?.title} has been removed.`,
      });
    }
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      technologies: project.technologies
    });
    setIsCreating(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      videoUrl: '',
      technologies: [],
      category: 'web',
      githubUrl: '',
      liveUrl: '',
      featured: false,
      completedDate: new Date().toISOString().split('T')[0],
      status: 'completed'
    });
    setEditingProject(null);
    setIsCreating(false);
  };

  // Handle video file upload - convert to base64 for storage
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a video file.',
          variant: 'destructive'
        });
        return;
      }

      // Size warnings and limits
      if (file.size > 600 * 1024 * 1024) { // 600MB hard limit
        toast({
          title: 'File Too Large',
          description: 'Video files must be under 600MB. For better performance, consider using YouTube or Vimeo for very large files.',
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB warning for very large files
        toast({
          title: 'Very Large Video File',
          description: 'This file is quite large and may take several minutes to upload and process. Please be patient.',
        });
      } else if (file.size > 50 * 1024 * 1024) { // 50MB warning
        toast({
          title: 'Large Video File',
          description: 'This may take a moment to upload. Consider using YouTube or Vimeo for better performance.',
        });
      }
      
      // Show loading state
      setIsVideoUploading(true);
      setVideoUploadProgress(0);
      
      const isLargeFile = file.size > 50 * 1024 * 1024; // 50MB+
      
      if (isLargeFile) {
        toast({
          title: 'Uploading Large Video...',
          description: 'This may take several minutes. Please keep this tab open and avoid refreshing.',
        });
      } else {
        toast({
          title: 'Uploading Video...',
          description: 'Please wait while your video is being processed.',
        });
      }
      
      // Convert to base64 for storage
      const reader = new FileReader();
      
      // Simulate progress for large files (FileReader doesn't provide real progress)
      let progressInterval: NodeJS.Timeout | null = null;
      if (isLargeFile) {
        let progress = 0;
        progressInterval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 90) progress = 90; // Don't reach 100% until actually done
          setVideoUploadProgress(progress);
        }, 1000);
      }
      
      reader.onloadend = () => {
        if (progressInterval) clearInterval(progressInterval);
        setVideoUploadProgress(100);
        
        const dataUrl = reader.result as string;
        setFormData(prev => ({ ...prev, videoUrl: dataUrl }));
        
        setTimeout(() => {
          setIsVideoUploading(false);
          setVideoUploadProgress(0);
        }, 1000);
        
        toast({
          title: 'Video Uploaded Successfully!',
          description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) has been uploaded and is ready to use.`,
        });
      };
      
      reader.onerror = () => {
        if (progressInterval) clearInterval(progressInterval);
        setIsVideoUploading(false);
        setVideoUploadProgress(0);
        
        toast({
          title: 'Upload Failed',
          description: 'There was an error uploading your video. Please try again.',
          variant: 'destructive'
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground mt-2">
              Enter admin password to manage portfolio
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <Button type="submit" className="w-full">
                Login to Admin Panel
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Portfolio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <Badge variant="secondary">
                {projects.length} Projects
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                View Portfolio
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Photo Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Profile Photo Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your profile photo that appears in the hero section
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Profile Photo */}
              <div>
                <Label>Current Profile Photo</Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                    <img 
                      src={profilePhoto}
                      alt="Current Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://ui-avatars.com/api/?name=Profile&size=200&background=3b82f6&color=ffffff&format=svg';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">
                      This image appears in your hero section
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Upload New Photo */}
              <div>
                <Label htmlFor="profile-photo-upload">Upload New Profile Photo</Label>
                <Input
                  id="profile-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a square image for best results (JPG, PNG, WebP)
                </p>
                
                {/* URL Input */}
                <div className="mt-4">
                  <Label htmlFor="profile-photo-url">Or Use Image URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="profile-photo-url"
                      type="url"
                      placeholder="https://example.com/your-photo.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          saveProfilePhoto(e.currentTarget.value);
                          e.currentTarget.value = '';
                          toast({
                            title: 'Profile Photo Updated',
                            description: 'Your profile photo URL has been saved.',
                          });
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('profile-photo-url') as HTMLInputElement;
                        if (input?.value) {
                          saveProfilePhoto(input.value);
                          input.value = '';
                          toast({
                            title: 'Profile Photo Updated',
                            description: 'Your profile photo URL has been saved.',
                          });
                        }
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reset to Default */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  const defaultPhoto = '/images/profile-photo.jpg';
                  saveProfilePhoto(defaultPhoto);
                  toast({
                    title: 'Profile Photo Reset',
                    description: 'Profile photo has been reset to default.',
                  });
                }}
              >
                Reset to Default Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CV Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              CV/Resume Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload CV */}
              <div>
                <Label htmlFor="cv-upload">Upload New CV (PDF)</Label>
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your CV as a PDF file
                </p>
              </div>
              
              {/* CV URL */}
              <div>
                <Label htmlFor="cv-url">Or Use External CV URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="cv-url"
                    type="url"
                    placeholder="https://example.com/your-cv.pdf"
                    defaultValue={cvUrl && !cvUrl.startsWith('data:') ? cvUrl : ''}
                    onBlur={(e) => {
                      if (e.target.value) handleCVUrlUpdate(e.target.value);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('cv-url') as HTMLInputElement;
                      if (input?.value) handleCVUrlUpdate(input.value);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Current CV Status */}
            {cvUrl && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Current CV Status</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cvUrl.startsWith('data:') ? 'CV uploaded to portfolio' : 'Using external CV URL'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (cvUrl.startsWith('data:')) {
                          // Create a download link for base64 CV
                          const link = document.createElement('a');
                          link.href = cvUrl;
                          link.download = 'cv.pdf';
                          link.click();
                        } else {
                          window.open(cvUrl, '_blank');
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View CV
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        localStorage.removeItem(CV_KEY);
                        setCvUrl('');
                        window.dispatchEvent(new CustomEvent('cvUpdated', { detail: '' }));
                        toast({
                          title: 'CV Removed',
                          description: 'Your CV has been removed.',
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hero Images Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Hero Images Management
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Add multiple images for the hero section slideshow and control timing
            </p>
          </CardHeader>
          <CardContent>
            {/* Hero Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="slideshow-interval">Slideshow Interval (seconds)</Label>
                <Input
                  id="slideshow-interval"
                  type="number"
                  min="1"
                  max="60"
                  value={heroSettings.slideshowInterval / 1000}
                  onChange={(e) => {
                    const seconds = parseInt(e.target.value) || 5;
                    handleUpdateHeroSettings({ slideshowInterval: seconds * 1000 });
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How long each image shows (1-60 seconds)
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="enable-slideshow"
                  checked={heroSettings.enableSlideshow}
                  onChange={(e) => handleUpdateHeroSettings({ enableSlideshow: e.target.checked })}
                />
                <Label htmlFor="enable-slideshow">Enable Automatic Slideshow</Label>
              </div>
            </div>
            
            {/* Add New Hero Image */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Add New Hero Image</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hero-image-upload">Upload Image</Label>
                  <Input
                    id="hero-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleHeroImageUpload}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-image-url">Or Image URL</Label>
                  <Input
                    id="hero-image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl && !newImageUrl.startsWith('data:') ? newImageUrl : ''}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="mt-2"
                    disabled={newImageUrl.startsWith('data:')}
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-image-name">Image Name</Label>
                  <Input
                    id="hero-image-name"
                    placeholder="Professional Photo"
                    value={newImageName}
                    onChange={(e) => setNewImageName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddHeroImage} disabled={!newImageUrl || !newImageName}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Hero Image
                </Button>
              </div>
            </div>
            
            {/* Current Hero Images */}
            {heroImages.length > 0 && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Current Hero Images ({heroImages.length})</h4>
                  <Badge variant="secondary">
                    Slideshow: {heroSettings.enableSlideshow ? `${heroSettings.slideshowInterval / 1000}s` : 'Off'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroImages.map((image, index) => (
                    <Card key={image.id} className="overflow-hidden">
                      <div className="h-32 overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                          }}
                        />
                      </div>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{image.name}</h5>
                            <p className="text-xs text-muted-foreground">Image {index + 1}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteHeroImage(image.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {heroImages.length === 0 && (
              <div className="border-t pt-6 text-center py-8">
                <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No Hero Images</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add images to create a slideshow for your hero section
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {isCreating ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="My Awesome Project"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="web">Web App</option>
                    <option value="mobile">Mobile App</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="design">Design</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Video - Unified Input */}
                <div className="md:col-span-2">
                  <Label htmlFor="videoUrl">Project Video (Optional)</Label>
                  
                  {/* Smart Recommendations */}
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">📹 Video Options:</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>• <strong>YouTube URL</strong>: Paste any YouTube link (best performance) 🚀</div>
                      <div>• <strong>Vimeo URL</strong>: Paste Vimeo link for professional look</div>
                      <div>• <strong>Direct Upload</strong>: Upload video file under 50MB for small demos</div>
                    </div>
                  </div>
                  
                  {/* URL Input */}
                  <div className="space-y-2">
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl?.startsWith('data:') ? '✅ Video file uploaded locally' : formData.videoUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      disabled={formData.videoUrl?.startsWith('data:')}
                      className={formData.videoUrl?.startsWith('data:') ? 'bg-green-50 text-green-800' : ''}
                    />
                    
                    {/* File Upload Alternative */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-gray-200"></div>
                      <span className="text-xs text-gray-500 px-2">OR</span>
                      <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                    
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={isVideoUploading || Boolean(formData.videoUrl && !formData.videoUrl.startsWith('data:'))}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Video Upload Progress */}
                  {isVideoUploading && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center text-blue-800 mb-2">
                        <Video className="w-4 h-4 mr-2 animate-pulse" />
                        <span className="text-xs font-medium">Uploading video... {videoUploadProgress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${videoUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Video Status */}
                  {formData.videoUrl && (
                    <div className="mt-2 p-2 bg-gray-50 border rounded text-xs">
                      {formData.videoUrl.startsWith('data:') ? (
                        <div className="flex items-center justify-between text-green-800">
                          <span>✅ Local video uploaded successfully</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                            className="h-6 px-2 text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : formData.videoUrl.includes('youtube') || formData.videoUrl.includes('youtu.be') ? (
                        <div className="flex items-center gap-2 text-red-700">
                          <Youtube className="w-4 h-4" />
                          <span>YouTube video linked - excellent for performance!</span>
                        </div>
                      ) : formData.videoUrl.includes('vimeo') ? (
                        <div className="flex items-center gap-2 text-blue-700">
                          <Video className="w-4 h-4" />
                          <span>Vimeo video linked - great for professional content</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Video className="w-4 h-4" />
                          <span>External video URL provided</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Recommendation:</strong> For best performance, upload large videos to YouTube (unlisted) and paste the URL here.
                    Direct upload works great for small demo videos under 50MB.
                  </p>
                </div>

                {/* Technologies */}
                <div>
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : formData.technologies}
                    onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>

                {/* GitHub URL */}
                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                {/* Live URL */}
                <div>
                  <Label htmlFor="liveUrl">Live Demo URL</Label>
                  <Input
                    id="liveUrl"
                    value={formData.liveUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                    placeholder="https://demo.example.com"
                  />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="coming-soon">Coming Soon</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProject}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold">Manage Projects</h2>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Project
            </Button>
          </div>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              {project.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  {project.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
                  {project.videoUrl && <Video className="w-4 h-4" />}
                  {project.youtubeUrl && <Youtube className="w-4 h-4" />}
                  {project.githubUrl && <Code className="w-4 h-4" />}
                  {project.liveUrl && <Link className="w-4 h-4" />}
                </div>

                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditProject(project)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && !isCreating && (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <Video className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first project with videos and demos.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
