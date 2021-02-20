
jQuery.support.cors = true;
var app = new Vue({
    el: "#PCRClanBattleSearcher",
    data: {
        errorOccured: false,
        showData: {
            header: ["排名", "公会名", "人数", "会长名", "分数", "周目", "Boss", "剩余血量", "评级"],
            time: "",
            body: [],
            ts: 0,
        },
        dateTimeData: {},
        selectedDate: "",
        selectedTime: "",
        inputtype: "text",
        searchContents: "",
        selectTypeInfo: {"1": "排名", "2": "公会名", "3": "会长名"},
        selectedType: "1",
        searchurl: "",
        searchData:{},
        showData:{},
        pageinfo: {
            page: 0,
            maxPage: 0,
            limit: 10,
            show: "",
            prevDisabled: true,
            nextDisabled: true,
        },
        lastReq: JSON.stringify({ history: 0 }),
        lastApi: "",
        mock: true,
        allow: true,
        waitTime: 1,
        nowHistoryTime: 0,
        //apiUrl: "http://127.0.0.1:5088",
        apiUrl: "https://api.infedg.xyz",
        
        //apiUrl: "https://service-kjcbcnmw-1254119946.gz.apigw.tencentcs.com/",
        foot2show: false,
        foot2Info: {
            clanName: "",
            zminfo: "",
            per: "",
            perText: "",
        },
        proTableData: [],
        favSelected: [],
        serverMsg: [],
    },
    computed: {
        selectRange() {
            const { selected, selectdata } = this;
            return {
                selected,
                selectdata,
            };
        },
    },
    watch: {
        
    },
    mounted() {
        $('.ui.dropdown').dropdown();
        $('.ui.form').addClass("loading");
        let type = this.getUrlKey("type", window.location.href);
        let data = this.getUrlKey("data", window.location.href);
        if (type != null && data != null) {
            this.selected = type;
            this.selectdata = data;
            setTimeout(() => {
                this.search();
            }, 300);
            return;
        }
        $(document).ajaxSend(function (ev, xhr, settings) {
            xhr.setRequestHeader("Custom-Source", "KyoukaOfficial");
        });
        setTimeout(() => {
            this.loadTime();
        }, 300);
    },
    methods: {
        getClanBattlePhase(zm) {
            for (let i = this.bossData.phase.length - 1; i >= 0; i--) {
                if (zm >= this.bossData.phase[i]) return i;
            }
        },
        serverError(xhr, state, errorThrown) {
            //$(".search").button("reset");
            $('.ui.form').removeClass("loading");
            $('.button').addClass("disabled");
            $("#error_messagebox").removeClass('hidden');
            if (xhr.responseJSON == undefined) {
                $("#error_title").text("Error - Connected Failed");
                $("#error_message").text("无法连接到服务器，请刷新后重试");
            }else{
                alert(xhr.responseJSON.msg);
            }
            $("#error_messagebox").show();
            $('.message .close')
                .on('click', function () {
                    $(this)
                        .closest('.message')
                        .fadeOut();
                        ;
                })
                ;
            this.errorOccured = true;
            return;
        },
        processTimeData(data) {        
            this.dateTimeData = data["data"];
            this.unWatchSelectedDate = this.$watch('selectedDate', this.selectedDateChangeHandler)
            $('.ui.form').removeClass("loading");
            this.lastTime();
        },
        loadTime() {
            $.ajax({
                url: this.apiUrl + "/current/getalltime",
                type: "GET",
                dataType: "JSON",
                async: true,
                //data: JSON.stringify({ history: parseInt(this.nowHistoryTime) }),
                success: this.processTimeData,
                error: this.serverError,
            });
        },
        lastTime() {
            this.unWatchSelectedDate()
            keys = Object.keys(this.dateTimeData);
            date = keys[keys.length - 1];
            time = this.dateTimeData[date][this.dateTimeData[date].length - 1];
            this.selectedDate = date;
            this.selectedTime = time;
            $('#selectedDate').dropdown('set selected', date);
            $('#selectedTime').dropdown('set selected', time);
            this.unWatchSelectedDate = this.$watch('selectedDate', this.selectedDateChangeHandler)
        },
        errorHandler(data){
            $("#error_messagebox").removeClass('hidden');
            $("#error_title").text(data['error_title']);
            $("#error_message").text(data['error_message']);
            $("#error_messagebox").show();
            $('.message .close')
                .on('click', function () {
                    $(this)
                        .closest('.message')
                        .fadeOut();
                        ;
                })
                ;
            $('.ui.form').removeClass("loading");
            setTimeout(() => {this.allow = true;}, 1000);
        },
        parseDate(str){
            return str.substr(0, 4) + '年' + str.substr(4, 2) + '月' + str.substr(6, 2) + '日';
        },
        parseTime(str){
            return str.substr(0, 2) + '时' + str.substr(2, 2) + '分';
        },
        processData(data){
            if(data['state'] != 'success'){
                this.errorHandler(data);
                return;
            }
            this.showData = data['data'];
            this.pageinfo['page'] = this.searchData['page'];
            this.pageinfo['maxPage'] = Math.ceil(data['total'] / this.pageinfo['limit']);
            if(this.pageinfo['page'] == 0){
                this.pageinfo['prevDisabled'] = true;
            }else this.pageinfo['prevDisabled'] = false;
            if(this.pageinfo['page'] >= this.pageinfo['maxPage'] - 1){
                this.pageinfo['nextDisabled'] = true;
            }else this.pageinfo['nextDisabled'] = false;
            $('.ui.form').removeClass("loading");
            setTimeout(() => {this.allow = true;}, 1000);
        },
        operationTooFast(){
            $("#warning_messagebox").removeClass('hidden');
            $("#warning_title").text("你的操作太快了");
            $("#warning_message").text("休息一下再试试吧");
            $("#warning_messagebox").show();
            $('.message .close')
                .on('click', function () {
                    $(this)
                        .closest('.message')
                        .fadeOut();
                        ;
                })
                ;
        },
        searchScoreLine() {
            if(!this.allow){
                this.operationTooFast();
                return;         
            }        
            $('.ui.form').addClass("loading");
            this.allow = false;
            this.searchData['filename'] = 'current/' + this.selectedDate + this.selectedTime;
            this.searchData['search'] = this.searchContents;
            this.searchData['page'] = 0;
            this.searchData['page_limit'] = this.pageinfo.limit
            this.searchurl = this.apiUrl + '/search/scoreline';
            $.ajax({
                url: this.searchurl,
                type: "POST",
                dataType: "JSON",
                async: true,
                contentType: "application/json",
                data: JSON.stringify(this.searchData),
                success: this.processData,
                error: this.serverError,
            });
        },
        searchDataFirstTime() {
            if(!this.allow){
                this.operationTooFast();
                return;         
            }        
            $('.ui.form').addClass("loading");
            this.allow = false;
            this.searchData['filename'] = 'current/' + this.selectedDate + this.selectedTime;
            this.searchData['search'] = this.searchContents;
            this.searchData['page'] = 0;
            this.searchData['page_limit'] = this.pageinfo.limit
            this.searchurl = this.apiUrl + '/search';
            if(this.selectedType == 1){
                this.searchurl += '/rank';
            }else if(this.selectedType == 2){
                this.searchurl += '/clan_name';
            }else{
                this.searchurl += '/leader_name';
            }
            $.ajax({
                url: this.searchurl,
                type: "POST",
                dataType: "JSON",
                async: true,
                contentType: "application/json",
                data: JSON.stringify(this.searchData),
                success: this.processData,
                error: this.serverError,
            });
        },
        searchDataPage(page) {
            if(!this.allow){
                this.operationTooFast();
                return;     
            }
            if(page < 0 || page >= this.pageinfo['maxPage']){
                this.errorHandler({"state": "fail", "error_code": 10, "error_title": "Error - Input Page Error", "error_message": "查询页码有误，请重新查询"});
                return;
            }
            this.allow = false;
            $('.ui.form').addClass("loading");
            this.searchData['page'] = page;
            $.ajax({
                url: this.searchurl,
                type: "POST",
                dataType: "JSON",
                async: true,
                contentType: "application/json",
                data: JSON.stringify(this.searchData),
                success: this.processData,
                error: this.serverError,
            });
        },
        addPage(val){
            let page = this.pageinfo['page'] + val;
            this.searchDataPage(page);
        },
        setPage(val){
            let page = val - 1;
            this.searchDataPage(page);
        },
        transPage() {
            var p = prompt("请输入要跳转的页码");
            if (p != null) {
                var g = parseInt(p);
                if(!isNaN(g)) this.setPage(g);
            }
        },
        getUrlKey(name, url) {
            return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(url) || [, ""])[1].replace(/\+/g, "%20")) || null;
        },
        selectedDateChangeHandler(val) {
            this.selectedDate = val;
            this.selectedTime = this.dateTimeData[this.selectedDate][0];
        },
    },
});
