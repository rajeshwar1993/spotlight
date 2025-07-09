import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../portfolios/route';
import { createTestUserSession, createTestPortfolio } from '@/test/utils';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}));

describe('/api/portfolios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/portfolios', () => {
    it('returns portfolios for authenticated user', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [createTestPortfolio()];
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 1,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.portfolios).toHaveLength(1);
      expect(data.portfolios[0]).toEqual(mockPortfolios[0]);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      });
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles pagination parameters', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [createTestPortfolio()];
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 25,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios?page=2&limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        page: 2,
        limit: 20,
        total: 25,
        pages: 2,
      });
      expect(mockSupabase.from().range).toHaveBeenCalledWith(20, 39);
    });

    it('handles database errors', async () => {
      const mockUser = createTestUserSession();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().select().eq().order().range().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch portfolios');
    });
  });

  describe('POST /api/portfolios', () => {
    it('creates a new portfolio', async () => {
      const mockUser = createTestUserSession();
      const portfolioData = {
        title: 'New Portfolio',
        profession: 'actor',
        bio: 'Test bio',
        template_id: 'T1',
      };
      const mockPortfolio = createTestPortfolio(portfolioData);
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(portfolioData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.portfolio).toEqual(mockPortfolio);
      expect(data.success).toBe(true);
    });

    it('validates required fields', async () => {
      const mockUser = createTestUserSession();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles database errors during creation', async () => {
      const mockUser = createTestUserSession();
      const portfolioData = {
        title: 'New Portfolio',
        profession: 'actor',
        bio: 'Test bio',
        template_id: 'T1',
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(portfolioData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create portfolio');
    });
  });

  describe('PUT /api/portfolios/:id', () => {
    it('updates existing portfolio', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'test-portfolio-id';
      const updateData = {
        title: 'Updated Portfolio',
        bio: 'Updated bio',
      };
      const mockPortfolio = createTestPortfolio({ ...updateData, id: portfolioId });
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().update().eq().select().single().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const request = new NextRequest(`http://localhost:3000/api/portfolios/${portfolioId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await PUT(request, { params: { id: portfolioId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.portfolio).toEqual(mockPortfolio);
      expect(data.success).toBe(true);
    });

    it('returns 404 for non-existent portfolio', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'non-existent-id';
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const request = new NextRequest(`http://localhost:3000/api/portfolios/${portfolioId}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const response = await PUT(request, { params: { id: portfolioId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Portfolio not found');
    });
  });

  describe('DELETE /api/portfolios/:id', () => {
    it('deletes existing portfolio', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'test-portfolio-id';
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().delete().eq().mockResolvedValue({
        error: null,
      });

      const request = new NextRequest(`http://localhost:3000/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params: { id: portfolioId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('returns 404 for non-existent portfolio', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'non-existent-id';
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      mockSupabase.from().delete().eq().mockResolvedValue({
        error: { code: 'PGRST116' },
      });

      const request = new NextRequest(`http://localhost:3000/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params: { id: portfolioId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Portfolio not found');
    });

    it('returns 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios/test-id', {
        method: 'DELETE',
      });
      
      const response = await DELETE(request, { params: { id: 'test-id' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});