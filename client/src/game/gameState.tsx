import GameState, { LobbyPlayer, LobbyState, Player, PlayerID } from "./gameState.d"


export function createLobbyState(): LobbyState {
    return {
        stateType: "lobby",
        roomCode: 0,
        lobbyName: "Mafia Lobby",

        myId: null,

        roleList: [],
        excludedRoles: [],
        phaseTimes: {
            briefing: 20,
            morning: 5,
            discussion: 45, 
            voting: 30, 
            testimony: 20, 
            judgement: 20, 
            evening: 7, 
            night: 37,
        },

        players: new Map<PlayerID, LobbyPlayer>(),
    }
}

export function createGameState(): GameState {
    return {
        stateType: "game",
        roomCode: 0,

        myIndex: null,

        chatMessages : [],
        graves: [],
        players: [],
        
        playerOnTrial: null,
        phase: null,
        timeLeftMs: 0,
        dayNumber: 1,

        roleState: null,

        will: "",
        notes: "",
        crossedOutOutlines: [],
        chatFilter: null,
        deathNote: "",
        targets: [],
        voted: null,
        judgement: "abstain",
        fastForward: false,
        
        roleList: [],
        excludedRoles: [],
        phaseTimes: {
            briefing: 20,
            morning: 15,
            discussion: 46,
            voting: 30,
            testimony: 24,
            judgement: 20,
            evening: 10,
            night: 37
        },

        ticking: true,
    }
}

export function createPlayer(name: string, index: number): Player {
    return{
        name: name,
        index: index,
        buttons: {
            dayTarget: false,
            target: false,
            vote: false,
        },
        numVoted: 0,
        alive: true,
        roleLabel: null,
        playerTags: [],
        host: false,

        toString() {
            return ""+(this.index+1)+": " + this.name;
        }
    }
}


