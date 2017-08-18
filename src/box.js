const Box = x =>
  ({
    map: f => Box(f(x)),
    ap: otherBox => otherBox.map(x),
    fold: f => f(x),
    inspect: () => `Box(${x})`,
  })
Box.of = x => Box(x)

const Right = x =>
  ({
    ap: r => r.map(x),
    map: f => Right(f(x)),
    chain: f => f(x),
    fold: (l, r) => r(x),
    concat: o => o.fold(l => Left(l), r => Right(x.concat(r))),
    inspect: () => `Right(${x})`,
  })
Right.of = x => Right(x)

const Left = x =>
  ({
    ap: r => Left(x),
    map: f => Left(x),
    chain: f => Left(x),
    fold: (l, r) => l(x),
    concat: o => Left(x),
    inspect: () => `Left(${x})`,
  })
Left.of = x => Left(x)

const tryCatch = f => {
  try {
    return Right(f())
  } catch (e) {
    return Left(e)
  }
}

const fromNullable = x => x === null || x === undefined ? Right(x) : Left(x)
const id = x => x

module.exports = {Box, Right, Left, tryCatch, fromNullable, id}
