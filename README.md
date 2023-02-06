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
2. Create a `.env` file in the root directory and add the following environment variables to your local machine:
   - `DB_HOST`: database host
   - `DB_USERNAME`: database username
   - `DB_PORT`: database port
   - `DB_NAME`: database to be used (default value: "nftytribe").
3. Run `yarn update-db` in your terminal to populate the database with the configs.

If you don't have a `.env` file yet, you can use the empty `env.fields` file found in the `root/scripts/db` directory as a starting point.
