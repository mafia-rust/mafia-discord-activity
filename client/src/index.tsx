import React from 'react';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import ReactDOM from 'react-dom/client';
import './index.css';
import Anchor from './menu/Anchor';
import { GameManager, createGameManager } from './game/gameManager';
import LoadingScreen from './menu/LoadingScreen';
import route from './routing';

// Instantiate the SDK
const discordSdk = new DiscordSDK(process.env.REACT_APP_DISCORD_CLIENT_ID!);

discordSdk.ready().then(() => {
    console.log("Discord SDK is ready")
});

export type Theme = "player-list-menu-colors" | "will-menu-colors" | "role-specific-colors" | "graveyard-menu-colors" | "wiki-menu-colors"

const ROOT = ReactDOM.createRoot(document.querySelector("#root")!);
const GAME_MANAGER: GameManager = createGameManager();
const TIME_PERIOD = 1000;
export default GAME_MANAGER;

setInterval(() => {
    GAME_MANAGER.tick(TIME_PERIOD);
}, TIME_PERIOD);

ROOT.render(
    <Anchor onMount={anchorController => route(anchorController, window.location)}>
        <LoadingScreen type="default"/>
    </Anchor>
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
