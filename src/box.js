const Box = x => ({
    map: f => Box(f(x)),
    fold: f => f(x),
    inspect: () => `Box(${x})`,
})

const Stream = stream => ({
  map: f => Stream(stream.map(f)),
  fold: f => stream.map(f),
  inspect: () => `Stream(${stream})`,
})

module.exports = {Box, Stream}
