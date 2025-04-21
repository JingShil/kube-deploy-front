import request from '@/utils/request'

export function listAppInstance() {
  return request({
    url: '/api/app/instance/list',
    method: 'get'
  })
}

export function createAppInstance(applicationInstance) {
  return request({
    url: '/api/app/instance/create',
    method: 'post',
    data: applicationInstance
  })
}

export function updateAppInstance(applicationInstance) {
  return request({
    url: '/api/app/instance/update',
    method: 'post',
    data: applicationInstance
  })
}

// export function deleteAppInstance(appId) {
//   return request({
//     url: '/api/k8s/app/instance/delete',
//     method: 'delete',
//     params: appId
//   })
// }

export function detailAppInstance(applicationInstanceId) {
  return request({
    url: '/api/app/instance/detail',
    method: 'get',
    params: { applicationInstanceId }
  })
}

export function deployAppInstance(applicationInstanceId, username) {
  return request({
    url: '/api/app/instance/update',
    method: 'post',
    params: {
      'applicationInstanceId': applicationInstanceId,
      'username': username
    }
  })
}

export function rebootAppInstance(namespace, podName) {
  return request({
    url: '/api/app/instance/reboot',
    method: 'post',
    params: {
      'namespace': namespace,
      'podName': podName
    }
  })
}

export function rollbackAppInstance(applicationInstanceId, username, version) {
  return request({
    url: '/api/app/instance/rollback',
    method: 'post',
    params: {
      'applicationInstanceId': applicationInstanceId,
      'username': username,
      'version': version
    }
  })
}

export function listAppInstanceVersion(applicationInstanceId) {
  return request({
    url: '/api/app/instance/version/list',
    method: 'get',
    params: {
      'applicationInstanceId': applicationInstanceId
    }
  })
}
