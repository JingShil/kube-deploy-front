import request from '@/utils/request'

export function listApp() {
  return request({
    url: '/api/app/list',
    method: 'get'
  })
}

export function createApp(app) {
  return request({
    url: '/api/app/create',
    method: 'post',
    data: app
  })
}

export function updateApp(app) {
  return request({
    url: '/api/app/update',
    method: 'post',
    data: app
  })
}

export function deleteApp(appId) {
  return request({
    url: '/api/app/delete',
    method: 'delete',
    params: { appId }
  })
}
