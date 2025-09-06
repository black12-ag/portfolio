# 🔄 Portfolio Update Workflow

## Quick Update Process (3 simple steps)

### 1. **Make Your Changes**
Edit any files in your portfolio:
- Update projects in `src/pages/Portfolio.tsx` or `src/pages/Home.tsx`
- Add new project images to `public/images/projects/`
- Update contact info in `src/pages/Contact.tsx`
- Modify any content you want

### 2. **Test Locally** (Optional but recommended)
```bash
npm run dev
# Visit http://localhost:8082 to preview changes
```

### 3. **Deploy to Live Site**
```bash
# Add all changes
git add .

# Commit with a message about what you changed
git commit -m "Update: Added new project / Updated contact info / etc."

# Push to GitHub
git push origin public-main:main

# Deploy to Netlify (updates your live site)
npm run build
netlify deploy --prod --dir=dist
```

## 🚀 **Even Simpler - Auto Deploy Setup**

I can set up **automatic deployment** so you only need to do this:

```bash
git add .
git commit -m "Your update message"
git push origin public-main:main
```

And your site automatically updates! Would you like me to set this up?

## 📝 **Common Updates You Might Want to Make**

### Update Personal Information
```typescript
// In src/pages/Contact.tsx - lines 53-77
email: 'your-real-email@domain.com'
phone: '+1 your-real-number'
location: 'Your City, State'
```

### Add New Projects
```typescript
// In src/pages/Portfolio.tsx - add to sampleProjects array
{
  id: 'new-project',
  title: 'Your New Project',
  description: 'Description of what you built',
  image: 'path-to-your-image.jpg',
  technologies: ['React', 'Node.js', 'etc'],
  githubUrl: 'your-github-repo-url',
  liveUrl: 'your-demo-url',
  // ... other fields
}
```

### Update Social Links
```typescript
// In src/pages/Contact.tsx - lines 80-102
{ 
  icon: Github, 
  href: 'https://github.com/your-real-username'
},
{ 
  icon: Linkedin, 
  href: 'https://linkedin.com/in/your-real-profile'
}
```

## 🔧 **Your Current Setup**

- **GitHub Repo**: https://github.com/black12-ag/portfolio
- **Live Site**: https://munir-dev-portfolio-2024.netlify.app
- **Branch**: `public-main` → pushes to `main` for deployment

## 🆘 **If Something Goes Wrong**

1. **Build fails?**
   ```bash
   npm run build
   # Check for errors and fix them
   ```

2. **Site not updating?**
   - Check if your push went to GitHub
   - Redeploy manually: `netlify deploy --prod --dir=dist`

3. **Need help?**
   - Check build logs at: https://app.netlify.com/projects/munir-dev-portfolio-2024
   - Or run `git status` to see what's changed

## ✅ **Quick Checklist Before Deploying**

- [ ] Changes look good locally (`npm run dev`)
- [ ] Build works (`npm run build`)
- [ ] Commit message describes the change
- [ ] Push to GitHub
- [ ] Deploy to Netlify

**That's it! Your portfolio will be updated and live! 🎉**
