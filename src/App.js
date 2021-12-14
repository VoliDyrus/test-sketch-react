import React, { useState } from "react";
import { color } from "canvas-sketch-util";
import canvasSketch from "canvas-sketch";
import Canvas from "./Canvas";
import random from "canvas-sketch-util/random";
import math from "canvas-sketch-util/math";

const settings = {
  dimensions: [1080, 1080],
  animate: true,
  fps: 60,
};
const params = {
  n: 90,
  cr: 150,
  speed: 2,
};

function App() {
  const Vector = (x, y) => {
    return { x, y };
  };

  const getDistance = (v1, v2) => {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;

    return Math.sqrt((dx * dx + dy * dy) * 0.4);
  };

  const Agent = (x, y) => {
    const pos = Vector(x, y);
    const vel = Vector(random.range(-0.5, 0.5), random.range(-0.5, 0.5));
    const radius = random.range(4, 7);

    return { pos, vel, radius };
  };

  const Bounce = (width, height, Agent) => {
    if (Agent.pos.x <= 0 || Agent.pos.x >= width) Agent.vel.x *= -1;
    if (Agent.pos.y <= 0 || Agent.pos.y >= height) Agent.vel.y *= -1;
  };

  const Wrap = (width, height, Agent) => {
    if (Agent.pos.x > width) Agent.pos.x = 0;
    if (Agent.pos.y > height) Agent.pos.y = 0;
  };

  const Update = (Agent) => {
    Agent.pos.x += Agent.vel.x;
    Agent.pos.y += Agent.vel.y;
  };

  const draw = async (context, Agent) => {
    context.save();

    context.strokeStyle = "pink";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, Agent.radius, 0, Math.PI * 2);

    context.fill();
    context.stroke();

    context.restore();
  };

  const sketch = ({ width, height }) => {
    const agents = [];

    const n = params.n;
    const cr = params.cr;

    for (let i = 0; i < n; i++) {
      const x = random.range(0, width);
      const y = random.range(0, height);

      agents.push(Agent(x, y));
    }

    const cx = width / 2;
    const cy = height / 2;

    return ({ context, width, height }) => {
      context.fillStyle = "black";
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(cx, cy);
      context.fillStyle = "black";

      context.beginPath();
      context.arc(0, 0, cr, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.restore();

      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        for (let j = i + 1; j < agents.length; j++) {
          const other = agents[j];

          const dist = getDistance(other.pos, agent.pos);
          const distCenter = getDistance(Vector(cx, cy), agent.pos);

          if (dist >= 200) continue;

          context.lineWidth = math.mapRange(dist, 0, 200, 7, 0);

          context.beginPath();
          context.moveTo(agent.pos.x, agent.pos.y);
          context.lineTo(other.pos.x, other.pos.y);
          context.strokeStyle = color.style([
            math.mapRange(dist, 25, 70, 150, 80),
            math.mapRange(dist, 0, 50, 90, 10),
            math.mapRange(dist, 0, 130, 255, 150),
            math.mapRange(dist, 10, 300, 0.8, 0.2),
          ]);
          context.stroke();

          if (distCenter > cr) continue;
          agent.vel.x = agent.vel.x * -0.51;
          agent.vel.y = agent.vel.y * -0.51;
        }
      }

      agents.forEach((agent) => {
        Update(agent);
        draw(context, agent);
        Bounce(width, height, agent);
        Wrap(width, height, agent);
      });
    };
  };

  canvasSketch(sketch, settings);

  return <Canvas draw={draw} />;
}

export default App;
