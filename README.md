# Group Contributions (Netlify)
1. Push this folder to a GitHub repo.
2. Netlify > Add new site > Import from Git > pick the repo (no build command needed).
3. Site settings > Environment variables > add ADMIN_PASSWORD = your password. Then redeploy.
4. Public page: your-site.netlify.app   Admin: your-site.netlify.app/admin.html
Data is stored in Netlify Blobs (free, no setup). Test locally with: npx netlify dev
