CREATE SCHEMA IF NOT EXISTS "_realtime";
CREATE SCHEMA IF NOT EXISTS "graphql_public";
CREATE SCHEMA IF NOT EXISTS "realtime";

GRANT USAGE ON SCHEMA graphql_public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA graphql_public TO supabase_admin;

GRANT ALL ON SCHEMA _realtime TO postgres;
GRANT ALL ON SCHEMA _realtime TO supabase_admin;

GRANT ALL ON SCHEMA realtime TO postgres;
GRANT ALL ON SCHEMA realtime TO supabase_admin;
