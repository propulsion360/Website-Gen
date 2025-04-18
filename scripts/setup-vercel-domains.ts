import { config } from 'dotenv';
config();

async function setupVercelDomains() {
  const vercelToken = process.env.VITE_VERCEL_TOKEN;
  const vercelTeamId = process.env.VITE_VERCEL_TEAM_ID;

  if (!vercelToken || !vercelTeamId) {
    console.error('Missing Vercel credentials');
    process.exit(1);
  }

  const domains = [
    'template.propulsion360.com',
    'site.propulsion360.com'
  ];

  for (const domain of domains) {
    try {
      // Add domain to Vercel team
      const response = await fetch('https://api.vercel.com/v9/domains', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: domain,
          teamId: vercelTeamId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add domain');
      }

      console.log(`✓ Added domain: ${domain}`);

      // Verify domain ownership
      console.log(`
Please add the following DNS records for ${domain}:

Name: @
Type: A
Value: 76.76.21.21

Name: www
Type: CNAME
Value: cname.vercel-dns.com
      `);
    } catch (error) {
      console.error(`Failed to set up domain ${domain}:`, error);
    }
  }
}

setupVercelDomains().catch(console.error); 