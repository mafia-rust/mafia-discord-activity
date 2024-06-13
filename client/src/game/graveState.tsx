import { PlayerIndex } from "./gameState.d";
import { Faction } from "./roleListState.d";
import { Role } from "./roleState.d";

export type Grave = {
    player: PlayerIndex,
    diedPhase: GravePhase,
    dayNumber: number,
    information: GraveInformation,
}

export type GraveInformation ={ 
    type: "obscured",
} | {
    type: "normal",
    
    role: Role,
    will: string,
    deathCause: GraveDeathCause,
    deathNotes: string[],
}

export type GraveDeathCause = {
    type: "lynching" | "leftTown"
} | {
    type: "killers"
    killers: GraveKiller[]
}
export type GraveKiller = {
    type: "faction"
    value: Faction
} | {
    type: "suicide"
} | {
    type: "quit"
} | {
    type: "role"
    value: Role
};

export type GravePhase = "day" | "night"