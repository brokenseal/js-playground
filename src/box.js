const Box = x =>
  ({
    map: f => Box(f(x)),
    fold: f => f(x),
    inspect: () => `Box(${x})`,
  })

const Right = x =>
  ({
    map: f => Right(f(x)),
    chain: f => f(x),
    fold: (l, r) => r(x),
    inspect: () => `Right(${x})`,
  })

const Left = x =>
  ({
    map: f => Left(x),
    chain: f => Left(x),
    fold: (l, r) => l(x),
    inspect: () => `Left(${x})`,
  })


module.exports = {Box, Stream, Right, Left}
