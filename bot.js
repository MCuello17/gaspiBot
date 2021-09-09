const dotenv = require('dotenv');
dotenv.config();

const { Client, Intents, MessageEmbed } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

const token = process.env.BOT_TOKEN;

const { audioResources } = require("./audioResources");

const client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES] });

client.login(token);

client.on("ready", () => {
    const channels = client.channels.cache;
    const voiceChannels = channels.filter(channel => {
        return channel.type === 'GUILD_VOICE';
    });
    const activeVoiceChannels = voiceChannels.filter(channel => {
        return channel.members.size > 0;
    });

    const randomChannel = activeVoiceChannels.random();

    const resource = createAudioResource(getRandomResource());

    // playAudio(randomChannel, resource);

});

client.on('guildCreate', guild => {
    const defaultChannel = guild.systemChannelId;
    const firstChannel = guild.channels.cache.filter(channel => {
        console.log(channel.type, channel.type == "GUILD_TEXT");
        return channel.type == "GUILD_TEXT";
    }).values().next().value;
    
    const channel = guild.channels.cache.get(defaultChannel || firstChannel.id);
    const message = new MessageEmbed()
        .setColor("#ffffff")
        .setTitle("BUENAAAAAASS")
        .setDescription("Cómo les va che todo bien? Yo soy el GaspiBot, un bot de mierda que solo sirve para romper los huevos. Acá está la lista de comandos:")
        .addFields(
            {name: "-g help", value: "Lista de comandos copados"},
            {name: "-g random", value: "Sonido random"},
            {name: "-g [sonido]", value: "[buenas] [boliviano] [fiumba]"}
        )
    channel.send({embeds: [message]});
});

const getRandomResource = () => {
    const keys = Object.keys(audioResources);
    const prop = keys[Math.floor(Math.random() * keys.length)];
    return audioResources[prop];
}

const playAudio = (channel, audioResource) => {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })

    const player = createAudioPlayer();

    player.play(audioResource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });
}

const helpMessage = () => {
    return new MessageEmbed()
        .setColor("#ffffff")
        .setTitle("Ah pero que pelotudo que sos")
        .setDescription("Acá tenes los comandos de mierda:")
        .addFields(
            {name: "-g help", value: "Esta lista de mierda"},
            {name: "-g random", value: "Sonido random"},
            {name: "-g [sonido]", value: "[buenas] [boliviano] [fiumba]"}
        )
}

client.on("messageCreate", async msg => {
    if (msg.author.id === client.user.id) return;
    const command = msg.content;
    if (!command.startsWith('-g ')) return;

    const guild = client.guilds.cache.get(msg.guildId);
    const member = guild.members.cache.get(msg.author.id);
    const channel = member.voice.channel;
    const resourceName = command.replace('-g ', '');

    if (resourceName == 'help') {
        return msg.reply({embeds: [helpMessage()]});
    }
    
    if (channel === null) return msg.reply("No estás en ningún canal de audio IMBECIL");

    let resource;

    switch (resourceName) {
        case 'random':
            resource = getRandomResource();
        break;
        default:
            resource = audioResources[resourceName];
        break;
    }

    if (resource === undefined) {
        return msg.reply("Ese comando no existe pelotudo");
    }

    return playAudio(channel, createAudioResource(resource));
});