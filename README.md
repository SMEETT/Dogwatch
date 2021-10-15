# **Dogwatch** / Readme (WIP)

## **Overview**

Dogwatch is a web-application to manage dog caretaking. You are free to host it yourself or use the [live version](https://dogwatch.borisfries.dev).

![dwpreview](/dw_preview.gif)

## **Features**

-   add and edit dogs (cruel people might use the delete feature)
-   add and edit appointments and assign caretakers and observers
-   add other Dogwatch users to a contact list
-   English, German and Russian translation

## **Installation**

-   run `npm install` in `/dogwatch/backend` and in `/dogwatch/frontend`
-   for details about the PostgreSQL configuration see `/dogwatch/backend/config/database.js`
-   to give you a better idea about the environment variables, here's what the `.env` in development looks like:

`/dogwatch/backend/.env`

```
NODE_ENV="development"
BACKEND_PORT=3001
DB_NAME="db_dogwatch"
DB_USER="admin"
DB_PASSWORD="secret"
DB_HOST=localhost
SESSION_SECRET="secret"
FRONTEND_URL="http://localhost:5000"
```

`/dogwatch/frontend/.env`

```
VITE_GQL_ENDPOINT_URL="http://localhost:3001/gql"
```

For more information about the use of environment variables in Vite please refer to the official documentation. The prefix `VITE_` is mandatory for them to work, though.

There's also a deploy script `/dogwatch/deploy_script.sh` and a config file for PM2 `/dogwatch/ecosystem.config.js` - both are worth checking out to get a better idea of how the automatic deployment is set up.

## **DB Schema**

![DB Schema](/dw_db_schema.png)

## **Technology**

### Frontend

-   [Svelte](https://svelte.dev/)
-   [Routify](https://www.routify.dev/)
-   [Vite](https://vitejs.dev/)

### Backend

-   [ExpressJS](https://expressjs.com/)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Sequelize ORM](https://sequelize.org/)
-   [GraphQL](https://graphql.org/)

### Deployment

-   [GitHub Actions](https://github.com/features/actions)
-   [PM2](https://pm2.keymetrics.io/)
-   [Ubuntu](https://ubuntu.com/)

## **Takeaways**

There are libraries like moment.js for a reason.

## **Known Problems & Future plans**

For planned features and known problems see [Issues](https://github.com/SMEETT/Dogwatch/issues)

## **Credits**

Very special thanks go to **nullptr** who helped me immensely. I couldn't ask for a better friend and mentor <3
