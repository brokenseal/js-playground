import {Architect} from 'synaptic'
import {Vector} from './vector'
import * as $ from 'jquery'


function Creature(world, x, y) {
  this.network = new Architect.Perceptron(40, 25, 3)
  this.world = world
  this.mass = 1
  this.maxspeed = 10
  this.maxforce = .2
  this.lookRange = this.mass * 200
  this.length = this.mass * 10
  this.base = this.length * .5
  this.HALF_PI = Math.PI * .5
  this.TWO_PI = Math.PI * 2
  this.location = new Vector(x, y)
  this.velocity = new Vector(0, 0)
  this.acceleration = new Vector(0, 0)
  this.color = "#222222"
}

Creature.prototype = {

  moveTo: function (networkOutput) {
    const force = new Vector(0, 0)

    const target = new Vector(networkOutput[0] * this.world.width, networkOutput[1] * this.world.height)
    const angle = (networkOutput[2] * this.TWO_PI) - Math.PI

    const separation = this.separate(this.world.creatures)
    const alignment = this.align(this.world.creatures).setAngle(angle)
    const cohesion = this.seek(target)

    force.add(separation)
    force.add(alignment)
    force.add(cohesion)

    this.applyForce(force)
  },

  draw: function () {
    this.update()

    const ctx = this.world.context
    ctx.lineWidth = 1

    const angle = this.velocity.angle()

    const x1 = this.location.x + Math.cos(angle) * this.base
    const y1 = this.location.y + Math.sin(angle) * this.base

    const x2 = this.location.x + Math.cos(angle + this.HALF_PI) * this.base
    const y2 = this.location.y + Math.sin(angle + this.HALF_PI) * this.base

    const x3 = this.location.x + Math.cos(angle - this.HALF_PI) * this.base
    const y3 = this.location.y + Math.sin(angle - this.HALF_PI) * this.base

    ctx.lineWidth = 2
    ctx.fillStyle = this.color
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.stroke()
    ctx.fill()
  },

  update: function () {
    this.boundaries()
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxspeed)
    if (this.velocity.mag() < 1.5)
      this.velocity.setMag(1.5)
    this.location.add(this.velocity)
    this.acceleration.mul(0)
  },

  applyForce: function (force) {
    this.acceleration.add(force)
  },

  boundaries: function () {

    if (this.location.x < 15)
      this.applyForce(new Vector(this.maxforce * 2, 0))

    if (this.location.x > this.world.width - 15)
      this.applyForce(new Vector(-this.maxforce * 2, 0))

    if (this.location.y < 15)
      this.applyForce(new Vector(0, this.maxforce * 2))

    if (this.location.y > this.world.height - 15)
      this.applyForce(new Vector(0, -this.maxforce * 2))

  },

  seek: function (target) {
    const seek = target.copy().sub(this.location)
    seek.normalize()
    seek.mul(this.maxspeed)
    seek.sub(this.velocity).limit(0.3)

    return seek
  },

  separate: function (neighboors) {
    const sum = new Vector(0, 0)
    let count = 0

    for (let i in neighboors) {
      if (neighboors[i] != this) {
        const d = this.location.dist(neighboors[i].location)
        if (d < 24 && d > 0) {
          const diff = this.location.copy().sub(neighboors[i].location)
          diff.normalize()
          diff.div(d)
          sum.add(diff)
          count++
        }
      }
    }
    if (!count)
      return sum

    sum.div(count)
    sum.normalize()
    sum.mul(this.maxspeed)
    sum.sub(this.velocity)
    sum.limit(this.maxforce)

    return sum.mul(2)
  },

  align: function (neighbours) {
    const sum = new Vector(0, 0)
    let count = 0

    for (let i in neighbours) {
      if (neighbours[i] != this)// && !neighbours[i].special)
      {
        sum.add(neighbours[i].velocity)
        count++
      }
    }
    sum.div(count)
    sum.normalize()
    sum.mul(this.maxspeed)

    sum.sub(this.velocity).limit(this.maxspeed)

    return sum.limit(.1)
  },

  cohesion: function (neighboors) {
    const sum = new Vector(0, 0)
    let count = 0
    for (let i in neighboors) {
      if (neighboors[i] != this)// && !neighboors[i].special)
      {
        sum.add(neighboors[i].location)
        count++
      }
    }
    sum.div(count)

    return sum
  }
}

export const run = function blastoff() {
  const canvas = $("canvas")[0]
  const ctx = canvas.getContext('2d')

  const num = 10
  const fps = 100

  canvas.width = $('#canvas-container').width()
  canvas.height = $('#canvas-container').height()

  $(window).resize(function () {
    const width = $('#canvas-container').width()
    const height = $('#canvas-container').height()
    canvas.width = width
    world.width = width
    canvas.height = height
    world.height = height
  })

  const world = {
    creatures: [],
    width: canvas.width,
    height: canvas.height,
    context: ctx
  }

  world.creatures = new Array(num).fill(null).map(_ => {
    const x = Math.random() * world.width
    const y = Math.random() * world.height

    const creature = new Creature(world, x, y)
    creature.velocity.random()
    return creature
  })

  const targetX = function (creature) {
    const cohesion = creature.cohesion(world.creatures)
    return cohesion.x / world.width
  }

  const targetY = function (creature) {
    const cohesion = creature.cohesion(world.creatures)
    return cohesion.y / world.height
  }

  const targetAngle = function (creature) {
    const alignment = creature.align(world.creatures)
    return (alignment.angle() + Math.PI) / (Math.PI * 2)
  }

  const loop = function () {
    // fade effect
    ctx.globalAlpha = 0.2
    ctx.fillStyle = '#f4f4f4'
    ctx.fillRect(0, 0, world.width, world.height)
    ctx.globalAlpha = 1

    // update each creature
    const input = world.creatures.reduce((acc, creature) => acc.concat([
      creature.location.x,
      creature.location.y,
      creature.velocity.x,
      creature.velocity.y,
    ]), [])

    world.creatures.forEach(function (creature) {
      // move
      const output = creature.network.activate(input)
      creature.moveTo(output)

      // learn
      const learningRate = .3
      const target = [
        targetX(creature),
        targetY(creature),
        targetAngle(creature)
      ]
      creature.network.propagate(learningRate, target)

      // draw
      creature.draw()
    })
    setTimeout(loop, 1000 / fps)
  }

  // blastoff
  loop()
}

run()
