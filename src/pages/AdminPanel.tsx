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
  LogOut
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

const ADMIN_PASSWORD = '2580';
const STORAGE_KEY = 'portfolio_projects';
const AUTH_KEY = 'admin_authenticated';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for new/edit project
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    image: '',
    videoUrl: '',
    youtubeUrl: '',
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
    }
  }, []);

  // Load projects from localStorage
  const loadProjects = () => {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
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
      youtubeUrl: '',
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

  // Handle video file upload (convert to base64 for localStorage)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for localStorage
        toast({
          title: 'File Too Large',
          description: 'Please use a video URL or YouTube link for large videos.',
          variant: 'destructive'
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, videoUrl: reader.result as string }));
        toast({
          title: 'Video Uploaded',
          description: 'Video has been processed successfully.',
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

                {/* Video Upload */}
                <div>
                  <Label htmlFor="video">Video Upload (Max 50MB)</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </div>

                {/* Video URL */}
                <div>
                  <Label htmlFor="videoUrl">Video URL (External)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl?.startsWith('data:') ? 'Video uploaded' : formData.videoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://example.com/video.mp4"
                    disabled={formData.videoUrl?.startsWith('data:')}
                  />
                </div>

                {/* YouTube URL */}
                <div>
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
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
