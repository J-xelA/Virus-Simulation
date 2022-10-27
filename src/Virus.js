import Points from "./Points";

export class Coord {
	constructor(x, y) {
		this.x = x
		this.y = y
	}
}//Coord

export class Agent {
  constructor(p5, canvas, size, isInfected) {
    this.pos = location();
    this.vel = randomVelocity();
    this.direction = randomDirection();
    this.color = isInfected ? p5.color(255, 0, 0) : p5.color(0, 255, 0);
    this.canvas = canvas;
    this.size = size;
    this.infected = isInfected;
  }//constructor

  infect(p5) {
    this.infected = true;
    this.color = p5.color(255, 0, 0);
  }//infect()
}//Agent

function location() {
  let randomIndex = Math.ceil(Math.random() * Points.features.length-1);
  let randomLng = Points.features[randomIndex].properties.longitude;
  let randomLat = Points.features[randomIndex].properties.latitude;
  return new Coord(randomLat, randomLng);
}//location()

function randomVelocity() {
  return new Coord(
    (Math.random() * 0.0125) + 0.125,
    (Math.random() * 0.0125) + 0.125
  );
}//randomVelocity()

function randomDirection() {
  let sign = Math.random() < 0.5 ? -1 : 1;
  return new Coord(
    Math.random() * sign,
    Math.random() * sign
  );
}//randomDirection()