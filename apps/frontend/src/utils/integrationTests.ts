
import { supabase } from '@/integrations/supabase/client';

export const runIntegrationTests = async () => {
  console.log('🔄 Running Integration Tests...\n');

  // Test 1: Supabase Connection
  try {
    const { data, error } = await supabase.from('ai_agents').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection: PASSED');
  } catch (error) {
    console.log('❌ Supabase connection: FAILED', error);
  }

  // Test 2: Authentication State Check
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('✅ Auth state check: PASSED', session ? '(User logged in)' : '(No user)');
  } catch (error) {
    console.log('❌ Auth state check: FAILED', error);
  }

  // Test 3: AI Agents Table Access
  try {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('id, name, status')
      .limit(5);
    
    if (error) throw error;
    console.log('✅ AI Agents table access: PASSED', `(${data?.length || 0} records)`);
  } catch (error) {
    console.log('❌ AI Agents table access: FAILED', error);
  }

  // Test 4: AI Signals Table Access
  try {
    const { data, error } = await supabase
      .from('ai_signals')
      .select('id, symbol, signal_type')
      .limit(5);
    
    if (error) throw error;
    console.log('✅ AI Signals table access: PASSED', `(${data?.length || 0} records)`);
  } catch (error) {
    console.log('❌ AI Signals table access: FAILED', error);
  }

  // Test 5: Market News Table Access
  try {
    const { data, error } = await supabase
      .from('market_news')
      .select('id, title, source')
      .limit(5);
    
    if (error) throw error;
    console.log('✅ Market News table access: PASSED', `(${data?.length || 0} records)`);
  } catch (error) {
    console.log('❌ Market News table access: FAILED', error);
  }

  console.log('\n🎯 Integration tests completed!');
};
