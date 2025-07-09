import { http, HttpResponse } from 'msw';
import { mockUser, mockProfile, mockPortfolio } from '../utils';

// Mock API endpoints
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/signin', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };
    
    if (email === 'test@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        user: mockUser,
        session: { access_token: 'mock-token' },
      });
    }
    
    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    const body = await request.json();
    const { email, password, fullName } = body as {
      email: string;
      password: string;
      fullName: string;
    };
    
    return HttpResponse.json({
      success: true,
      user: { ...mockUser, email, user_metadata: { full_name: fullName } },
      session: { access_token: 'mock-token' },
    });
  }),

  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/auth/reset-password', async ({ request }) => {
    const body = await request.json();
    const { email } = body as { email: string };
    
    return HttpResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  }),

  http.get('/api/auth/user', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  http.get('/api/auth/verification-status', () => {
    return HttpResponse.json({ 
      emailVerified: true,
      user: mockUser 
    });
  }),

  http.post('/api/auth/resend-verification', () => {
    return HttpResponse.json({ 
      success: true,
      message: 'Verification email sent' 
    });
  }),

  // Portfolio endpoints
  http.get('/api/portfolios', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      portfolios: [mockPortfolio],
      pagination: {
        page,
        limit,
        total: 1,
        pages: 1,
      },
    });
  }),

  http.get('/api/portfolios/:id', ({ params }) => {
    const { id } = params;
    
    if (id === 'test-portfolio-id') {
      return HttpResponse.json({ portfolio: mockPortfolio });
    }
    
    return HttpResponse.json(
      { error: 'Portfolio not found' },
      { status: 404 }
    );
  }),

  http.post('/api/portfolios', async ({ request }) => {
    const body = await request.json();
    const newPortfolio = { ...mockPortfolio, ...body };
    
    return HttpResponse.json({ 
      portfolio: newPortfolio,
      success: true 
    });
  }),

  http.put('/api/portfolios/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    
    if (id === 'test-portfolio-id') {
      const updatedPortfolio = { ...mockPortfolio, ...body };
      return HttpResponse.json({ 
        portfolio: updatedPortfolio,
        success: true 
      });
    }
    
    return HttpResponse.json(
      { error: 'Portfolio not found' },
      { status: 404 }
    );
  }),

  http.delete('/api/portfolios/:id', ({ params }) => {
    const { id } = params;
    
    if (id === 'test-portfolio-id') {
      return HttpResponse.json({ success: true });
    }
    
    return HttpResponse.json(
      { error: 'Portfolio not found' },
      { status: 404 }
    );
  }),

  http.post('/api/portfolios/:id/duplicate', ({ params }) => {
    const { id } = params;
    
    if (id === 'test-portfolio-id') {
      const duplicatedPortfolio = {
        ...mockPortfolio,
        id: 'duplicated-portfolio-id',
        title: `${mockPortfolio.title} (Copy)`,
        slug: `${mockPortfolio.slug}-copy`,
      };
      
      return HttpResponse.json({ 
        portfolio: duplicatedPortfolio,
        success: true 
      });
    }
    
    return HttpResponse.json(
      { error: 'Portfolio not found' },
      { status: 404 }
    );
  }),

  http.get('/api/portfolios/featured', () => {
    return HttpResponse.json({
      portfolios: [mockPortfolio],
    });
  }),

  http.get('/api/portfolios/discover', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const profession = url.searchParams.get('profession') || '';
    const template = url.searchParams.get('template') || '';
    
    return HttpResponse.json({
      portfolios: [mockPortfolio],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
      filters: {
        search,
        profession,
        template,
      },
    });
  }),

  http.get('/api/portfolios/slug/:slug', ({ params }) => {
    const { slug } = params;
    
    if (slug === 'test-portfolio') {
      return HttpResponse.json({ portfolio: mockPortfolio });
    }
    
    return HttpResponse.json(
      { error: 'Portfolio not found' },
      { status: 404 }
    );
  }),

  // User/Profile endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({ profile: mockProfile });
  }),

  http.put('/api/user/profile', async ({ request }) => {
    const body = await request.json();
    const updatedProfile = { ...mockProfile, ...body };
    
    return HttpResponse.json({ 
      profile: updatedProfile,
      success: true 
    });
  }),

  // Stats endpoint
  http.get('/api/stats', () => {
    return HttpResponse.json({
      totalPortfolios: 1000,
      totalUsers: 500,
      totalViews: 50000,
      averageCreationTime: 240, // seconds
    });
  }),

  // Admin endpoints
  http.get('/api/admin/announcements', () => {
    return HttpResponse.json({
      announcements: [
        {
          id: 'test-announcement-id',
          title: 'Test Announcement',
          content: 'This is a test announcement',
          type: 'info',
          is_active: true,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
        },
      ],
    });
  }),

  http.post('/api/admin/announcements', async ({ request }) => {
    const body = await request.json();
    
    return HttpResponse.json({
      announcement: {
        id: 'new-announcement-id',
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      success: true,
    });
  }),

  // Image upload endpoints
  http.post('/api/upload/image', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      imageUrl: 'https://example.com/uploaded-image.jpg',
      fileName: file.name,
      fileSize: file.size,
    });
  }),

  http.post('/api/upload/batch', async ({ request }) => {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      return HttpResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    const uploadedImages = files.map((file, index) => ({
      url: `https://example.com/uploaded-image-${index}.jpg`,
      fileName: file.name,
      fileSize: file.size,
    }));
    
    return HttpResponse.json({
      success: true,
      images: uploadedImages,
    });
  }),

  // Error simulation endpoints (for testing error handling)
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get('/api/error/timeout', async () => {
    await new Promise(resolve => setTimeout(resolve, 10000));
    return HttpResponse.json({ success: true });
  }),

  // Default handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: 'Endpoint not found' },
      { status: 404 }
    );
  }),
];