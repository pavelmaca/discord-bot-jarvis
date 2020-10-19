const SimplePoll = require('../Poll/SimplePoll');
const WeekPoll = require('../Poll/WeekPoll');

let runningPoll = null;

module.exports = {
    name: 'poll',
    description: 'Aketa',
    usage: 'action (start|stop|status|sticky [0|1])',
    args: true,
    execute(message, args) {
        const action = args.shift();
        switch (action) {
            case 'start':
                if (runningPoll && runningPoll.isRunning) {
                    message.reply('Anketa již běží.');
                    break;
                }

              //  import('../Poll/SimplePoll').then((Module) => {
                    runningPoll = new WeekPoll(message.channel);
                    runningPoll.startPoll();
             //   })

                break;
            case 'status':
                if (!runningPoll) {
                    message.reply('Žádná anketa neběží.');
                    break;
                }
                runningPoll.displayStatus();
                break;

            case 'sticky':
                if (!runningPoll) {
                    message.reply('Žádná anketa neběží.');
                    break;
                }

                const bool = args.shift();
                runningPoll.isStatusSticky(bool == 1);

                break;
            case 'stop':
                if (!runningPoll) {
                    message.reply('Žádná anketa neběží.');
                    break;
                }
                runningPoll.endPoll();
                break;
            case 'help':
            case 'h':
                message.reply('Nápovědu si zatím nezasloužíš.');
                break;
            default:
                message.reply('Neznámý příkaz \'' + action + '\'');
        }
        /*
                const onPollStart = poll.startPoll();
                onPollStart.then(function (message) {
                    //    poll.listenForReaction(message);
                    poll.updateStatus(message);
                })*/
    },
};