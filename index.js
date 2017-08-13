const fs = require("fs");
const {Box, Stream, Right, Left} = require('./src/box')
const Task = require('data.task')


const inspect = value => {
  console.log(value);
  return value;
}

/**************************************/
/* First example */
// -> declarative
Box("Hello, world")
  .map(s => s.toUpperCase())
  .map(s => s.replace(/o/gi, "0"))
  .map(inspect)
  .map(s => s.split(' ').reverse().join(',\n'))
  .map(s => s.replace(/,/g, "."))
  .fold(inspect)

// equivalent
// -> imperative
const first = "Hello, world"
const second = first.toUpperCase()
const third = second.replace(/o/gi, "0")
inspect(third)
const fourth = third.split(' ').reverse().join(',\n')
const fifth = fourth.replace(/,/g, ".")
inspect(fifth)


/**************************************/
/* Second example */
// -> declarative
const fromNullable = x => x ? Right(x) : Left(x)

const findColor = name => fromNullable({red: 'ff0000'}[name])

findColor('red')
  .map(c => c.toUpperCase())
  .map(c => `#${c}`)
  .map(inspect)
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
  inspect(transformedColor)
  console.log('success!', transformedColor)
} else {
  console.log('error')
}


/**************************************/
/* Third example */
// -> declarative
const tryCatch = f => {
  try {
    return Right(f())
  } catch (e) {
    Left(e)
  }
}

tryCatch(() => fs.readFileSync("./assets/names.txt").toString())
  .map(names => names.replace(/\r/g).split("\n"))
  .map(inspect)
  .fold(
    (error) => console.log("Fail!", error),
    (names) => console.log("Here are your names: ", names)
  )

// equivalent
// -> imperative
let names;

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
tryCatch(() => fs.readFileSync("./assets/data.json"))
  .map((file) => file.toString())
  .chain(fileContent => tryCatch(() => JSON.parse(fileContent)))
  .map(inspect)
  .fold(
    (error) => console.log("Fail!", error),
    (data) => console.log("Success!", data)
  )

// equivalent
// -> imperative
let fileContent, error;

try {
  fileContent = fs.readFileSync("./assets/data.json").toString()
} catch (e) {
  error = e;
}

if (!error) {
  let data;

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
