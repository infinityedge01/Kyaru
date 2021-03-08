
jQuery.support.cors = true;
var app = new Vue({
    el: "#PCRClanBattleSearcher",
    data: {
        lang_list : {
            "zh-cn" : "简体中文",
            "zh-tw" : "繁體中文",
        },
        lang : "zh-cn",
        title : {
            "zh-cn": "PCR 渠道服公会战排名查询",
            "zh-tw": "公連渠道服戰隊競賽排名查詢",  
        },
        text_dict : {
            "search_current_rank" :{
                "zh-cn": "查询当期",
                "zh-tw": "查詢本期",
            },
            "search_history" :{
                "zh-cn": "查询历史",
                "zh-tw": "查詢記錄",
            },
            "github_link" :{
                "zh-cn": "项目链接",
                "zh-tw": "專案連結",
            },
            "feedback" :{
                "zh-cn": "意见反馈",
                "zh-tw": "意見回饋",
            },
            "select_server_and_time" :{
                "zh-cn": "查询时间",
                "zh-tw": "查詢時間",
            },
            "select_last_time" :{
                "zh-cn": "选取最新数据",
                "zh-tw": "選取最新資料",
            },
            "search_contents" :{
                "zh-cn": "查询内容",
                "zh-tw": "查詢内容",
            },
            "search_placeholder" :{
                "zh-cn": "查询内容（支持正则表达式，留空为不加限制）",
                "zh-tw": "查詢内容（支援正規表示式，留白為不加限制）",
            },
            "search" :{
                "zh-cn": "查询",
                "zh-tw": "查詢",
            },
            "search_scoreline" :{
                "zh-cn": "查档线",
                "zh-tw": "查檔線",
            },
            "data_header":{
                "rank":{
                    "zh-cn" : "排名",
                    "zh-tw" : "排名",
                },
                "clan_name":{
                    "zh-cn" : "公会名",
                    "zh-tw" : "戰隊名",
                },
                "member_num":{
                    "zh-cn" : "人数",
                    "zh-tw" : "人數",
                },
                "leader_name":{
                    "zh-cn" : "会长名",
                    "zh-tw" : "隊長名",
                },
                "damage":{
                    "zh-cn" : "分数",
                    "zh-tw" : "分數",
                },
                "lap":{
                    "zh-cn" : "周目",
                    "zh-tw" : "週目",
                },
                "boss_id":{
                    "zh-cn" : "Boss",
                    "zh-tw" : "Boss",
                },
                "remain":{
                    "zh-cn" : "剩余血量",
                    "zh-tw" : "剩餘血量",
                },
                "grade_rank":{
                    "zh-cn" : "上期",
                    "zh-tw" : "上期",
                },
            }
        },
        errorOccured: false,
        dateTimeData: {},
        ServerInfo: {
            "1": {
                "zh-cn": "美食殿堂",
                "zh-tw": "美食殿堂",
            },
            "2": {
                "zh-cn": "真步真步王国",
                "zh-tw": "真步真步王國",
            }, 
            "3": {
                "zh-cn": "破晓之星",
                "zh-tw": "破曉之星",
            }, 
            "4": {
                "zh-cn": "小小甜心",
                "zh-tw": "小小甜心",
            },
        },
        selectedServer: "1",
        TimeData:{},
        selectedDate: "",
        selectedTime: "",
        inputtype: "text",
        searchContents: "",
        selectTypeInfo: {
            "1": {
                "zh-cn": "排名",
                "zh-tw": "排名",
            },
            "2": {
                "zh-cn": "公会名",
                "zh-tw": "戰隊名",
            },
            "3": {
                "zh-cn": "会长名",
                "zh-tw": "隊長名",
            },
        },
        selectedType: "2",
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
        apiUrl: "https://api.infedg.xyz",
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
        update : true,
        is_current : true,
        is_history : false,
        historyData : {},
        selectedHistory : "",
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
        lang: function (val) {
            this.lang = val;
            document.title = this.title[this.lang];
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
                this.$nextTick(() => {
                    $('.ui.dropdown').dropdown();
                });
            });
        },
    },
    mounted() {
        $('.ui.dropdown').dropdown();
        $('.ui.form').addClass("loading");
        lang_list = Object.keys(this.lang_list);
        var type = navigator.appName;
        if (type == "Netscape"){
        　　var lang = navigator.language;
        }else{
        　　var lang = navigator.userLanguage;
    　　};
        var curr_lang = lang.toLowerCase();
        if(curr_lang == 'zh-hk') curr_lang = 'zh-tw';
        if(lang_list.includes(curr_lang)){
            this.lang = curr_lang;
        }
        
        $(document).ajaxSend(function (ev, xhr, settings) {
            xhr.setRequestHeader("Custom-Source", "Kyaru");
        });
        setTimeout(() => {
            this.loadTime();
        }, 300);
        //this.WarningMessage();
    },
    methods: {
        getClanBattlePhase(zm) {
            for (let i = this.bossData.phase.length - 1; i >= 0; i--) {
                if (zm >= this.bossData.phase[i]) return i;
            }
        },
        serverError(xhr, state, errorThrown) {
            //$(".search").button("reset");
            error_msg_text = {
                "zh-cn": "无法连接到服务器，请刷新后重试",
                "zh-tw": "無法連線至伺服器，請重新整理後再試",
            };
            $('.ui.form').removeClass("loading");
            $('.button').addClass("disabled");
            $("#error_messagebox").removeClass('hidden');
            if (xhr.responseJSON == undefined) {
                $("#error_title").text("Error - Connected Failed");
                $("#error_message").text(error_msg_text[this.lang]);
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
        WarningMessage(){
            warning_title = {
                "zh-cn": "数据异常说明",
                "zh-tw": "資料異常説明",
            };
            warning_message = {
                "zh-cn": "",
                "zh-tw": "",
            };
            $("#warning_messagebox").removeClass('hidden');
            $("#warning_title").text(warning_title[this.lang]);
            $("#warning_message").text(warning_message[this.lang]);
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
        processTimeData(data) {        
            this.dateTimeData = data["data"];
            this.TimeData = this.dateTimeData[this.selectedServer];
            this.unWatchSelectedServer = this.$watch('selectedServer', this.selectedServerChangeHandler);
            this.unWatchSelectedDate = this.$watch('selectedDate', this.selectedDateChangeHandler);
            $('.ui.form').removeClass("loading");
            this.lastTime();
        },
        loadTime() {
            $.ajax({
                url: this.apiUrl + "/current/getalltime/qd",
                type: "GET",
                dataType: "JSON",
                async: true,
                //data: JSON.stringify({ history: parseInt(this.nowHistoryTime) }),
                success: this.processTimeData,
                error: this.serverError,
            });
        },
        processHistoryData(data) {        
            this.historyData = data["data"];
            this.unWatchSelectedServer = this.$watch('selectedServer', this.selectedServerChangeHandler);
            $('.ui.form').removeClass("loading");
            this.lastHistoryTime();
        },
        loadHistory() {
            $.ajax({
                url: this.apiUrl + "/history/getalltime/qd",
                type: "GET",
                dataType: "JSON",
                async: true,
                //data: JSON.stringify({ history: parseInt(this.nowHistoryTime) }),
                success: this.processHistoryData,
                error: this.serverError,
            });
        },
        lastTime() {
            this.unWatchSelectedDate()
            keys = Object.keys(this.TimeData);
            date = keys[keys.length - 1];
            time = this.TimeData[date][this.TimeData[date].length - 1];
            this.selectedDate = date;
            this.selectedTime = time;
            $('#selectedDate').dropdown('set selected', date);
            $('#selectedTime').dropdown('set selected', time);
            this.unWatchSelectedDate = this.$watch('selectedDate', this.selectedDateChangeHandler)
        },
        lastHistoryTime() {
            keys = this.historyData[this.selectedServer]
            selecthistory = keys[keys.length - 1];
            this.selectedHistory = selecthistory;
            $('#selectedHistory').dropdown('set selected', selecthistory);
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
            return str.substr(0, 4) + '/' + str.substr(4, 2) + '/' + str.substr(6, 2);
        },
        parseTime(str){
            return str.substr(0, 2) + ':' + str.substr(2, 2);
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
            warning_title = {
                "zh-cn": "你的操作太快了",
                "zh-tw": "你的操作太快了",
            };
            warning_message = {
                "zh-cn": "休息一下再试试吧",
                "zh-tw": "休息一下再試試吧",
            };
            $("#warning_messagebox").removeClass('hidden');
            $("#warning_title").text(warning_title[this.lang]);
            $("#warning_message").text(warning_message[this.lang]);
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
            if(this.is_current){
                this.searchData['filename'] = 'qd/' + this.selectedServer + '/' + this.selectedDate + this.selectedTime;
            }else if(this.is_history){
                this.searchData['filename'] = 'qd/history/' + this.selectedServer + '/' + this.selectedHistory;
            }
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
            if(this.is_current){
                this.searchData['filename'] = 'qd/' + this.selectedServer + '/' + this.selectedDate + this.selectedTime;
            }else if(this.is_history){
                this.searchData['filename'] = 'qd/history/' + this.selectedServer + '/' + this.selectedHistory;
            }
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
            message = {
                "zh-cn": "请输入要跳转的页码",
                "zh-tw": "請輸入要跳轉的頁碼"
            };
            var p = prompt(message[this.lang]);
            if (p != null) {
                var g = parseInt(p);
                if(!isNaN(g)) this.setPage(g);
            }
        },
        getUrlKey(name, url) {
            return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(url) || [, ""])[1].replace(/\+/g, "%20")) || null;
        },
        selectedServerChangeHandler(val) {
            this.selectedServer = val;
            this.TimeData = this.dateTimeData[this.selectedServer]
            for(var key in this.TimeData){
                this.selectedDate = key;
            }
            this.selectedTime = this.TimeData[this.selectedDate][this.TimeData[this.selectedDate].length - 1];
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
                this.$nextTick(() => {
                    $('.ui.dropdown').dropdown();
                });
            });
            $('#selectedDate').dropdown('set selected', this.selectedDate);
            $('#selectedTime').dropdown('set selected', this.selectedTime);
        },
        selectedDateChangeHandler(val) {
            this.selectedDate = val;
            this.selectedTime = this.TimeData[this.selectedDate][this.TimeData[this.selectedDate].length - 1];
            console.log(this.selectedTime)
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
                this.$nextTick(() => {
                    $('.ui.dropdown').dropdown();
                });
            });
            $('#selectedTime').dropdown('set selected', this.selectedTime);
        },
        changeToCurrent(){
            $('.ui.form').addClass("loading");
            this.is_history = false;
            this.is_current = true;
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
                this.$nextTick(() => {
                    $('.ui.dropdown').dropdown();
                });
            });
            setTimeout(() => {
                this.loadTime();
            }, 300);
        },
        changeToHistory(){
            $('.ui.form').addClass("loading");
            this.is_current = false;
            this.is_history = true;
            this.update = false;
            this.$nextTick(() => {
                this.update = true;
                this.$nextTick(() => {
                    $('.ui.dropdown').dropdown();
                });
            });
            setTimeout(() => {
                this.loadHistory();
            }, 300);
        },
    },
});
