import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Anchor from './menu/Anchor';
import { GameManager, createGameManager } from './game/gameManager';
import StartMenu from './menu/main/StartMenu';
import LoadingScreen from './menu/LoadingScreen';
import LobbyMenu from './menu/lobby/LobbyMenu';
import GameScreen from './menu/game/GameScreen';
import { deleteReconnectData, loadReconnectData } from './game/localStorage';
import translate from './game/lang';

const ROOT = ReactDOM.createRoot(document.querySelector("#root")!);
const GAME_MANAGER: GameManager = createGameManager();
const TIME_PERIOD = 1000;
export default GAME_MANAGER;

setInterval(() => {
    GAME_MANAGER.tick(TIME_PERIOD);
}, TIME_PERIOD);

async function route(url: Location) {
    Anchor.stopAudio();
    const roomCode = new URLSearchParams(url.search).get("code");
    let reconnectData = loadReconnectData();
    
    const HOUR_IN_SECONDS = 3_600_000;
    if (reconnectData && reconnectData.lastSaveTime < Date.now() - HOUR_IN_SECONDS) {
        reconnectData = null;
        deleteReconnectData();
    }

    if (roomCode !== null) {
        await GAME_MANAGER.setOutsideLobbyState();
        
        window.history.replaceState({}, document.title, window.location.pathname);

        let success: boolean;
        try {
            const code = parseInt(roomCode, 18)
            success = await GAME_MANAGER.sendJoinPacket(code);
        } catch {
            success = false;
        }
        if (success) {
            Anchor.setContent(<LobbyMenu/>)
        } else {
            await GAME_MANAGER.setDisconnectedState();
            Anchor.setContent(<StartMenu/>)
        }
    } else if (reconnectData) {        
        await GAME_MANAGER.setOutsideLobbyState();

        const success = await GAME_MANAGER.sendRejoinPacket(reconnectData.roomCode, reconnectData.playerId);
        if (success) {
            if (GAME_MANAGER.state.stateType === "lobby")
                Anchor.setContent(<LobbyMenu/>)
            else if(GAME_MANAGER.state.stateType === "game")
                Anchor.setContent(GameScreen.createDefault())
        } else {
            // Don't show an error message for an auto-rejoin. The user didn't prompt it - they will be confused.
            // Reconnect data is deleted in messageListener
            await GAME_MANAGER.setDisconnectedState();
            Anchor.clearCoverCard();
            Anchor.setContent(<StartMenu/>);
        }
    } else {
        Anchor.setContent(<StartMenu/>)
    }
}

ROOT.render(
    <Anchor 
        content={<LoadingScreen type="default"/>} 
        onMount={() => route(window.location)}
    />
);

export function find(text: string): RegExp {
    // Detect if iOS <= 16.3
    // https://bugs.webkit.org/show_bug.cgi?id=174931
    // https://stackoverflow.com/a/11129615
    if(
        /(iPhone|iPod|iPad)/i.test(navigator.userAgent) && 
        /OS ([2-9]_\d)|(1[0-5]_\d)|(16_[0-3])(_\d)? like Mac OS X/i.test(navigator.userAgent)
    ) { 
        // This won't work if a keyword starts with a symbol.
        return RegExp(`\\b${regEscape(text)}(?!\\w)`, "gi");
    } else {
        return RegExp(`(?<!\\w)${regEscape(text)}(?!\\w)`, "gi");
    }
}

export function regEscape(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export function replaceMentions(rawText: string, playerNames?: string[]) {

    if (playerNames === undefined) {
        playerNames = GAME_MANAGER.getPlayerNames();
        if (playerNames === undefined) {
            return rawText;
        }
    }

    let text = rawText;
    playerNames.forEach((player, i) => {
        text = text.replace(find(`@${i + 1}`), player);
    });
    playerNames.forEach((player, i) => {
        text = text.replace(find(`@${player}`), player);
    });
    return text;
}

export function modulus(n: number, m: number) {
    return ((n % m) + m) % m;
}

export async function writeToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard) {
        Anchor.pushError(translate("notification.clipboard.write.failure"), translate("notification.clipboard.write.failure.noClipboard"));
        return false;
    }

    try {
        await navigator.clipboard.writeText(text);
        Anchor.pushError(translate("notification.clipboard.write.success"), "");
        return true;
    } catch (error) {
        Anchor.pushError(
            translate("notification.clipboard.read.failure"), 
            translate("notification.clipboard.read.failure.notAllowed")
        );
        return false;
    }
}

export async function readFromClipboard(): Promise<string | null> {
    if (!navigator.clipboard) {
        Anchor.pushError(translate("notification.clipboard.read.failure"), translate("notification.clipboard.read.failure.noClipboard"));
        return null;
    }

    try {
        const text = await navigator.clipboard.readText();
        Anchor.pushError(translate("notification.clipboard.read.success"), "");
        return text;
    } catch (error) {
        switch ((error as any as DOMException).name) {
            case "NotFoundError":
                Anchor.pushError(
                    translate("notification.clipboard.read.failure"), 
                    translate("notification.clipboard.read.failure.notFound")
                );
                return null;
            case "NotAllowedError":
            default:
                Anchor.pushError(
                    translate("notification.clipboard.read.failure"), 
                    translate("notification.clipboard.read.failure.notAllowed")
                );
                return null;
        }
    }
}