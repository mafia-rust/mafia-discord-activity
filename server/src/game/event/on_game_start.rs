use crate::game::{components::{cult::Cult, mafia::Mafia, puppeteer_marionette::PuppeteerMarionette}, Game};

pub struct OnGameStart;
impl OnGameStart{
    pub fn invoke(game: &mut Game){
        Mafia::on_game_start(game);
        Cult::on_game_start(game);
        PuppeteerMarionette::on_game_start(game);
    }
}