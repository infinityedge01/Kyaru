from flask import Flask, abort, request, jsonify
import json
import os
import sys
import datetime
import pandas as pd
 
app = Flask(__name__)
app.debug = False

error_no_request_data = {"state": "fail", "error_code": 1, "error_title": "Error - No Request Data", "error_message": "未收到请求信息，请刷新后重试"}
error_file_not_found = {"state": "fail", "error_code": 2, "error_title": "Error - File Not Found", "error_message": "查询文件有误，请刷新后重试"}
error_regex_error = {"state": "fail", "error_code": 3, "error_title": "Error - Regular Expression Error", "error_message": "输入正则表达式有误，请修改后重试"}
error_rank_error = {"state": "fail", "error_code": 4, "error_title": "Error - Input Rank Error", "error_message": "查询名次有误，请重新查询"}
error_page_error = {"state": "fail", "error_code": 10, "error_title": "Error - Input Page Error", "error_message": "查询页码有误，请重新查询"}

readfile = {}
servetime = {}
@app.before_request
def before_request():
    if request.method == 'OPTIONS':
        return
    ip = request.headers.get("X-Real-Ip")
    print(ip)
    currtime = datetime.datetime.now()
    if ip in servetime:
        lasttime = servetime[ip]
        if (currtime - lasttime) < datetime.timedelta(milliseconds = 500):
            abort(403)
    servetime[ip] = currtime

@app.after_request
def cors(environ):
    environ.headers['Access-Control-Allow-Origin']='*'
    environ.headers['Access-Control-Allow-Method']='*'
    environ.headers['Access-Control-Allow-Headers']='*'
    return environ

@app.route('/search/scoreline',methods=['post'])
def search_scoreline():
    if not request.data:
        return jsonify(error_no_request_data)
    data = request.data.decode('utf-8')
    data = json.loads(data)
    filename = data['filename']
    global readfile
    try:
        if filename not in readfile:
            read_data = pd.read_csv(filename + ".csv")
            readfile[filename] = read_data
    except FileNotFoundError:
        return jsonify(error_file_not_found)
    except:
        return jsonify({"state": "fail", "error_code": -1, "error_title": "Error - Unexcepted Error", "error_message": sys.exc_info()[0]})
    df = readfile[filename].fillna(value = 'null')
    try:
        dfa = df[df['rank'].isin([1, 2, 3, 20, 50, 150, 300, 700, 1300, 2500, 4000, 6000])]
    except:
        return jsonify(error_regex_error)
    if dfa.shape[0] == 0:
        ret_dict = {"state": "success", "total" : 0, "data": {}}
        return jsonify(ret_dict)
    data_dict = dfa.to_dict(orient = 'index')
    ret_dict = {"state": "success", "total" : 1, "data": data_dict}
    return jsonify(ret_dict)

@app.route('/search/clan_name',methods=['post'])
def search_by_clan_name():
    if not request.data:
        return jsonify(error_no_request_data)
    data = request.data.decode('utf-8')
    data = json.loads(data)
    filename = data['filename']
    global readfile
    try:
        if filename not in readfile:
            read_data = pd.read_csv(filename + ".csv")
            readfile[filename] = read_data
    except FileNotFoundError:
        return jsonify(error_file_not_found)
    except:
        return jsonify({"state": "fail", "error_code": -1, "error_title": "Error - Unexcepted Error", "error_message": sys.exc_info()[0]})
    df = readfile[filename].fillna(value = 'null')
    try:
        dfa = df[df.clan_name.str.contains(data['search'], regex = True)]
    except:
        return jsonify(error_regex_error)
    if dfa.shape[0] == 0:
        ret_dict = {"state": "success", "total" : 0, "data": {}}
        return jsonify(ret_dict)
    page = data['page']
    page_limit = data['page_limit']
    totalpage = (dfa.shape[0] - 1) // page_limit + 1
    if page > totalpage:
        return jsonify(error_page_error)
    start_id = page * page_limit
    end_id = min((page + 1) * page_limit, dfa.shape[0])
    dfb = dfa[start_id : end_id]
    data_dict = dfb.to_dict(orient = 'index')
    ret_dict = {"state": "success", "total" : dfa.shape[0], "data": data_dict}
    return jsonify(ret_dict)

@app.route('/search/leader_name',methods=['post'])
def search_by_leader_name():
    if not request.data:
        return jsonify(error_no_request_data)
    data = request.data.decode('utf-8')
    data = json.loads(data)
    filename = data['filename']
    global readfile
    try:
        if filename not in readfile:
            read_data = pd.read_csv(filename + ".csv")
            readfile[filename] = read_data
    except FileNotFoundError:
        return jsonify(error_file_not_found)
    except:
        return jsonify({"state": "fail", "error_code": -1, "error_title": "Error - Unexcepted Error", "error_message": sys.exc_info()[0]})
    df = readfile[filename].fillna(value = 'null')
    try:
        dfa = df[df.leader_name.str.contains(data['search'], regex = True)]
    except:
        return jsonify(error_regex_error)
    if dfa.shape[0] == 0:
        ret_dict = {"state": "success", "total" : 0, "data": {}}
        return jsonify(ret_dict)
    page = data['page']
    page_limit = data['page_limit']
    totalpage = (dfa.shape[0] - 1) // page_limit + 1
    if page > totalpage:
        return jsonify(error_page_error)
    start_id = page * page_limit
    end_id = min((page + 1) * page_limit, dfa.shape[0])
    dfb = dfa[start_id : end_id]
    data_dict = dfb.to_dict(orient = 'index')
    ret_dict = {"state": "success", "total" : dfa.shape[0], "data": data_dict}
    return jsonify(ret_dict)

@app.route('/search/rank',methods=['post'])
def search_by_rank():
    if not request.data:
        return jsonify(error_no_request_data)
    data = request.data.decode('utf-8')
    data = json.loads(data)
    filename = data['filename']
    global readfile
    try:
        if filename not in readfile:
            read_data = pd.read_csv(filename + ".csv")
            readfile[filename] = read_data
    except FileNotFoundError:
        return jsonify(error_file_not_found)
    except:
        return jsonify({"state": "fail", "error_code": -1, "error_title": "Error - Unexcepted Error", "error_message": sys.exc_info()[0]})
    df = readfile[filename].fillna(value = 'null')
    if data['search'] == '':
        dfa = df
    else:
        try:
            dfa = df[df['rank'] == int(data['search'])]
        except:
            return jsonify(error_rank_error)
    if dfa.shape[0] == 0:
        ret_dict = {"state": "success", "total" : 0, "data": {}}
        return jsonify(ret_dict)
    page = data['page']
    page_limit = data['page_limit']
    totalpage = (dfa.shape[0] - 1) // page_limit + 1
    if page > totalpage:
        return jsonify(error_page_error)
    start_id = page * page_limit
    end_id = min((page + 1) * page_limit, dfa.shape[0])
    dfb = dfa[start_id : end_id]
    data_dict = dfb.to_dict(orient = 'index')
    ret_dict = {"state": "success", "total" : dfa.shape[0], "data": data_dict}
    return jsonify(ret_dict)

@app.route('/current/getalltime/tw',methods=['get'])
def getalltime_tw():
    data_dict = {}
    for i in range(1, 5):
        si = str(i)
        lst = os.listdir('tw/' + si)
        data_dict[si] = {}
        for x in lst:
            date = x[:8]
            time = x[8:12]
            if date not in data_dict[si]:
                data_dict[si][date] = []
            data_dict[si][date].append(time)
        for key in data_dict[si]:
            data_dict[si][key] = sorted(data_dict[si][key])

    ret_dict = {"state": "success", "data": data_dict}
    return jsonify(ret_dict)

@app.route('/current/getalltime',methods=['get'])
def getalltime():
    lst = os.listdir('current')
    data_dict = {}
    for x in lst:
        date = x[:8]
        time = x[8:12]
        if date not in data_dict:
            data_dict[date] = []
        data_dict[date].append(time)
    for key in data_dict:
        data_dict[key] = sorted(data_dict[key])

    ret_dict = {"state": "success", "data": data_dict}
    #把区获取到的数据转为JSON格式。
    return jsonify(ret_dict)
    #返回JSON数据。
 
if __name__ == '__main__':
    app.run(host = '0.0.0.0', port=5088)
    #这里指定了地址和端口号。
