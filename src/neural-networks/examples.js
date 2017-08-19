import {Creature} from "./creature"
import * as $ from 'jquery'

blastoff()

function blastoff() {
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
    const creatures = world.creatures
    creatures.forEach(function (creature) {
      // move
      const input = []
      for (let i in creatures) {
        input.push(creatures[i].location.x)
        input.push(creatures[i].location.y)
        input.push(creatures[i].velocity.x)
        input.push(creatures[i].velocity.y)
      }
      const output = creature.network.activate(input)
      creature.moveTo(output)

      // learn
      const learningRate = .3
      const target = [targetX(creature), targetY(creature), targetAngle(creature)]
      creature.network.propagate(learningRate, target)

      // draw
      creature.draw()
    })
    setTimeout(loop, 1000 / fps)
  }

  // blastoff
  loop()
}
