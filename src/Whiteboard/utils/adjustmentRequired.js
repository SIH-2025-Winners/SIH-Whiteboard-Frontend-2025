import { toolTypes } from "../../constants";

export const adjustmentRequired = (type) =>
  [toolTypes.RECTANGLE, toolTypes.LINE, toolTypes.TRIANGLE, toolTypes.CIRCLE,
   toolTypes.DIAMOND, toolTypes.STAR, toolTypes.ARROW, toolTypes.PENTAGON,
   toolTypes.HEXAGON, toolTypes.HEART, toolTypes.CLOUD].includes(type);
