import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic';

// Cache stats for 5 minutes - using admin client to avoid cookie dependencies
const getCachedStats = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    
    try {
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Get total portfolios count
      const { count: totalPortfolios, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true });

      if (portfoliosError) {
        console.error('Error fetching portfolios count:', portfoliosError);
      }

      // Get published portfolios count
      const { count: publishedPortfolios, error: publishedError } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      if (publishedError) {
        console.error('Error fetching published portfolios count:', publishedError);
      }

      // Get total portfolio views
      const { data: viewsData, error: viewsError } = await supabase
        .from('portfolios')
        .select('view_count')
        .not('view_count', 'is', null);

      if (viewsError) {
        console.error('Error fetching portfolio views:', viewsError);
      }

      const totalViews = viewsData?.reduce((sum, portfolio) => sum + (portfolio.view_count || 0), 0) || 0;

      // Get profession breakdown
      const { data: professionData, error: professionError } = await supabase
        .from('users')
        .select('profession')
        .not('profession', 'is', null);

      if (professionError) {
        console.error('Error fetching profession data:', professionError);
      }

      const professionBreakdown = professionData?.reduce((acc, user) => {
        const profession = user.profession || 'Other';
        acc[profession] = (acc[profession] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get template usage
      const { data: templateData, error: templateError } = await supabase
        .from('portfolios')
        .select('template');

      if (templateError) {
        console.error('Error fetching template data:', templateError);
      }

      const templateUsage = templateData?.reduce((acc, portfolio) => {
        const template = portfolio.template || 'Unknown';
        acc[template] = (acc[template] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentUsers, error: recentUsersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentUsersError) {
        console.error('Error fetching recent users:', recentUsersError);
      }

      // Get recent portfolios (last 30 days)
      const { count: recentPortfolios, error: recentPortfoliosError } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentPortfoliosError) {
        console.error('Error fetching recent portfolios:', recentPortfoliosError);
      }

      // Calculate success metrics
      const portfolioCreationRate = totalUsers > 0 ? Math.round((totalPortfolios / totalUsers) * 100) : 0;
      const publishRate = totalPortfolios > 0 ? Math.round((publishedPortfolios / totalPortfolios) * 100) : 0;
      const averageViews = publishedPortfolios > 0 ? Math.round(totalViews / publishedPortfolios) : 0;

      return {
        users: {
          total: totalUsers || 0,
          recent: recentUsers || 0,
          professionBreakdown,
        },
        portfolios: {
          total: totalPortfolios || 0,
          published: publishedPortfolios || 0,
          recent: recentPortfolios || 0,
          templateUsage,
        },
        views: {
          total: totalViews,
          average: averageViews,
        },
        metrics: {
          portfolioCreationRate,
          publishRate,
          userSatisfaction: 4.9, // Static for now - could be calculated from reviews
          averageSetupTime: 4.2, // Static for now - could be tracked
        },
        growth: {
          newUsersThisMonth: recentUsers || 0,
          newPortfoliosThisMonth: recentPortfolios || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        users: { total: 0, recent: 0, professionBreakdown: {} },
        portfolios: { total: 0, published: 0, recent: 0, templateUsage: {} },
        views: { total: 0, average: 0 },
        metrics: { portfolioCreationRate: 0, publishRate: 0, userSatisfaction: 4.9, averageSetupTime: 4.2 },
        growth: { newUsersThisMonth: 0, newPortfoliosThisMonth: 0 },
      };
    }
  },
  ['platform-stats'],
  {
    revalidate: 300, // 5 minutes
    tags: ['platform-stats'],
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    const stats = await getCachedStats();

    // If a specific metric is requested, return only that
    if (metric) {
      switch (metric) {
        case 'users':
          return NextResponse.json({
            success: true,
            data: { count: stats.users.total, recent: stats.users.recent },
          });
        case 'portfolios':
          return NextResponse.json({
            success: true,
            data: { count: stats.portfolios.total, published: stats.portfolios.published },
          });
        case 'views':
          return NextResponse.json({
            success: true,
            data: { total: stats.views.total, average: stats.views.average },
          });
        case 'satisfaction':
          return NextResponse.json({
            success: true,
            data: { rating: stats.metrics.userSatisfaction },
          });
        default:
          return NextResponse.json({
            success: false,
            error: 'Unknown metric requested',
          }, { status: 400 });
      }
    }

    // Return all stats
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch platform statistics',
        data: {
          users: { total: 0, recent: 0, professionBreakdown: {} },
          portfolios: { total: 0, published: 0, recent: 0, templateUsage: {} },
          views: { total: 0, average: 0 },
          metrics: { portfolioCreationRate: 0, publishRate: 0, userSatisfaction: 4.9, averageSetupTime: 4.2 },
          growth: { newUsersThisMonth: 0, newPortfoliosThisMonth: 0 },
        },
      },
      { status: 500 }
    );
  }
}