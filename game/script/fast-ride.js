// Pixel's quick way between the farm and town, from Day 3 on, once the store stands (the book:
// she "is always waiting outside your shop"). Days 3–5 use it; Day 1's road is walked and ridden
// as before, and the road itself stays open on every day.
//
// In town Pixel waits west of the store door whenever Emily is on foot there: after coming out
// of a building, or after riding in this way. Arriving by the road, Emily is still on her back
// and there is no second horse. At the farm she stands at her usual hitch by the house. Face
// her and press E: one fade, straight to the other end (no foglands-road), a heart and an hour,
// the same as riding the road.
//
// Wiring in a day script (see day03.js):
//   nodes: ...rideNodes('d3')
//   const ride = createFastRide(ctx, kit, 'd3');
//   mapBuilt: world.setRiding(ridesOn(state, mapId) && !ride.afoot(mapId)); then ride.mapBuilt(mapId)
//   handlerFor: if (target.npc === 'pixel') return ride.handler();
import { changeMap } from '../transitions.js';

export const storeHitch = { x: 20, y: 12 }; // in town, two tiles west of the store door, facing east
export const farmSpawn = 'by-pixel'; // maps/day03-foglands-farm.js: beside the hitch
export const townSpawn = 'from-store'; // maps/day03-friendship.js: in front of the store door
export const rideHearts = 1;

// The ride's two questions, one set per day (node ids are unique across days).
export function rideNodes(prefix) {
  return [
    {
      id: `${prefix}.pixel.to-town`,
      kind: 'narration',
      text: 'Pixel knows the way to town.',
      authored: true,
      choices: [
        { label: 'Ride to town', authored: true, silent: true, value: 'ride' },
        { label: 'Not now', authored: true, silent: true, value: 'no' },
      ],
    },
    {
      id: `${prefix}.pixel.to-farm`,
      kind: 'narration',
      text: 'Pixel is waiting outside the store.',
      authored: true,
      choices: [
        { label: 'Ride to the farm', authored: true, silent: true, value: 'ride' },
        { label: 'Not now', authored: true, silent: true, value: 'no' },
      ],
    },
  ];
}

export function createFastRide(ctx, kit, prefix) {
  const { state, world } = ctx;
  const open = () => Boolean(state.flags.boughtHorse && state.flags.storeBuilt);

  const ride = {
    // Emily is on foot in town when she did not ride in by the road (Pixel is at the store).
    afoot(mapId) {
      return mapId === 'friendship' && open() && state.spawn !== 'from-east' && state.spawn !== 'from-train';
    },

    // Stands Pixel outside the store when Emily is on foot in town (the farm's hitch is the day's own).
    mapBuilt(mapId) {
      if (!open()) return;
      if (ride.afoot(mapId)) world.showPixel(storeHitch, 'east');
      if (mapId === 'friendship' || mapId === 'foglands') {
        kit.hint('fast-ride', 'Pixel knows the way: face her and press E to ride straight between the farm and town.', 5200);
      }
    },

    // The E handler for Pixel, or null where she offers no ride.
    handler() {
      if (!open()) return null;
      if (state.map === 'foglands') return () => go('to-town', 'friendship', townSpawn);
      if (ride.afoot(state.map)) return () => go('to-farm', 'foglands', farmSpawn);
      return null;
    },

    // The headless routes: the ride without the question.
    toTown: () => travel('friendship', townSpawn),
    toFarm: () => travel('foglands', farmSpawn),
  };

  async function go(topic, mapId, spawn) {
    if ((await kit.talk(`${prefix}.pixel.${topic}`)) !== 'ride') return;
    await travel(mapId, spawn);
  }

  async function travel(mapId, spawn) {
    kit.loseHearts(rideHearts);
    await changeMap(ctx, mapId, spawn); // one fade; the clock moves an hour
  }

  return ride;
}

// ---------------------------------------------------------------- Pixel at the hitch
// On days without the store ride (Day 2, Days 6–10) Pixel waits at the farm hitch and the
// vineyard gate while Emily is on foot. Face her and press E: one fade to the other place,
// mounted where the day rides, at the same heart cost as the road would have been.
//
// Wiring in a day script (see day02.js):
//   nodes: ...hitchNodes('d2', ['to-town', 'home'])
//   const hitch = createHitchRide(ctx, kit, 'd2', { foglands: hitchRoutes.toTown(...), vineyard: hitchRoutes.home() });
//   handlerFor: if (target.npc === 'pixel') return hitch.handler();
//   mapBuilt (foglands): hitch.hint();
const hitchTopics = {
  'to-town': { text: 'Pixel knows the way to town.', label: 'Ride to town' },
  'to-vineyard': { text: 'Pixel knows the way down the hill.', label: 'Ride to Alabaster’s' },
  home: { text: 'Pixel waits by the gate.', label: 'Ride home' },
};

export function hitchNodes(prefix, topics) {
  return topics.map((topic) => ({
    id: `${prefix}.pixel.${topic}`,
    kind: 'narration',
    text: hitchTopics[topic].text,
    authored: true,
    choices: [
      { label: hitchTopics[topic].label, authored: true, silent: true, value: 'ride' },
      { label: 'Not now', authored: true, silent: true, value: 'no' },
    ],
  }));
}

// Where each ride goes. `hearts` is a number or a function (Day 6's road costs more some weeks).
export const hitchRoutes = {
  toTown: (hearts = 1) => ({ topic: 'to-town', to: 'friendship', spawn: 'from-east', hearts }),
  toVineyard: (hearts = 0) => ({ topic: 'to-vineyard', to: 'vineyard', spawn: 'from-road', hearts }),
  home: (hearts = 0) => ({ topic: 'home', to: 'foglands', spawn: 'from-road', hearts }),
};

// routes: { mapId: route }. options.open(): false while the day keeps her off the horse;
// options.after(route): runs after the fade, e.g. a line the road would have said.
export function createHitchRide(ctx, kit, prefix, routes, { open = () => true, after } = {}) {
  const { state } = ctx;
  const routeHere = () => (state.flags.boughtHorse && open() ? routes[state.map] ?? null : null);

  return {
    handler() {
      const route = routeHere();
      return route ? () => ride(route) : null;
    },
    hint() {
      if (routeHere()) kit.hint('pixel-ride', 'Pixel waits by the house: face her and press E to ride.', 5200);
    },
  };

  async function ride(route) {
    if ((await kit.talk(`${prefix}.pixel.${route.topic}`)) !== 'ride') return;
    const hearts = typeof route.hearts === 'function' ? route.hearts() : route.hearts;
    if (hearts) kit.loseHearts(hearts);
    await changeMap(ctx, route.to, route.spawn); // one fade; the clock moves an hour
    await after?.(route);
  }
}
