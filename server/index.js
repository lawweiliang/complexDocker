const keys = require('./keys');

//Express setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgres client setup
const { Pool } = require('pg');

console.log('keys', keys);

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => {
  console.log('Lost PG connection.');
});

pgClient
  .query('CREATE TABLE IF NOT EXISTS tbl_values (i_number INT)')
  .catch(err => console.log(err));

//Setup redis
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

//Check whether reddis is runnog or not
redisClient.on('error', function(err) {
  console.log('redis is not running');
  console.log('err', err);
});

const redisPublisher = redisClient.duplicate();

//Express route handling
app.get('/', (req, res) => {
  res.send('HI');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * FROM tbl_values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing Yet!');
  redisPublisher.publish('insert', index);

  pgClient.query('INSERT INTO tbl_values(i_number) VALUES($1)', [index]);

  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('Server.js listening to port 5000');
});
