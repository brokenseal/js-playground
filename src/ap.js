const {id, Box} = require('./box')
const Task = require("data.task")

const now = new Date().getTime()

let t1 = new Task((rej, res) => setTimeout(_ => res(1), 900))
let t2 = new Task((rej, res) => setTimeout(_ => res(2), 2000))
let sumResults = val1 =>  {
  console.log("val1", val1)

  return val2 => {
    console.log("val2", val2)
    return val1 + val2
  }
}

const log = x => {
  const later = new Date().getTime()

  console.log("Value: ", x)
  console.log("Time passed: ", later - now)
}

// parallel execution
Box(sumResults).ap(t1).ap(t2).fork(console.error, log)

t1.map(sumResults).fork(console.error, log)
t2.map(sumResults).fork(console.error, log)

// serial execution
//t1.chain(x => t2.map(y => x + y)).fork(console.error, log);
