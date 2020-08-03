const API_ENDPOINT = 'https://backend.ubblu.ga/api/v1';
function header_auth(ctype = 'application/json', jwtToken) {
    let header = {
      Authorization: jwtToken,
      'Content-Type': ctype,
    };
  
    return header;
}
  
  
function fetchData({method = 'get', url = '', data = null, jwtToken}) {
    const auth = header_auth(undefined, jwtToken);
    const appurl = `${API_ENDPOINT}${url}`;
    return new Promise((res, rej) => {
        fetch(appurl, {
        method,
        body: method === 'get' ? null : data,
        headers: auth,
        }).then(response => {
        response.json().then(res).catch(rej);
        })
    })
};
function fetchUserData(channelId, jwt) {
    const url = `/channels/${channelId}/users`;
    return fetchData({url, jwtToken: jwt,});
}

function pushNotification(_data, jwt, firebaseToken) {
    console.log(jwt);
    fetchUserData(_data.roomId, jwt).then(res => {
        console.log(res);
        if(res.success && res.data) {
            const {users = []} =  res.data;
            const sender = users.find(user => user.firebase_id === firebaseToken);
            if(sender) {
                const isChannel = _data.receiver !== 'USER';
                const url = `/users/triggerPushNotification/${isChannel}/${sender.id}/${_data.roomId}`;
                const data = JSON.stringify({
                    data: {
                        Authorization: jwt,
                        senderId: sender.id,
                        receiverId: _data.receiver === 'USER' ? _data.senderId : _data.receiverId,
                        receiver: _data.receiver,
                        roomId: _data.roomId,
                        workspaceId: _data.workspaceId,
                    },
                    notification: {
                        title: sender.name,
                        body: _data.body,
                    }
                });
                fetchData({method: 'POST', url, jwtToken: jwt, data}).then(res => console.log(res));
            }
        }
    });
}

function exceptionList(_data, jwt, firebaseToken) {
    console.log(jwt);
    fetchUserData(_data.roomId, jwt).then(res => {
        console.log(res);
        if(res.success && res.data) {
            const {users = []} =  res.data;
            const sender = users.find(user => user.firebase_id === firebaseToken);
            if(sender) {
                const url = `/users/exceptionlist/${_data.workspaceId}/${sender.id}`;
                fetchData({method: 'GET', url, jwtToken: jwt}).then(result => {
                    console.log('exceptionlist', res)
                    if(result.success && result.data) {
                        const {list = []} =  result.data;
                        const userIds = [];
                        const channelIds = [];
                        list.map(l => {
                            if (l.userid) userIds.push(l.userid);
                            if (l.channelid) channelIds.push(l.channelid);
                            return null;
                        });
                        const isChannel = _data.receiver !== 'USER';
                        if(isChannel) {
                            channelIds.push(_data.receiverId);
                        } else {
                            userIds.push(_data.senderId)
                        }
                        const data = JSON.stringify({
                            userIds,
                            channelIds,
                            exceptionerid: sender.id,
                            workspace_id: _data.workspaceId,
                        });
                        fetchData({method: 'POST', url: '/users/exceptionlist', jwtToken: jwt, data});;
                    }
                });

            }
        }
    });
    
}

module.exports = {
  fetchUserData,
  pushNotification,
  exceptionList,
};