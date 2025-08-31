# Freelance Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Built-in theme switching
- **Performance Optimized**: Lazy loading, code splitting, and optimized images
- **SEO Ready**: Meta tags, sitemap, and search engine optimization
- **Contact Form**: Integrated contact form with EmailJS
- **Type Safe**: Full TypeScript support throughout

## 🛠️ Tech Stack

- **Frontend**: React 18.3, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Email**: EmailJS integration
- **Deployment Ready**: Optimized for static hosting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── portfolio/      # Portfolio-specific components
├── pages/              # Page components
├── contexts/           # React contexts (Theme, etc.)
├── lib/                # Utilities and helpers
└── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Start development server
npm run dev
# Open http://localhost:5173

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 🎨 Customization

### Update Personal Information

Edit the portfolio components in `src/components/portfolio/` and `src/pages/Portfolio.tsx`:

1. **Personal Details**: Update name, title, and description
2. **Projects**: Add your projects in the projects section
3. **Skills**: Update your skills and technologies
4. **Contact Info**: Update social links and contact information

### Theming

The project uses Tailwind CSS with a custom theme. Update colors and styling in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - CSS variables and base styles

## 📞 Contact Form

The contact form uses EmailJS for sending emails. To set it up:

1. Create an EmailJS account
2. Set up your email service and template
3. Add your EmailJS configuration to the contact form component

## 🚀 Deployment

Build the project for production:

```bash
npm run build
```

Deploy the `dist` folder to any static hosting service:
- **Netlify**: Drag and drop the dist folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Use the built files
- **Any CDN/Static Host**: Upload the dist folder contents

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⭐ Support

If you found this helpful, please give it a star on GitHub!
