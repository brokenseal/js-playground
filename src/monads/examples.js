const fs = require("fs")
const utils = require("../utils")
const Task = require("data.task")
const {Box, tryCatch, fromNullable} = require('./box')


module.exports.run = () => {

  /*************************************************/
  /* First example */
  // -> declarative
  Box("Hello, world"
  )
    .map(s => s.toUpperCase())
    .map(s => s.replace(/o/gi, "0"))
    .map(utils.inspect)
    .map(s => s.split(' ').reverse().join(',\n'))
    .map(s => s.replace(/,/g, "."))
    .fold(utils.inspect)

  // equivalent
  // -> imperative
  const first = "Hello, world"
  const second = first.toUpperCase()
  const third = second.replace(/o/gi, "0")
  utils.inspect(third)
  const fourth = third.split(' ').reverse().join(',\n')
  const fifth = fourth.replace(/,/g, ".")
  utils.inspect(fifth)


  /**************************************/
  /* Second example */
  // -> declarative
  const findColor = name => fromNullable({red: 'ff0000'}[name])

  findColor('red')
    .map(c => c.toUpperCase())
    .map(c => `#${c}`)
    .map(utils.inspect)
    .fold(
      (error) => console.log('error'),
      transformedColor => console.log('success!', transformedColor)
    )

  // equivalent
  // -> imperative
  const findColor2 = name => {
    return {red: 'ff0000'}[name]
  }
  const color = findColor2('red')

  if (color) {
    const transformedColor = `#${color.toUpperCase()}`
    utils.inspect(transformedColor)
    console.log('success!', transformedColor)
  } else {
    console.log('error')
  }


  /**************************************/
  /* Third example */
  // -> declarative

  tryCatch(() => fs.readFileSync("./assets/names.txt").toString())
    .map(names => names.replace(/\r/g).split("\n"))
    .map(utils.inspect)
    .fold(
      (error) => console.log("Fail!", error),
      (names) => console.log("Here are your names: ", names)
    )

  // equivalent
  // -> imperative
  let names

  try {
    names = fs.readFileSync("./assets/names.txt").toString()
  } catch (e) {
    console.log("Fail!", error)
  }

  if (names) {
    const splitNames = names.replace(/\r/g).split("\n")
    console.log("Here are your names: ", splitNames)
  }


  /**************************************/
  /* Fourth example */
  // -> declarative
  let name = tryCatch(() => fs.readFileSync("./assets/data.json"))
    .map((file) => file.toString())
    .chain(fileContent => tryCatch(() => JSON.parse(fileContent)))
    .map(utils.inspect)
    .fold(
      (error) => "William",
      (data) => data.name
    )
  utils.inspect(name)

  // equivalent
  // -> imperative
  let fileContent, error

  try {
    fileContent = fs.readFileSync("./assets/data.json").toString()
  } catch (e) {
    error = e
  }

  if (!error) {
    let data

    try {
      data = JSON.parse(fileContent)
    } catch (e) {
      error = e
    }

    if (data) {
      console.log("Success!", data)
    }
  }

  if (error) {
    console.log("Fail!", error)
  }

  /**************************************/
  /* Fifth example: applicable functors */
  const now = new Date().getTime()

  let t1 = new Task((rej, res) => setTimeout(_ => res(1), 900))
  let t2 = new Task((rej, res) => setTimeout(_ => res(2), 2000))

  let sumResults = val1 => {
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
  t1.chain(x => t2.map(y => x + y)).fork(console.error, log)
}
