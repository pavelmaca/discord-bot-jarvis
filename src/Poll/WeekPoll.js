const SimplePoll = require('./SimplePoll');
const PollStatus = require('./PollStatus');
const Discord = require('discord.js');

module.exports = class WeekPoll extends SimplePoll {
    dayList = [
        {'name': 'Pondělí', 'emoji': '\u0031\uFE0F\u20E3'},
        {'name': 'Úterý', 'emoji': '\u0032\uFE0F\u20E3'},
        {'name': 'Středa', 'emoji': '\u0033\uFE0F\u20E3'},
        {'name': 'Čtvrtek', 'emoji': '\u0034\uFE0F\u20E3'},
        {'name': 'Pátek', 'emoji': '\u0035\uFE0F\u20E3'},
        {'name': 'Sobota', 'emoji': '\u0036\uFE0F\u20E3'},
        {'name': 'Neděle', 'emoji': '\u0037\uFE0F\u20E3'},
        {'name': 'Nemůže', 'emoji': '\u26D4'},
    ];

    reactionCollector = null;

    isRunning = false;

    pollStatus = new PollStatus();

    pollMessage = null;
    statusMassage = null;
    stickyStatus = false;

    startPoll() {
        const Discord = require('discord.js');
        const embededMessage = new Discord.MessageEmbed()
            .setColor('#ffa200')
            .setTitle('Kdy můžete hrát tento týden?')
            .setDescription('Scházíme se v 20:00 a den, kdy může nejvíce hráčů + GM.\n\n ' +
                '\u0031\uFE0F\u20E3 - \u0037\uFE0F\u20E3 = Pondělí - Neděle\n ' +
                '\u26D4 = Tento týden nehraju')
            .setTimestamp()
            .setFooter('Anketa se opakuje každý týden.');

        return this.channel.send(embededMessage)
            .then((message) => {
                this.pollMessage = message;
                this.initReaction(message);
                this.listenForReaction(message)
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    initReaction(message) {
        this.dayList.forEach((day) => {
            message.react(day.emoji);
        });
    }

    listenForReaction(message) {
        const dayEmojiList = this.dayList.map(function (day) {
            return day.emoji;
        });
        const reactionFilter = (reaction, user) => {
            return user.id !== message.author.id && dayEmojiList.includes(reaction.emoji.name);
        };

        this.reactionCollector = message.createReactionCollector(reactionFilter, {dispose: true});
        this.isRunning = true;

        this.reactionCollector.on('collect', (reaction, user) => {
            this.pollStatus.addAnswer(reaction.emoji.name, user.tag);
            if (this.stickyStatus) {
                this.displayStatus();
            }
        });

        this.reactionCollector.on('remove', (reaction, user) => {
            this.pollStatus.removeAnswer(reaction.emoji.name, user.tag);
            if (this.stickyStatus) {
                this.displayStatus();
            }
        });

        this.reactionCollector.on('end', collected => {
            console.log(this.pollStatus.getStatus());
        });

        this.setStatusSticky(message.client);
    }

    displayStatus() {
        const statusCollection = this.pollStatus.getStatus();

        let pollStatusMessage = '';
        let votedUsers = new Discord.Collection();
        this.dayList.forEach((day) => {
            let dayVotes = 0;
            let isGM = false;
            if (statusCollection.has(day.emoji)) {
                statusCollection.get(day.emoji).forEach((answer, user) => {
                    if (answer) {
                        dayVotes++;
                        if (!votedUsers.has(user)) {
                            votedUsers.set(user, true);
                        }

                        if (!isGM && user == 'Koule7b#8913') {
                            isGM = true;
                            dayVotes--;
                        }
                    }
                });
            }

            if (dayVotes > 0 || isGM) {
                pollStatusMessage += this.formatDayResult(day.name, dayVotes, isGM);
            }
        });


        const statusMessage = new Discord.MessageEmbed()
            .setColor('#ffa200')
            .setTitle('Stav ankety')
            .setDescription('Hlasujte v anketě [zde](https://discordapp.com/channels/' + this.channel.guild.id + '/' + this.channel.id + '/' + this.pollMessage.id + ').')
            .setTimestamp();

        if (votedUsers.size > 0) {
            statusMessage.addField('Stav', '```\n' + pollStatusMessage + '```');
            statusMessage.addField('Hlasovali',
                votedUsers.map((answer, user) => user).join(', '), false);
        } else {
            statusMessage.addField('Stav', 'Nikdo zatím nehlasoval.');
        }

        if (this.statusMassage) {
            this.statusMassage.delete();
        }
        return this.channel.send(statusMessage).then((message) => {
            this.statusMassage = message;
        }).catch(function (error) {
            console.error(error);
        });
    }

    formatDayResult(dayName, votes, isGm) {
        return dayName.padEnd(10, '\u2000') + votes.toString().padStart(3, '\u2000') + (isGm ? ' +GM' : '') + '\n';
    }

    endPoll() {
        if (this.reactionCollector) {
            this.reactionCollector.stop();
            this.isRunning = false;
        }
    }

    setStatusSticky(client) {
        client.on('message', message => {
            if (this.isRunning && this.stickyStatus && !message.author.bot) {
                this.displayStatus();
            }
        });
    }

    isStatusSticky(bool) {
        this.stickyStatus = bool;
    }


}