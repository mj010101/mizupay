import { SuiClient } from "@mysten/sui/client";
import { FULLNODE_URL } from "../suiConfig";

export const suiClient = new SuiClient({ url: FULLNODE_URL });
