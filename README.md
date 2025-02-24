# Guess Map ?

A web application aimed at inspiring users to discover Hong Kong's attractions. Users can create location-based games by uploading photos and tagging coordinates for others to identify. Those who guess correctly have the chance to win a jackpot. Accumulating more points allows users to redeem valuable rewards. Additionally, users can check in at various locations to collect spot cards.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)

## Features

### For User role:
- Feature 1: Create games for guess
- Feature 2: Play games to earn the jackpot
- Feature 3: Like or Dislike the games
- Feature 4: Check in spots use GPS
- Feature 5: Use the earned credits to redeem gifts
- Feature 6: Ranking

### For Admin role:
- Feature 1: Update role of accounts
- Feature 2: Create new gift
- Feature 3: Edit gifts

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Janicejim/guess_map.git
   ```
2. Install packages:
   ``` bash
   yarn 
   ```
3. Create .env and paste value according to utils/env.example
   ```
   // .env 
    DB_USERNAME=
    DB_PASSWORD=
    DB_NAME=
    DB_HOST=
    PORT=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    SALT_ROUNDS=
    LOGGING_LEVEL=
    NODE_ENV=
   ```

4. Create database in PostgresSQL and input the DB name and password to .env. And then create the table and seed by running :
   ``` bash
   yarn knex migrate:latest
   yarn knex seed:run 
   ```

5. For Google Map and Google Login, need to create and paste the Google Api access id and secret key in .env


## Usage
   ```bash
   yarn start
   ```