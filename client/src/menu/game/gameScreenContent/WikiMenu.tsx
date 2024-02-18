import React, { ReactElement } from "react";
import GAME_MANAGER from "../../../index";
import { ContentMenu, ContentTab } from "../GameScreen";
import "./wikiMenu.css"
import translate from "../../../game/lang";
import WikiSearch from "../../../components/WikiSearch";
import { getRolesFromRoleListRemoveExclusionsAddConversions, getRolesComplement } from "../../../game/roleListState.d";

export default function WikiMenu(): ReactElement {
    return <div className="wiki-menu wiki-menu-colors">
        <ContentTab close={ContentMenu.WikiMenu} helpMenu={null}>{translate("menu.wiki.title")}</ContentTab>
        
        <div className="wiki-menu-search">
            <WikiSearch excludedRoles={
                GAME_MANAGER.state.stateType === "lobby" || GAME_MANAGER.state.stateType === "game" ?
                getRolesComplement(getRolesFromRoleListRemoveExclusionsAddConversions(GAME_MANAGER.state.roleList, GAME_MANAGER.state.excludedRoles)) : []
            }/>
        </div>
    </div>
}