export default function fetchEndpoint(username, year, month) {
    const CHESS_ENDPOINT = `https://api.chess.com/pub/player/${username}/games/${year}/${month}`;
    return fetch(CHESS_ENDPOINT)
    .then(response => response.json())
    .then(data => {
        if (data && data.games && Array.isArray(data.games)) {
            const currentDate = new Date(); // Get the current date
            currentDate.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison

            const endTimesToday = data.games
                .filter(game => {
                    const endTime = new Date(game.end_time * 1000); // Convert Unix timestamp to milliseconds
                    endTime.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for comparison
                    return endTime.getTime() === currentDate.getTime(); // Check if the game's end time is today
                })
                .map(game => game.end_time);
            console.log("Games played today: ", endTimesToday.length)
            return endTimesToday;
        } else {
            throw new Error("No games data found or invalid format.");
        }
    })
    .catch(error => {
        throw error;
    });
}

