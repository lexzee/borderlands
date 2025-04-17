const host: string = "http://127.0.0.1:5000";

function encode(data: {}) {
  let string = JSON.stringify(data);
  return string;
}

const headers = {
  "Content-type": "application/json; charset=UTF-8",
  // LK_PHN_MODEL: phoneModel,
  // LK_APP_VERSION: "4.2.0",
  // 'LK_OS_VERSION': 12,
};

// Create Game
async function init_game(num_players: number) {
  try {
    const res = await fetch(`${host}/init_game`, {
      method: "POST",
      body: encode({ num_players: num_players }),
      headers,
      // mode: "no-cors",
    });

    if (!res.ok) {
      let msg = await res.json();
      throw new Error(msg["error"]);
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Join game
async function player_connect(game_id: number) {
  try {
    const res = await fetch(`${host}/games/${game_id}/players`, {
      method: "POST",
      headers,
      // mode: "no-cors",
    });

    if (!res.ok) {
      let msg = await res.json();
      throw new Error(msg["error"]);
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Player Ready
async function player_ready(game_id: number, player_id: number) {
  try {
    const res = await fetch(
      `${host}/games/${game_id}/players/${player_id}/ready`,
      {
        method: "PUT",
        headers,
      }
    );

    if (!res.ok) {
      let msg = await res.json();
      throw new Error(msg["error"]);
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

export { init_game, player_connect, player_ready };
