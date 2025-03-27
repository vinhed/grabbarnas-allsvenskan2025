curl https://allsvenskan.se/data-endpoint/statistics/standings/2025/total -o ./public/data/standings.json
git add ./public/data/standings.json
git commit -m "Updated Standings"
git push