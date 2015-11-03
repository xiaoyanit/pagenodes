/**
 * Copyright 2013, 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    // var cron = require("cron");

    function InjectNode(n) {

        // console.log('InjectNode created!', n);

        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.payload = n.payload;
        this.payloadType = n.payloadType;
        this.repeat = n.repeat;
        this.crontab = n.crontab;
        this.once = n.once;
        var node = this;
        this.interval_id = null;
        this.cronjob = null;

        if (this.repeat && !isNaN(this.repeat) && this.repeat > 0) {
            this.repeat = this.repeat * 1000;
            if (RED.settings.verbose) { this.log(RED._("inject.repeat",this)); }
            this.interval_id = setInterval( function() {
                node.emit("input",{});
            }, this.repeat );
        } else if (this.crontab) {
            if (RED.settings.verbose) { this.log(RED._("inject.crontab",this)); }
            // this.cronjob = new cron.CronJob(this.crontab,
            //     function() {
            //         node.emit("input",{});
            //     },
            //     null,true);
        }

        if (this.once) {
            setTimeout( function(){ node.emit("input",{}); }, 100);
        }

        this.on("input",function(msg) {
            var msg = {topic:this.topic};
            if ( (this.payloadType == null && this.payload === "") || this.payloadType === "date") {
                msg.payload = Date.now();
            } else if (this.payloadType == null || this.payloadType === "string") {
                msg.payload = this.payload;
            } else {
                msg.payload = "";
            }
            this.send(msg);
            msg = null;
        });
    }

    RED.nodes.registerType("inject",InjectNode);

    InjectNode.prototype.close = function() {
        if (this.interval_id != null) {
            clearInterval(this.interval_id);
            if (RED.settings.verbose) { this.log(RED._("inject.stopped")); }
        } else if (this.cronjob != null) {
            this.cronjob.stop();
            if (RED.settings.verbose) { this.log(RED._("inject.stopped")); }
            delete this.cronjob;
        }
    }

    RED.events.on("rpc_inject", function(data) {
        var node = RED.nodes.getNode(data.params[0]);
        if (node != null) {
            // try {
                node.receive();
                data.reply('ok');
            // } catch(err) {
            //     res.sendStatus(500);
            //     node.error(RED._("inject.failed",{error:err.toString()}));
            // }
        } else {
            // res.sendStatus(404);
            data.reply('not ok');
        }
    });
}
