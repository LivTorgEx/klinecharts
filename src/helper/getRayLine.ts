import { Bounding, Coordinate, LineAttrs, utils } from "klinecharts";

export function getRayLine(
  coordinates: Coordinate[],
  bounding: Bounding
): LineAttrs | LineAttrs[] {
  if (coordinates.length > 1) {
    let coordinate = { x: 0, y: 0 };
    if (
      coordinates[0].x === coordinates[1].x &&
      coordinates[0].y !== coordinates[1].y
    ) {
      if (coordinates[0].y < coordinates[1].y) {
        coordinate = {
          x: coordinates[0].x,
          y: bounding.height,
        };
      } else {
        coordinate = {
          x: coordinates[0].x,
          y: 0,
        };
      }
    } else if (coordinates[0].x > coordinates[1].x) {
      coordinate = {
        x: 0,
        y: utils.getLinearYFromCoordinates(coordinates[0], coordinates[1], {
          x: 0,
          y: coordinates[0].y,
        }),
      };
    } else {
      coordinate = {
        x: bounding.width,
        y: utils.getLinearYFromCoordinates(coordinates[0], coordinates[1], {
          x: bounding.width,
          y: coordinates[0].y,
        }),
      };
    }
    return { coordinates: [coordinates[0], coordinate] };
  }
  return [];
}
