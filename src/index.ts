import { Client } from "discord-rpc";
import { YandexMusicClient } from "yandex-music-client/YandexMusicClient";

type ActivityType = {
  details: string;
  artist: string;
  endTimeStamp: number;
  buttons: [{ label: string; url: string }];
  largeImageKey: string;
  smallImageKey: string;
  largeImageText: string;
  smallImageText: string;
};
// Информация о том как получить токены наисана в README
const yandexToken = ``;
const discordClientToken = "";

const device = `os=unknown; os_version=unknown; manufacturer=unknown; model=unknown; clid=unknown; device_id=unknown; uuid=unknown`;

const acivityData: ActivityType = {
  details: "",
  artist: "",
  endTimeStamp: 0,
  buttons: [
    {
      label: "",
      url: "",
    },
  ],
  largeImageKey: ``,
  smallImageKey: "music",
  largeImageText: "",
  smallImageText: "Туц туц",
};

const aunthClient = new YandexMusicClient({
  BASE: "https://api.music.yandex.net:443",
  HEADERS: {
    Authorization: `OAuth ${yandexToken}`,
    "Accept-Language": "ru",
  },
});
const client = new Client({ transport: "ipc" });

client.on("ready", () => {
  setInterval(async () => {
    try {
      const queues = await aunthClient.queues.getQueues(device);
      const currentQueue = await aunthClient.queues.getQueueById(
        queues.result.queues[0].id,
      );

      const { tracks, currentIndex } = currentQueue.result;

      const currentTrackId = tracks?.at(currentIndex || 0);

      if (currentTrackId) {
        const currentTrack = (
          await aunthClient.tracks.getTracks({
            "track-ids": [
              `${currentTrackId?.trackId}:${currentTrackId?.albumId}`,
            ],
          })
        ).result[0];

        for (const artist of currentTrack.artists) {
          acivityData.artist = artist.name;
          if (
            acivityData.artist.split(", ").length !==
              currentTrack.artists.length &&
            currentTrack.artists.length !==
              currentTrack.artists.indexOf(artist) + 1
          ) {
            acivityData.artist += ", ";
          }
        }
        if (acivityData.details !== currentTrack.title) {
          acivityData.endTimeStamp = Date.now() + currentTrack.durationMs;

          acivityData.details = currentTrack.title;
          acivityData.largeImageText = currentTrack.title;
          if (acivityData.buttons) {
            acivityData.buttons = [
              {
                label:
                  acivityData.details.length > 32
                    ? "Слушать " + acivityData.details.substring(0, 20) + "..."
                    : "Слушать " + acivityData.details,
                url: `https://music.yandex.ru/album/${currentTrackId?.albumId}/track/${currentTrackId?.trackId}`,
              },
            ];
          }
        }
        // https://avatars.yandex.net/get-music-content/42108/d76dcfd9.a.2801448-1/400x400
        acivityData.largeImageKey = currentTrack.coverUri.replace(
          "%%",
          "200x200",
        );
      }
      if (acivityData.endTimeStamp > Date.now()) {
        client.setActivity({
          details: acivityData.details,
          buttons: acivityData.buttons,
          state: acivityData.artist,
          endTimestamp: acivityData.endTimeStamp,
          smallImageKey: "headphones",
          largeImageKey: "52c887278299",
          smallImageText: acivityData.smallImageText,
          largeImageText: acivityData.largeImageText,
          // assets: {
          //   large_image: acivityData.largeImageKey,
          // },
        });
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, 900);
});
console.log("rpc active");

client.login({
  clientId: discordClientToken,
});
