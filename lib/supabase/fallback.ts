import type { SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_FALLBACK_FLAG = Symbol('supabaseFallback');

const missingEnvError = new Error(
  'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
);

const fallbackResult = { data: null, error: missingEnvError, count: 0 };
let warnedMissingEnv = false;

function createQueryProxy() {
  const proxy: any = new Proxy(() => {}, {
    apply() {
      return proxy;
    },
    get(_target, prop) {
      if (prop === 'then') {
        return (resolve: (value: any) => any, reject: (reason?: any) => any) =>
          Promise.resolve(fallbackResult).then(resolve, reject);
      }

      return proxy;
    },
  });

  return proxy;
}

export function createSupabaseFallbackClient(): SupabaseClient {
  if (!warnedMissingEnv) {
    console.warn(
      'Supabase environment variables are not configured. Using a no-op client for build/runtime safety.',
    );
    warnedMissingEnv = true;
  }

  const queryProxy = createQueryProxy();

  const authProxy = new Proxy(
    {},
    {
      get() {
        return async () => ({ data: { user: null, session: null }, error: missingEnvError });
      },
    },
  );

  const client = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'auth') {
          return authProxy;
        }

        return queryProxy;
      },
    },
  );

  (client as Record<symbol, boolean>)[SUPABASE_FALLBACK_FLAG] = true;

  return client as unknown as SupabaseClient;
}
