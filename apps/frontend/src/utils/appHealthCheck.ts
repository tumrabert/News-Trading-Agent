
export const runAppHealthCheck = async () => {
  console.log('🔍 Running Application Health Check...\n');

  // Test 1: Check if required components exist
  try {
    const requiredComponents = [
      '@/App',
      '@/pages/Auth',
      '@/pages/Index',
      '@/pages/NotFound',
      '@/hooks/useAuth',
      '@/components/ProtectedRoute',
      '@/components/UserMenu'
    ];

    for (const component of requiredComponents) {
      try {
        const module = await import(component);
        console.log(`✅ ${component}: LOADED`);
      } catch (error) {
        console.log(`❌ ${component}: FAILED TO LOAD`, error);
      }
    }
  } catch (error) {
    console.log('❌ Component loading test: FAILED', error);
  }

  // Test 2: Check if Supabase client is working
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    console.log('✅ Supabase client: LOADED');
    
    // Test connection
    const { data, error } = await supabase.from('ai_agents').select('count').limit(1);
    if (error) {
      console.log('⚠️ Supabase connection: WARNING', error.message);
    } else {
      console.log('✅ Supabase connection: WORKING');
    }
  } catch (error) {
    console.log('❌ Supabase client: FAILED', error);
  }

  // Test 3: Check if API client packages exist
  try {
    await import('@workspace/api-client');
    console.log('✅ API Client package: LOADED');
  } catch (error) {
    console.log('❌ API Client package: FAILED', error);
  }

  try {
    await import('@workspace/shared-types');
    console.log('✅ Shared Types package: LOADED');
  } catch (error) {
    console.log('❌ Shared Types package: FAILED', error);
  }

  // Test 4: Check authentication flow
  try {
    const { useAuth } = await import('@/hooks/useAuth');
    console.log('✅ Authentication hook: LOADED');
  } catch (error) {
    console.log('❌ Authentication hook: FAILED', error);
  }

  console.log('\n🎯 Health check completed!');
};
