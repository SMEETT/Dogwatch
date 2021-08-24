cd /var/lib/pm2node/Dogwatch/backend
npm install
npx sequelize-cli db:migrate
cd /var/lib/pm2node/Dogwatch/frontend
npm install --production=false
npm run build
cd /var/lib/pm2node/Dogwatch
pm2 delete dogwatch_frontend
pm2 delete dogwatch_backend
pm2 restart ecosystem.config.js
pm2 save