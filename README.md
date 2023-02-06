# nftytribe-be-v2

nftytribe-be-v2 is a project with version 1.0.0, licensed under MIT.

## Dependencies

- @mailchimp/mailchimp_transactional: ^1.0.48
- @socket.io/redis-adapter: ^8.0.0
- @socket.io/redis-emitter: ^5.0.0
- abi-decoder: ^2.4.0
- aws-sdk: ^2.1231.0
- axios: ^1.1.3
- cors: ^2.8.5
- dotenv: ^16.0.3
- express: ^4.18

# Updating the Database

To populate the database with the necessary configs, follow these steps:

1. Install MySQL on your local machine.
2. Create a `.env` file in the root directory
3. Add the following environment variables to your local machine:
   - `db_host`: database host
   - `db_username`: database username
   - `db_port`: database port
   - `database`: database to be used (we recommend using `nftytribe`)
4. Run `yarn update-db` in your terminal to populate the database with the configs.

Note: If you don't have a `.env` file yet, you can use the empty `env.fields` file found in the `root/scripts/db` directory as a starting point. The developer or anyone trying to start the application should already have the necessary env names and values in the file or will be prompted for the database password.

# To create .env file to start the application

1. You need to have a functioning database with the right configurations already in place.

2. Export the variables:

   - db_host
   - db_username
   - db_password
   - db_port
   - database

3. Run `yarn start:dev` or `npm run start:dev`

4. To start the application casually, run `yarn dev` or `npm run dev`
