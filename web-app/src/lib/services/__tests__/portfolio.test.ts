import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPortfolio, updatePortfolio, deletePortfolio, getPortfolios } from '../portfolio';
import { createTestUserSession, createTestPortfolio } from '@/test/utils';

// Mock Supabase client
const mockSupabaseClient = {
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

vi.mock('@/lib/supabase/client', () => ({
  default: mockSupabaseClient,
}));

describe('Portfolio Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPortfolio', () => {
    it('creates a new portfolio successfully', async () => {
      const mockUser = createTestUserSession();
      const portfolioData = {
        title: 'New Portfolio',
        profession: 'actor' as const,
        bio: 'Test bio',
        location: 'New York, NY',
        template_id: 'T1',
      };
      const mockCreatedPortfolio = createTestPortfolio(portfolioData);

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().insert().select().single().mockResolvedValue({
        data: mockCreatedPortfolio,
        error: null,
      });

      const result = await createPortfolio(portfolioData);

      expect(result).toEqual({
        success: true,
        data: mockCreatedPortfolio,
      });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        ...portfolioData,
        user_id: mockUser.id,
      });
    });

    it('handles authentication error', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const portfolioData = {
        title: 'New Portfolio',
        profession: 'actor' as const,
        bio: 'Test bio',
        location: 'New York, NY',
        template_id: 'T1',
      };

      const result = await createPortfolio(portfolioData);

      expect(result).toEqual({
        success: false,
        error: 'User not authenticated',
      });
    });

    it('handles database errors', async () => {
      const mockUser = createTestUserSession();
      const portfolioData = {
        title: 'New Portfolio',
        profession: 'actor' as const,
        bio: 'Test bio',
        location: 'New York, NY',
        template_id: 'T1',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().insert().select().single().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await createPortfolio(portfolioData);

      expect(result).toEqual({
        success: false,
        error: 'Database error',
      });
    });

    it('validates required fields', async () => {
      const mockUser = createTestUserSession();
      const invalidPortfolioData = {
        title: '',
        profession: 'actor' as const,
        bio: 'Test bio',
        location: 'New York, NY',
        template_id: 'T1',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await createPortfolio(invalidPortfolioData);

      expect(result).toEqual({
        success: false,
        error: 'Title is required',
      });
    });

    it('generates unique slug', async () => {
      const mockUser = createTestUserSession();
      const portfolioData = {
        title: 'My Amazing Portfolio',
        profession: 'actor' as const,
        bio: 'Test bio',
        location: 'New York, NY',
        template_id: 'T1',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().insert().select().single().mockResolvedValue({
        data: { ...createTestPortfolio(portfolioData), slug: 'my-amazing-portfolio' },
        error: null,
      });

      const result = await createPortfolio(portfolioData);

      expect(result.success).toBe(true);
      expect(result.data?.slug).toBe('my-amazing-portfolio');
    });
  });

  describe('updatePortfolio', () => {
    it('updates an existing portfolio successfully', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'test-portfolio-id';
      const updateData = {
        title: 'Updated Portfolio',
        bio: 'Updated bio',
      };
      const mockUpdatedPortfolio = createTestPortfolio({ ...updateData, id: portfolioId });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().update().eq().select().single().mockResolvedValue({
        data: mockUpdatedPortfolio,
        error: null,
      });

      const result = await updatePortfolio(portfolioId, updateData);

      expect(result).toEqual({
        success: true,
        data: mockUpdatedPortfolio,
      });
      expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
        ...updateData,
        updated_at: expect.any(String),
      });
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', portfolioId);
    });

    it('handles portfolio not found', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'non-existent-id';
      const updateData = {
        title: 'Updated Portfolio',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().update().eq().select().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await updatePortfolio(portfolioId, updateData);

      expect(result).toEqual({
        success: false,
        error: 'Portfolio not found',
      });
    });

    it('handles unauthorized access', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updatePortfolio('test-id', { title: 'Updated' });

      expect(result).toEqual({
        success: false,
        error: 'User not authenticated',
      });
    });

    it('validates update data', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'test-portfolio-id';
      const invalidUpdateData = {
        title: '',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await updatePortfolio(portfolioId, invalidUpdateData);

      expect(result).toEqual({
        success: false,
        error: 'Title cannot be empty',
      });
    });
  });

  describe('deletePortfolio', () => {
    it('deletes a portfolio successfully', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'test-portfolio-id';

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().delete().eq().mockResolvedValue({
        error: null,
      });

      const result = await deletePortfolio(portfolioId);

      expect(result).toEqual({
        success: true,
        message: 'Portfolio deleted successfully',
      });
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('id', portfolioId);
    });

    it('handles portfolio not found', async () => {
      const mockUser = createTestUserSession();
      const portfolioId = 'non-existent-id';

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().delete().eq().mockResolvedValue({
        error: { code: 'PGRST116' },
      });

      const result = await deletePortfolio(portfolioId);

      expect(result).toEqual({
        success: false,
        error: 'Portfolio not found',
      });
    });

    it('handles unauthorized access', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await deletePortfolio('test-id');

      expect(result).toEqual({
        success: false,
        error: 'User not authenticated',
      });
    });
  });

  describe('getPortfolios', () => {
    it('fetches portfolios successfully', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [
        createTestPortfolio({ title: 'Portfolio 1' }),
        createTestPortfolio({ title: 'Portfolio 2' }),
      ];

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().select().eq().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 2,
      });

      const result = await getPortfolios({ page: 1, limit: 10 });

      expect(result).toEqual({
        success: true,
        data: mockPortfolios,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('handles pagination correctly', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [createTestPortfolio()];

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().select().eq().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 25,
      });

      const result = await getPortfolios({ page: 2, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
      });
      expect(mockSupabaseClient.from().range).toHaveBeenCalledWith(10, 19);
    });

    it('handles search filtering', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [createTestPortfolio()];

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().select().eq().ilike().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 1,
      });

      const result = await getPortfolios({ page: 1, limit: 10, search: 'test' });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from().ilike).toHaveBeenCalledWith('title', '%test%');
    });

    it('handles profession filtering', async () => {
      const mockUser = createTestUserSession();
      const mockPortfolios = [createTestPortfolio({ profession: 'actor' })];

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().select().eq().order().range().mockResolvedValue({
        data: mockPortfolios,
        error: null,
        count: 1,
      });

      const result = await getPortfolios({ page: 1, limit: 10, profession: 'actor' });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('profession', 'actor');
    });

    it('handles database errors', async () => {
      const mockUser = createTestUserSession();

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from().select().eq().order().range().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await getPortfolios({ page: 1, limit: 10 });

      expect(result).toEqual({
        success: false,
        error: 'Database error',
      });
    });
  });
});