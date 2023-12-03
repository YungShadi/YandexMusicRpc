import { Client } from "discord-rpc";
import { YandexMusicClient } from "yandex-music-client/YandexMusicClient";
import { yandexToken, discordClientToken } from "../exports";

type ActivityType = {
  details: string;
  artist: string;
  endTimeStamp: number;
  buttons: { label: string; url: string }[];
  largeImageKey: string;
  smallImageKey: string;
  largeImageText: string;
  smallImageText: string;
};
// Информация о том как получить токены наисана в README
// const yandexToken = ``;
// const discordClientToken = "";

// Показывать ссылку на репозиторий?
const addRepoButton = true; // true-да, false-нет
// Показывать кнопку с ссылкой на трек?
const addTrackButton = true; // true-да, false-нет
// Показывать таймер?
const addTimer = true; // true-да, false-нет

//Здесь можете указать ссылку на картику или гифку дя маленькой картинки. По дефолту наушники
const smallImage = "headphones";
// Здесь можете напсисать текст, который будет отображаться при наведении на маленькую картнку
const smallImageText = "Туц-туц";

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
  smallImageKey: "",
  largeImageText: "",
  smallImageText: "",
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
      // Получаем очереди юзера
      const queues = await aunthClient.queues.getQueues(device);
      // Получаем нынешную очередь(она будет первой)
      const currentQueue = await aunthClient.queues.getQueueById(
        queues.result.queues[0].id,
      );
      // Из очереди получаем треки и идекс нынешнего
      const { tracks, currentIndex } = currentQueue.result;
      // Получаем айдишник трека
      const currentTrackId = tracks?.at(currentIndex || 0);

      // Здесь наполняем нашу активность данными
      if (currentTrackId) {
        // Получаем трек, который чейчас играет
        const currentTrack = (
          await aunthClient.tracks.getTracks({
            "track-ids": [
              `${currentTrackId?.trackId}:${currentTrackId?.albumId}`,
            ],
          })
        ).result[0];
        // Записываем данные
        acivityData.artist = "";
        for (const artist of currentTrack.artists) {
          if (!acivityData.artist.includes(artist.name)) {
            acivityData.artist += artist.name;
          }
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
          if (addTimer) {
            acivityData.endTimeStamp = Date.now() + currentTrack.durationMs;
          }
          acivityData.details = currentTrack.title;
          acivityData.largeImageText = currentTrack.title;
          if (addTrackButton) {
            acivityData.buttons = [
              {
                label:
                  acivityData.details.length >= 21
                    ? "Слушать " + acivityData.details.substring(0, 20) + "..."
                    : "Слушать " + acivityData.details,
                url: `https://music.yandex.ru/album/${currentTrackId?.albumId}/track/${currentTrackId?.trackId}`,
              },
            ];
          }
          if (addRepoButton) {
            acivityData.buttons.push({
              label: "Хочу такой же статус",
              url: "https://github.com/YungShadi/ym-rpc-ts",
            });
          }
        }
        // https://avatars.yandex.net/get-music-content/42108/d76dcfd9.a.2801448-1/400x400
        acivityData.largeImageKey = currentTrack.coverUri.replace(
          "%%",
          "150x150",
        );
      }
      if (acivityData.endTimeStamp > Date.now()) {
        client.setActivity({
          details: acivityData.details,
          buttons: acivityData.buttons,
          state: acivityData.artist,
          endTimestamp: acivityData.endTimeStamp,
          startTimestamp: Date.now(),
          smallImageKey: smallImage,
          largeImageKey: `https://${acivityData.largeImageKey}`,
          smallImageText: smallImageText,
          largeImageText: acivityData.largeImageText,
          instance: true,
        });
      }
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, 1000);
});
console.log("Discord RPC activated");
setInterval(async () => {
  const { details, artist } = await acivityData;
  console.log("Сейчас играет", details, "-", artist);
}, 30000);

client.login({
  clientId: discordClientToken,
});
