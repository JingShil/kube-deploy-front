import request from '@/utils/request'

export function listImage() {
  return request({
    url: '/api/image/list',
    method: 'get'
  })
}

export function createImage(image) {
  return request({
    url: '/api/image/create',
    method: 'post',
    data: image
  })
}

export function updateImage(image) {
  return request({
    url: '/api/image/update',
    method: 'post',
    data: image
  })
}

export function deleteImage(imageId) {
  return request({
    url: '/api/image/delete',
    method: 'delete',
    params: { imageId }
  })
}

export function uploadImage(file, imageId) {
  return request({
    url: '/api/image/upload-and-build',
    method: 'post',
    params: { file, imageId }
  })
}

export function deleteImageReplica(imageReplicaId) {
  return request({
    url: '/api/image/replica/delete',
    method: 'delete',
    params: { imageReplicaId }
  })
}

