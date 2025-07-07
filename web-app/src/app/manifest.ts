import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Spotlight - Professional Portfolio Platform',
    short_name: 'Spotlight',
    description: 'Create stunning professional portfolios in minutes. Perfect for actors, models, and creative professionals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Spotlight homepage on desktop'
      },
      {
        src: '/screenshots/mobile-portfolio.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Portfolio view on mobile'
      },
      {
        src: '/screenshots/mobile-dashboard.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Dashboard view on mobile'
      }
    ],
    
    categories: ['business', 'photography', 'portfolio', 'professional'],
    
    shortcuts: [
      {
        name: 'Create Portfolio',
        short_name: 'Create',
        description: 'Create a new professional portfolio',
        url: '/create',
        icons: [
          {
            src: '/icons/shortcut-create.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your portfolio dashboard',
        url: '/dashboard',
        icons: [
          {
            src: '/icons/shortcut-dashboard.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Profile',
        short_name: 'Profile',
        description: 'Edit your profile',
        url: '/profile',
        icons: [
          {
            src: '/icons/shortcut-profile.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],
    
    prefer_related_applications: false,
    
    edge_side_panel: {
      preferred_width: 480
    },
    
    launch_handler: {
      client_mode: ['navigate-existing', 'auto']
    },
    
    // Share target for PWA sharing
    share_target: {
      action: '/share',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url'
      }
    },
    
    // Protocol handlers for custom protocols
    protocol_handlers: [
      {
        protocol: 'web+spotlight',
        url: '/portfolio/%s'
      }
    ],
    
    // Handle file types
    file_handlers: [
      {
        action: '/upload',
        accept: {
          'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif']
        }
      }
    ]
  };
}