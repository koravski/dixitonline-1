import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
import { makeNullLobbyRepository } from '../../repos/lobby-repository';
import { makeGetDataSources } from '../../infra/graphql/get-data-sources';
import { makeTestServer } from '../../__tests__/test-server';
import { buildTestGame } from '../../__tests__/dataBuilders/game';

describe('getGames', () => {
  test('gets all the lobby games', async () => {
    // arrange
    const initialGames = {
      g1: buildTestGame()
        .withId('g1')
        .build(),
      g2: buildTestGame()
        .withId('g2')
        .build(),
    };
    const server = makeTestServer({
      getDataSources: makeGetDataSources({
        lobbyRepository: makeNullLobbyRepository({
          nextGameId: 'g3',
          gamesData: initialGames,
        }),
      }),
    });
    const LOBBY_GAMES = gql`
      query LobbyGames {
        lobbyGames {
          id
        }
      }
    `;

    // act
    const { query } = createTestClient(server);

    // assert
    const response = await query({ query: LOBBY_GAMES });
    expect(response).toMatchSnapshot();
  });
});