// Supabase connection for profiles and the leaderboard.
// Both values are meant to be public: every visitor's browser uses them, and the
// database only allows the actions in supabase/setup.sql. Never put the secret
// (service_role) key here. Leave both empty to turn profiles off.
const SUPABASE_URL='';
const SUPABASE_KEY='';
