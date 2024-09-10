import React from "react";
import { ARTICLES, WikiArticleLink } from "./components/WikiArticleLink";
import { AnchorController } from "./menu/Anchor";
import StandaloneWiki from "./menu/main/StandaloneWiki";
import { deleteReconnectData, loadReconnectData } from "./game/localStorage";
import GAME_MANAGER from ".";
import StartMenu from "./menu/main/StartMenu";

function uriAsFileURI(path: string): string {
    if (path.endsWith('/')) {
        return path.substring(0, path.length - 1);
    } else {
        return path;
    }
}

async function routeWiki(anchorController: AnchorController, page: string) {
    const wikiPage = uriAsFileURI(page);

    if (wikiPage === "") {
        anchorController.setContent(<StandaloneWiki />)
    } else if (ARTICLES.includes(wikiPage.substring(1) as any)) {
        anchorController.setContent(<StandaloneWiki initialWikiPage={wikiPage.substring(1) as WikiArticleLink}/>)
    } else {
        return await route404(anchorController, `/wiki${page}`);
    }
}

async function routeLobby(anchorController: AnchorController, roomCode: string) {
    const reconnectData = loadReconnectData();

    await GAME_MANAGER.setOutsideLobbyState();
    
    window.history.replaceState({}, "", `/${window.location.search}`);

    let success: boolean;
    try {
        const code = parseInt(roomCode, 18)
        if (reconnectData) {
            success = await GAME_MANAGER.sendRejoinPacket(code, reconnectData.playerId);
            

            if(!success) {
                deleteReconnectData();
                success = await GAME_MANAGER.sendJoinPacket(code);
            }
        }else{
            success = await GAME_MANAGER.sendJoinPacket(code);
        }
    } catch {
        success = false;
    }
    
    if (!success) {
        await GAME_MANAGER.setDisconnectedState();
        anchorController.clearCoverCard();
        anchorController.setContent(<StartMenu/>)
    }
}

async function route404(anchorController: AnchorController, path: string) {
    anchorController.setContent(
        <div className="hero" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <h1>404</h1>
            <p>The requested path ({path}) could not be found</p>
        </div>
    )
}

async function routeMain(anchorController: AnchorController) {
    window.history.replaceState({}, "", `/${window.location.search}`);

    const reconnectData = loadReconnectData();
    
    if (reconnectData) {
        await GAME_MANAGER.setOutsideLobbyState();

        const success = await GAME_MANAGER.sendRejoinPacket(reconnectData.roomCode, reconnectData.playerId);
        if (!success) {
            // Don't show an error message for an auto-rejoin. The user didn't prompt it - they will be confused.
            // Reconnect data is deleted in messageListener
            await GAME_MANAGER.setDisconnectedState();
            anchorController.clearCoverCard();
            anchorController.setContent(<StartMenu/>);
        }
    } else {
        anchorController.setContent(<StartMenu/>)
    }
}

export default async function route(anchorController: AnchorController, url: Location) {
    if (url.pathname.startsWith("/wiki")) {
        return await routeWiki(anchorController, url.pathname.substring(5));
    }

    const roomCode = new URLSearchParams(url.search).get("code");
    if (roomCode !== null) {
        return await routeLobby(anchorController, roomCode);
    }

    if (url.pathname && url.pathname !== '/') {
        return await route404(anchorController, url.pathname);
    }
    
    return await routeMain(anchorController);
}