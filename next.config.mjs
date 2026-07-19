/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    // Enables the unauthorized()/forbidden() functions + special files
    // used for auth route-gating (see src/lib/dal.js).
    authInterrupts: true,
  },
};

export default nextConfig;
