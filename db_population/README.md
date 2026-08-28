# Database Population

#### A quick note before starting
Running the database side of this app can be done in a number of ways. For beginners, non-technical people, users that are using this for actual work, or tinkerers I highly reccomend using a tool called Supabase.

If you are familiar with Supabase you already know what it is capable of and should be knowledgable enough to make a decision based on what to use. For those that are unaware I will not go in-depth on how to use Supabase as there is extensive documentation and the app is highly user friendly so should be easy enough to figure out how to configure and get set up with an account.

Supabase is free and easy to use and this application assumes the existence of .env files for establishing a connection and using the Supabase platform for ease of use. However, if you are unaware the devs would like to note that Supabase obfuscates EVERYTHING. If you wish to scale this app and customize it for different use cases the devs highly reccomend setting up a normal Postgres database for the database aspect. All queries, population, and schemas an be configured for a normal Postgres DB server and can be setup using a cheap cloud VPS with just a little more effort for a lot more control (if you want to avoid debugging nightmares.)

## Schema
The schema of this database assumes that this is for a single tenant, an app that only one person or small group of people use, there is no authentication and does not contain tables geared for a multi-tenancy application that can be redistributed, but is equipped to scale in that manner if you wish. The entire schema can be viewed in ./db_population/database_schema.png

## Setup Scripts
The bare minimum setup scripts can be found in ./db_popoulation/setup_scripts.sql. The entire setup script can be ran for the database client of your choosing so that the bare minimum tables will be in the database.

There will be example scripts that you may use inside of your database to get a few random data points into your database if you wish to see how this app is used with the data and the overall flow of the application before importing your own data and day-to-day maintenance.

