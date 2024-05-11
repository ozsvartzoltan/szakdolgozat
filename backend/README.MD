git push origin

npm install / npm i -download all necessary packages  
npm run db -run seeder
npx sequelize -project commands
npx nodemon server.js -run server that refreshes
n to n -many to many
npm test

200-ok
201-created
400-bad request
401-unauthorized
404-page not found

// "db": "npx rimraf database.sqlite && npx sequelize db:migrate:undo:all && npx sequelize db:migrate && npx sequelize db:seed:all",

to seed all data: npm run db

npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string,isAdmin:boolean,dateOfBirth:date,isMale:boolean,height:float,isMetric:boolean

npx sequelize model:generate --name JournalInfo --attributes name:string,unitOfMeasurement:string,description:string,UserId:integer,dataType:enum:'{PhysicalActivity, Nutrition, Relaxation, Health, Mental}'

npx sequelize model:generate --name UserInfo --attributes UserId:integer,dataName:string,dataValue:string

npx sequelize model:generate --name EntryLog --attributes JournalInfoId:integer,dataValue:float

npx sequelize seed:generate --name DatabaseSeeder

RESOURCES:
associations, migrations- https://github.com/szerveroldali/leirasok/blob/main/SequelizeAsszociaciok.md

queries- https://sequelize.org/docs/v6/core-concepts/model-querying-finders/

faker- https://fakerjs.dev/api/music.html

sequelize (findall) - https://sequelize.org/api/v6/class/src/model.js~model#static-method-findAll

fastify- https://github.com/fastify/fastify/blob/main/docs/Reference/Routes.md

// "db": "npx rimraf database.sqlite && npx sequelize db:migrate && npx sequelize db:seed:all"

## TODO:

- [ ] If new user is created, seed JournalInfo for that user
- [ ] User: change password (old, and new), compare old, if it matches then change

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwibmFtZSI6IlpvbGkiLCJlbWFpbCI6ImFAZ21haWwuY29tIiwicGFzc3dvcmQiOiJhZG1pbiIsImlzQWRtaW4iOmZhbHNlLCJkYXRlT2ZCaXJ0aCI6IjIwMDEtMDUtMDRUMDA6MDA6MDAuMDAwWiIsImlzTWFsZSI6dHJ1ZSwiaGVpZ2h0IjoxNzIsImlzTWV0cmljIjp0cnVlLCJjcmVhdGVkQXQiOiIyMDI0LTAzLTMxVDEwOjMzOjI5Ljk1NVoiLCJ1cGRhdGVkQXQiOiIyMDI0LTAzLTMxVDEwOjMzOjI5Ljk1NVoiLCJpYXQiOjE3MTE5NTcyNDZ9.-w72XdTdOIZgWPGbTQsa_VmVDE8b17OJ4ImLErbb8Us
