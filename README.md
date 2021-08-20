# Vote For Your Favourite Fall Guys Skins (server-side code) :crown:

A simple React project that lets users register, login and vote for their favourite Fall Guys: Ultimate Knockout skins.

Run `npm install` and then `npm run dev` (to start the app in development mode) or `npm start` to start in production mode.

You can find client-side code here: [Fall Guys Voting BackEnd](https://github.com/agne-vensl/fall-guys-voting-fe)

## Potential Database Structure

### users

"id" int NOT NULL AUTO_INCREMENT,
"name" varchar(255) DEFAULT NULL,
"email" varchar(255) DEFAULT NULL,
"password" varchar(255) DEFAULT NULL,
"timestamp" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY ("id"),
UNIQUE KEY "email" ("email")

### rarities

"id" int NOT NULL AUTO_INCREMENT,
"title" varchar(255) DEFAULT NULL,
PRIMARY KEY ("id"),
UNIQUE KEY "title" ("title")

### seasons

"id" int NOT NULL AUTO_INCREMENT,
"season" varchar(255) DEFAULT NULL,
PRIMARY KEY ("id")

### skins

"id" int NOT NULL AUTO_INCREMENT,
"rarity_id" int DEFAULT NULL,
"season_id" int DEFAULT NULL,
"name" varchar(255) DEFAULT NULL,
"image" text,
PRIMARY KEY ("id"),
KEY "rarity_id" ("rarity_id"),
KEY "season_id" ("season_id"),
CONSTRAINT "skins_ibfk_1" FOREIGN KEY ("rarity_id") REFERENCES "rarities" ("id"),
CONSTRAINT "skins_ibfk_2" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id")

### scores

"id" int NOT NULL AUTO_INCREMENT,
"user_id" int DEFAULT NULL,
"skin_id" int DEFAULT NULL,
"score" int DEFAULT NULL,
PRIMARY KEY ("id"),
KEY "user_id" ("user_id"),
KEY "skin_id" ("skin_id"),
CONSTRAINT "scores_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users" ("id"),
CONSTRAINT "scores_ibfk_2" FOREIGN KEY ("skin_id") REFERENCES "skins" ("id")
