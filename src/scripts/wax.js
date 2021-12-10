import * as waxjs from "@waxio/waxjs/dist";
import { WAX_MAINNET } from "./constants";

export const wax = new waxjs.WaxJS(WAX_MAINNET, null, null, false);
