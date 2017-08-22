const {Box} = require("../monads/box")
const assert = require("assert")
const {Architect, Trainer} = require("synaptic")


const myNetwork = new Architect.Perceptron(3, 50, 1)
const trainer = new Trainer(myNetwork)

const trainingSet = [
  {
    input: "cat",
    output: "t",
  },
  {
    input: "mat",
    output: "t",
  },
  {
    input: "fat",
    output: "t",
  },
  {
    input: "rat",
    output: "t",
  },
  {
    input: "ast",
    output: "t",
  },
  {
    input: "ttt",
    output: "t",
  },
  {
    input: "opt",
    output: "t",
  },
  {
    input: "yet",
    output: "t",
  },
  {
    input: "trt",
    output: "t",
  },
  {
    input: "iot",
    output: "t",
  },
  {
    input: "pwt",
    output: "t",
  },
  {
    input: "ght",
    output: "t",
  },
]

module.exports.train = () => {
  const res = normalize(trainingSet)

  trainer.train(res, {
    rate: .3,
    iterations: 2 * 1000,
    error: .0001,
    log: 1000,
    cost: Trainer.cost.CROSS_ENTROPY
  })

  const res1 = myNetwork.activate(normalizeData(trainingSet[0].input))

  console.log(res1, denormalizeData(res1))
}

function normalize(trainingData){
  return trainingData.map(({output, input}) => {
    return {output: normalizeData(output), input: normalizeData(input)}
  })
}

function normalizeData(data){
  return data.split("").map(char =>
    char.charCodeAt(0) / 65535
  )
}

function denormalizeData(data){
  return data.map(charCode =>
    String.fromCharCode(charCode * 65535)
  ).join("")
}
