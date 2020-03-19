import { createTestClient } from 'apollo-server-testing';
import gql from 'graphql-tag';
import { buildTestGame } from '../../__tests__/dataBuilders/game';
import { makeTestServer } from '../../__tests__/test-server';
import { makeNullLobbyRepository } from '../../repos/lobby-repository';
import { makeGetDataSources } from '../../infra/graphql/get-data-sources';
import { makeGetContext } from '../../infra/graphql/get-context';
import { newGameCreatedEvent } from '../../domain/events';

describe('create new game', () => {
  it('creates a new game', async () => {
    // arrange
    const dispatchDomainEvents = jest.fn();
    const lobbyRepository = makeNullLobbyRepository({ nextGameId: 'g1' });
    const server = makeTestServer({
      getDataSources: makeGetDataSources({
        lobbyRepository,
      }),
      getContext: makeGetContext({ dispatchDomainEvents }),
    });
    const LOBBY_CREATE_GAME = gql`
      mutation LobbyCreateGame {
        lobbyCreateGame {
          game {
            id
          }
        }
      }
    `;
    const expectedGame = buildTestGame()
      .withId('g1')
      .build();

    // act
    const { mutate } = createTestClient(server);

    // assert
    const response = await mutate({ mutation: LOBBY_CREATE_GAME });
    const createdGame = await lobbyRepository.getGameById('g1');
    expect(response).toMatchSnapshot();
    expect(createdGame).toEqual(expectedGame);
    expect(dispatchDomainEvents).toHaveBeenCalledWith([newGameCreatedEvent({ gameId: 'g1' })]);
  });
});
