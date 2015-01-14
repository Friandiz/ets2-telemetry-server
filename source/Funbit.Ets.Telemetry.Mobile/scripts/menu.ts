﻿/// <reference path="typings/jquery.d.ts" />
/// <reference path="typings/jqueryui.d.ts" />
/// <reference path="typings/dot.d.ts" />

module Funbit.Ets.Telemetry {

    export class Menu {

        private config: Configuration;
        private reconnectTimer: any;

        constructor() {
            this.config = Configuration.getInstance();
            this.initializeEvents();
            this.buildSkinTable([]);
            $.when(this.config.initialized).done(config => {
                if (!config.serverIp) {
                    this.promptServerIp();
                } else {
                    $('.server-ip').html(config.serverIp);
                    this.connectToServer();
                }
            });
        }

        private buildSkinTable(skins: ISkinConfiguration[]) {
            var $tableSkins = $('table.skins');
            $tableSkins.empty();
            if (skins.length == 0) {
                $tableSkins.append(doT.template($('#skin-empty-row-template').html())({}));
            } else {
                var skinTemplateDo = doT.template($('#skin-row-template').html());
                var html = '';
                for (var i = 0; i < skins.length; i++) {
                    html += skinTemplateDo(skins[i]);
                }
                $tableSkins.append(html);    
            }
        }
        
        private connectToServer() {
            var serverIp: string = $('.server-ip').html();
            if (!serverIp) return;
            var $serverStatus = $('.server-status');
            $serverStatus.removeClass('connected')
                .addClass('disconnected')
                .html('Connecting...');
            this.buildSkinTable([]);
            this.config.reload(serverIp, () => {
                $serverStatus.removeClass('disconnected')
                    .addClass('connected')
                    .html('Connected');
                this.buildSkinTable(this.config.skins);
            }, () => {
                $serverStatus.removeClass('connected')
                    .addClass('disconnected')
                    .html('Disconnected');
                this.buildSkinTable(this.config.skins);
                this.reconnectTimer = setTimeout(
                    this.connectToServer.bind(this,
                        [$('.server-ip').html()]), 3000);
            });
        }

        private promptServerIp() {
            var ip = prompt("Please enter " +
                "server IP address (aa.bb.cc.dd)", this.config.serverIp);
            if (!ip) return;
            var correct = /^[a-zA-Z0-9\.\-]+$/.test(ip);
            if (!correct) {
                alert('Entered server IP or hostname has incorrect format.');
            } else {
                $('.server-ip').html(ip);
                this.connectToServer();
            }
        }

        private initializeEvents() {
            $(document).on('click', 'td.skin-image,td.skin-desc', e => {
                var $this = $(e.currentTarget);
                var skinName = $this.closest('tr').data('name');
                window.location.href = "dashboard-host.html?skin=" + skinName +
                    "&ip=" + this.config.serverIp;
            });
            $('.edit-server-ip').click(() => {
                this.promptServerIp();
            });
        }

    }
}

//
// Menu "entry-point"
//

if (Funbit.Ets.Telemetry.Configuration.isCordovaAvailable()) {
    $(document).on('deviceready', () => {
        (new Funbit.Ets.Telemetry.Menu());
    });
} else {
    (new Funbit.Ets.Telemetry.Menu());
}