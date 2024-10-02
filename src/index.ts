import express from 'express';

const app = express();

app.use('*', (req, res) => {
  res.status(200).send('cat flag.php');
});

app.listen(10020, '0.0.0.0', () => {
  console.log('Server started on http://0.0.0.0:10020');
});
