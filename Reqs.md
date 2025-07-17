git npm (gamelobby) TS nextjs project. sqlite for short term storage. Storybook for all UI components. Cypress for E2E tests.

Should be a game lobby that can bring up Backgammon, Checkers, and Chess for couch co-op players OR one player vs. bots.
Add Gin Rummy to the mix. And Crazy 8s.

Each game should have a tutorial on how to play.

Main screen advertises what the system is and you can go find or start game lobbies. I guess Gin Rummy or Crazy 8s would have more than 1x1 lobbies. We'll support remote multiplayer soon and use Firebase for the game lobby and the in-game mechanics. Eventually to sync everything. Begin with the simplest games to implement, of course, but you know how they all work. Build a common command pattern mechanism both to support multilevel Undo across all games but to make games savable and replayable.

If you come up with a "subrequirement" add it to reqs-dep.md.