import { error } from "console";

// const host: string = "http://127.0.0.1:5000";
const host: string = "http://192.168.173.148:5000";

function encode(data: {}) {
  let string = JSON.stringify(data);
  return string;
}

const headers = {
  "Content-type": "application/json",
};

// Create Game
async function init_game(num_players: number) {
  try {
    const res = await fetch(`${host}/init_game`, {
      method: "POST",
      body: encode({ num_players: num_players }),
      headers,
    });

    if (!res.ok) {
      let msg = await res.json();
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Join game
async function player_connect(game_code: string, name: string) {
  try {
    const res = await fetch(`${host}/games/${game_code}/players`, {
      method: "POST",
      headers,
      body: encode({ name: name }),
    });

    if (!res.ok) {
      let msg = await res.json();
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Player Ready
async function player_ready(game_code: string, player_id: number) {
  try {
    const res = await fetch(
      `${host}/games/${game_code}/players/${player_id}/ready`,
      {
        method: "PUT",
        headers,
      }
    );

    if (!res.ok) {
      let msg = await res.json();
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Check Ready
async function check_ready(game_code: string) {
  try {
    const res = await fetch(`${host}/games/${game_code}/check_ready`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      let msg = await res.json();
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Start Game
async function start_game(game_code: string) {
  try {
    const res = await fetch(`${host}/start_game/${game_code}`, {
      method: "PUT",
      headers,
    });

    if (!res.ok) {
      let msg = await res.json();
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

// Round Entry
async function round_entry(
  game_code: string,
  player_id: number,
  entry: number,
  round_number: number
) {
  try {
    const res = await fetch(`${host}/games/${game_code}/rounds/${player_id}`, {
      method: "POST",
      body: encode({ entry: entry, round_number: round_number }),
      headers,
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

// Process Round
async function process_round(game_code: string, round_number: number) {
  try {
    const res = await fetch(
      `${host}/games/${game_code}/rounds/${round_number}/process_round`,
      {
        method: "POST",
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

// Check disqualification
async function disqualify(game_code: string) {
  try {
    const res = await fetch(`${host}/disqualify/${game_code}`, {
      method: "PUT",
      headers,
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

// Check gameover
async function check_gameover(game_code: string) {
  try {
    const res = await fetch(`${host}/check_gameover/${game_code}`, {
      method: "PUT",
      headers,
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

// Misc
// Show games
async function games() {
  try {
    const res = await fetch(`${host}/games`, {
      method: "GET",
      headers,
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
// Show players
async function get_players(game_code: string) {
  try {
    const res = await fetch(`${host}/games/${game_code}/get_players`, {
      method: "GET",
      headers,
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
// Show round Entries
async function get_round(game_code: string) {
  try {
    const res = await fetch(`${host}/get_round/${game_code}`, {
      method: "GET",
      headers,
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

// GEt game
async function get_game(game_code: string) {
  try {
    const res = await fetch(`${host}/get_game/${game_code}`, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      let msg = await res.json();
      // throw new Error(msg["error"]);
      return { error: msg.error };
    }

    return res.json();
  } catch (error) {
    return error;
  }
}

export {
  init_game,
  player_connect,
  player_ready,
  check_ready,
  round_entry,
  process_round,
  disqualify,
  check_gameover,
  games,
  get_players,
  get_round,
  get_game,
  start_game,
};
