const {Box, Stream} = require('./src/box')
const Task = require('data.task')


const inspect = value => {
  console.log(value);
  return value;
}

const result = Stream([1, 2, 3, 4, 5])
  .map(inspect)
  .map(v => v * 10)
  .fold(inspect)

console.log(result)
