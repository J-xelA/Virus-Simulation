import { Agent, Coord } from "./Virus"; // Classes and helpers
import Mappa from "mappa-mundi"; // MapboxGL helper
import Coastline from "./Coastline"; // Global coastline geojson of lat & lng coordinates

const size = 3;

const popSize = 1000;
const population = []; // Population of all agents
const infected = []; // Population of infected agents

const W = 1100;
const H = 700;

const key = process.env.REACT_APP_API_KEY;

const mappa = new Mappa('MapboxGL', key);
let canvas;
let myMap;

const options = {
  lat: 30,
  lng: 0,
  zoom: 1,
  style: 'mapbox://styles/mapbox/traffic-night-v2'
};

export function setup(p5, canvasParentRef) {
  canvas = p5.createCanvas(W, H).parent(canvasParentRef);

  // Create the tiled map
  myMap = mappa.tileMap(options);
  // Apply the tiled map to the canvas as an overlay
  myMap.overlay(canvas);

  // Populate healthy individuals
  for(let i = 1; i < popSize; ++i){
    populate(p5, false);  
  }//for

  // Populate an infected individual
  populate(p5, true);
}//setup()

function populate(p5, isInfected) {
  if(!isInfected)
    population.push(new Agent(p5, new Coord(W, H), size, false));
  else {
    const carrier = new Agent(p5, new Coord(W, H), size, true);
    population.push(carrier);
    infected.push(carrier);
  }//else
}//populate()

let frameCount = 0;
const buffer = 50;

export function draw(p5) {
  frameCount++;
  p5.clear();

  let world = [];
  drawCoastline(p5, world);
  
  for(const a of population) {
    if(!checkComplete() && frameCount >= buffer){
      if(!checkBorderCollision(a, world)) {
        let sign = Math.random() < 0.5 ? -1 : 1;
        if(sign === 1)
          a.direction.x *= -1;
        else
          a.direction.y *= -1;
      }//if
      move(a);
    }
    p5.fill(a.color);

    // Render
    let positionA = myMap.latLngToPixel(a.pos.x, a.pos.y);
    p5.ellipse(positionA.x, positionA.y, a.size, a.size); // LatLng -> pixel

    // Check ellipse collision
    for(const b of population)
      checkCollision(p5, a, b);
  }//for

  updateText(p5);
}//draw()

function drawCoastline(p5, world) {
  p5.noFill();
  p5.noStroke();
  // p5.fill(255,255,255,75);
  let coord;
  let coast;
  let coastline;
  for(let i = 0; i < Coastline.geometries.length; ++i) {
    coastline = [];
    coord = Coastline.geometries[i].coordinates;
    p5.beginShape();
    for(let j = 0; j < coord.length; ++j) {
      const lng = coord[j][0];
      const lat = coord[j][1];
      coast = myMap.latLngToPixel(lat, lng);
      coastline.push([lat,lng]);
      p5.vertex(coast.x, coast.y);
    }//for
    p5.endShape(p5.CLOSE);
    world.push(coastline);
  }//for
}//drawCoastline()

function checkComplete() {
  if(population.length - infected.length === 0)
    return true;
}//checkComplete()

function checkBorderCollision(a, world) {
  let collision = false;
  let pX = a.pos.x;
  let pY = a.pos.y;
  let adjacent = 0;

  for(let i = 0; i < world.length; ++i) {
    for(let current = 0; current < world[i].length; ++current) {
      adjacent = current+1;
      if(adjacent === world[i].length)
        adjacent = 0;

      let vCx = world[i][current][0];
      let vCy = world[i][current][1];
      let vNx = world[i][adjacent][0];
      let vNy = world[i][adjacent][1];

      if((vCy >= pY && vNy < pY) || (vCy < pY && vNy >= pY))
        if(pX < (vNx - vCx) * (pY - vCy) / (vNy - vCy) + vCx)
          collision = !collision;
    }//for    
  }//for
  return collision;
}//checkBorderCollision()

function move(a) {
  a.pos.x += a.vel.x * a.direction.x;
  a.pos.y += a.vel.y * a.direction.y;
  if(a.pos.x >= 90)
    a.pos.x = -90;
  else if(a.pos.x <= -90)
    a.pos.x = 90;
  if(a.pos.y >= 180)
    a.pos.y = -180;
  else if(a.pos.y <= -180)
    a.pos.y = 180;
}//move()

function checkCollision(p5, a, b) {
  let reach = a.size/2;
  if(p5.dist(a.pos.x, a.pos.y, b.pos.x, b.pos.y) <= reach){
    if(isOneInfected(a, b)){
      a.infect(p5);
      b.infect(p5);
      infected.push(a.infected);
    }//if
  }//for
}//checkCollision()

function isOneInfected(a, b) {
  return (
    (a.infected || b.infected)
    &&
    !(a.infected && b.infected)
  );
}//isOneInfected()

function updateText(p5) {
  p5.select('#infected').html(`Infected: ${infected.length}`);
  p5.select('#healthy').html(`Healthy: ${population.length - infected.length}`);
}//updateText()