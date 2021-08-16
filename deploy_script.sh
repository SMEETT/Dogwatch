cd /home/bf/Dogwatch/backend
npm install
pm2 delete dw_backend
pm2 start /home/bf/Dogwatch/backend/server.js --name "dw_backend"
cd /home/bf/gh_actions_test/frontend
npm install --production=false
npm run build
pm2 delete dw_frontend
pm2 start npm --name "dw_frontend" -- run serve
pm2 save