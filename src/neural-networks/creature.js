import {Architect} from 'synaptic'
import {Vector} from './vector'

function Creature(world, x, y) {
  this.network = new Architect.Perceptron(40, 25, 3);
  this.world = world;
  this.mass = .6;
  this.maxspeed = 5;
  this.maxforce = .2;
  this.lookRange = this.mass * 200;
  this.length = this.mass * 10;
  this.base = this.length * .5;
  this.HALF_PI = Math.PI * .5;
  this.TWO_PI = Math.PI * 2;
  this.location = new Vector(x, y);
  this.velocity = new Vector(0, 0);
  this.acceleration = new Vector(0, 0);
  this.color = "#222222";
}

Creature.prototype = {

  moveTo: function (networkOutput) {
    const force = new Vector(0, 0);

    const target = new Vector(networkOutput[0] * this.world.width, networkOutput[1] * this.world.height);
    const angle = (networkOutput[2] * this.TWO_PI) - Math.PI;

    const separation = this.separate(this.world.creatures);
    const alignment = this.align(this.world.creatures).setAngle(angle);
    const cohesion = this.seek(target);

    force.add(separation);
    force.add(alignment);
    force.add(cohesion);

    this.applyForce(force);
  },

  draw: function () {
    this.update();

    const ctx = this.world.context;
    ctx.lineWidth = 1;

    const angle = this.velocity.angle();

    const x1 = this.location.x + Math.cos(angle) * this.base;
    const y1 = this.location.y + Math.sin(angle) * this.base;

    const x2 = this.location.x + Math.cos(angle + this.HALF_PI) * this.base;
    const y2 = this.location.y + Math.sin(angle + this.HALF_PI) * this.base;

    const x3 = this.location.x + Math.cos(angle - this.HALF_PI) * this.base;
    const y3 = this.location.y + Math.sin(angle - this.HALF_PI) * this.base;

    ctx.lineWidth = 2;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
    ctx.fill();
  },

  update: function () {
    this.boundaries();
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    if (this.velocity.mag() < 1.5)
      this.velocity.setMag(1.5);
    this.location.add(this.velocity);
    this.acceleration.mul(0);
  },

  applyForce: function (force) {
    this.acceleration.add(force);
  },

  boundaries: function () {

    if (this.location.x < 15)
      this.applyForce(new Vector(this.maxforce * 2, 0));

    if (this.location.x > this.world.width - 15)
      this.applyForce(new Vector(-this.maxforce * 2, 0));

    if (this.location.y < 15)
      this.applyForce(new Vector(0, this.maxforce * 2));

    if (this.location.y > this.world.height - 15)
      this.applyForce(new Vector(0, -this.maxforce * 2));

  },

  seek: function (target) {
    const seek = target.copy().sub(this.location)
    seek.normalize();
    seek.mul(this.maxspeed);
    seek.sub(this.velocity).limit(0.3);

    return seek;
  },

  separate: function (neighboors) {
    const sum = new Vector(0, 0);
    let count = 0;

    for (let i in neighboors) {
      if (neighboors[i] != this) {
        const d = this.location.dist(neighboors[i].location)
        if (d < 24 && d > 0) {
          const diff = this.location.copy().sub(neighboors[i].location);
          diff.normalize();
          diff.div(d);
          sum.add(diff);
          count++;
        }
      }
    }
    if (!count)
      return sum;

    sum.div(count);
    sum.normalize();
    sum.mul(this.maxspeed);
    sum.sub(this.velocity)
    sum.limit(this.maxforce);

    return sum.mul(2);
  },

  align: function (neighbours) {
    const sum = new Vector(0, 0);
    let count = 0;

    for (let i in neighbours) {
      if (neighbours[i] != this)// && !neighbours[i].special)
      {
        sum.add(neighbours[i].velocity);
        count++;
      }
    }
    sum.div(count);
    sum.normalize();
    sum.mul(this.maxspeed);

    sum.sub(this.velocity).limit(this.maxspeed);

    return sum.limit(.1);
  },

  cohesion: function (neighboors) {
    const sum = new Vector(0, 0);
    let count = 0;
    for (let i in neighboors) {
      if (neighboors[i] != this)// && !neighboors[i].special)
      {
        sum.add(neighboors[i].location);
        count++;
      }
    }
    sum.div(count);

    return sum;
  }
}

export {Creature}
