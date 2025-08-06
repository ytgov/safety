# Hazard and Incident Tracking

## Development Setup

1. Create a `api/.env.development` file with the following contents:

```shell
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
AUTH0_AUDIENCE=testing
APPLICATION_NAME=YG Safety Incident Tracker
DB_CLIENT=pg
DB_USER=postgres
DB_PASS=password
DB_HOST=localhost
DB_NAME=postgres
DB_PORT=5432
MAIL_FROM=XXXXXX
MAIL_HOST=localhost
MAIL_PORT=2500
MAIL_USER=XXXXXX
MAIL_PASS=XXXXXX
AD_CLIENT_ID=XXXXXX
AD_CLIENT_SECRET=XXXXXX
AD_TENANT_ID=XXXXXX

```

2. Open a new terminal and boot the API service

   ```shell
   cd api/
   npm i
   npm run start
   ```

3. Open a new terminal and boot the Web service

   ```shell
   cd web/
   npm i
   npm run start
   ```

4. Open a new terminal and boot the DB service

   ```shell
   docker compose -f docker-compose.yaml up --remove-orphans
   ```

5. Open a web browser to run the migrations. Go to the following URL:

    ```
    http://localhost:3000/migrate/latest
    ```

6. In the same tab, run the seeds, by opening the following URL:

    ```
    http://localhost:3000/migrate/seed/all
    ```

7. Log in to the app at http://localhost:8080/

8. Once you have created your account, make yourself a System Admin using your database manager (such as DBeaver). Connect to the database using the password you set in the .env.development file, and run the following SQL:

    ```sql
    INSERT INTO user_roles (
        "name",
        role_type_id,
        user_id,
        created_at,
        create_user_id,
        "start_date"
    ) VALUES (
        'System Admin',
        1,                -- role_type_id
        1,                -- user_id
        CURRENT_TIMESTAMP,
        1,                -- create_user_id
        CURRENT_TIMESTAMP -- start_date
    );
    ```

    > Assumes your user id is 1
