import GameState, { Phase, PhaseTimes, PlayerIndex, Verdict } from "./gameState.d";
import { ToClientPacket, ToServerPacket } from "./packet";
import { RoleListEntry } from "./roleListState.d";

export interface Server {
    ws: WebSocket | null,

    openListener(event: Event): void;
    closeListener(event: CloseEvent): void;
    messageListener(event: MessageEvent<string>): void;

    open(): Promise<void>;
    sendPacket(packets: ToServerPacket): void;
    close(): void;
}

type StateEventType = ToClientPacket["type"] | "tick";
export type StateListener = (type?: StateEventType) => void;

export interface GameManager {
    roomCode: string | null,
    
    gameState: GameState,

    server: Server,
    listeners: StateListener[],

    addStateListener(listener: StateListener): void;
    removeStateListener(listener: StateListener): void;
    invokeStateListeners(type?: StateEventType): void;

    tryJoinGame(roomCode: string): Promise<void>;
    leaveGame(): void;

    sendHostPacket(): void;
    sendJoinPacket(): Promise<void>;
    sendSetNamePacket(name: string): void;
    sendStartGamePacket(): void;
    sendSetPhaseTimePacket(phase: Phase, time: number): void;
    sendSetPhaseTimesPacket(phaseTimeSettings: PhaseTimes): void;
    sendSetRoleListPacket(roleListEntries: RoleListEntry[]): void;
    
    sendJudgementPacket(judgement: Verdict): void;
    sendVotePacket(voteeIndex: PlayerIndex| null): void;
    sendTargetPacket(targetIndexList: number[]): void;
    sendDayTargetPacket(targetIndex: number): void;
    sendSaveWillPacket(will: string): void;
    sendSaveNotesPacket(notes: string): void;
    sendSendMessagePacket(text: string): void;
    sendSendWhisperPacket(playerIndex: number, text: string): void;
    sendExcludedRolesPacket(roles: RoleListEntry[]): void;
    
    messageListener(serverMessage: ToClientPacket): void;

    tick(timePassedms: number): void;

}

export declare function createGameManager(): GameManager;