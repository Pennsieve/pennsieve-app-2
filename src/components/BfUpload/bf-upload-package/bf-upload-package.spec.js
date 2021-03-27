import BfUploadPackage from './bf-upload-package.vue'
import { mount } from 'vue-test-utils'

describe('bf-upload-package.vue', () => {
  let item
  let cmp

  beforeEach(() => {
    item = {
      "files": [
        {
          "uploadId": 0,
          "fileName": "@ ! _ %20foo.png",
          "escapedFileName": "%40 ! _ %2520foo.png",
          "size": 299188,
          "multipartUploadId": "2ysPtdUc41b80Pg_LNwKW854rhbiuGtRQbyy.Xm58A4eATA87RGrcEizlyQzC1GoWnwn.lnPOkoQN3RULwPXAHPYWAjiDKF9.pFqqKEPHRHEqPuZ94lCtz.kulV2z_u_brd7MtkqXDxjwDbJLa0q2NE9OAkh0BfJmwwL4CRJVfE-",
          "chunkedUpload": { "chunkSize": 5242880, "totalChunks": 1 },
          "importId": "320d55d1-4fe8-4e35-885e-1a0b3cd20b0a"
        }
      ],
      "packageName": "@ ! _ %20foo",
      "escapedPackageName": "%40 ! _ %2520foo",
      "packageType": "Image",
      "packageSubtype": "Image",
      "fileType": "PNG",
      "warnings": [],
      "groupSize": 299188,
      "hasWorkflow": true,
      "importId": "320d55d1-4fe8-4e35-885e-1a0b3cd20b0a",
      "icon": "Image",
      "parent": null,
      "ancestors": null,
      "previewPath": null,
      "escapedPreviewPath": null
    }

    cmp = mount(BfUploadPackage, {
      propsData: {
        item
      }
    })

    cmp.update()
  })

  it('Computed icon is correct', () => {
    expect(cmp.vm.icon).toBe('image')

    cmp.vm.item.packageType = 'Collection'
    expect(cmp.vm.icon).toBe('folder')

    cmp.vm.item.packageType = 'DataSet'
    expect(cmp.vm.icon).toBe('folder')

    cmp.vm.item.packageType = 'Slide'
    expect(cmp.vm.icon).toBe('microscope')

    cmp.vm.item.packageType = 'CSV'
    expect(cmp.vm.icon).toBe('tabular')

    cmp.vm.item.packageType = 'nothing should match me'
    expect(cmp.vm.icon).toBe('file')

    cmp.vm.item.packageType = null
    expect(cmp.vm.icon).toBe('settings')

  })

  it('Tooltip displays correct copy', () => {
    expect(cmp.vm.tooltip).toBe('Delete package')

    cmp.setProps({ submitted: true })

    expect(cmp.vm.tooltip).toBe('Cancel Upload')
  })

  it('Computes has multiple files', () => {
    expect(cmp.vm.hasMultipleFiles).not.toBeTruthy()
  })

  it('Computes size correctly', () => {
    expect(cmp.vm.size).toBe('299.19 KB')
  })

  it('Computes size correctly if empty', () => {
    const newItem = Object.assign({}, cmp.vm.item)
    newItem.groupSize = 0
    cmp.setProps( {item: newItem })
    expect(cmp.vm.size).toBe(0)
  })

  it('Computes totalProgress correctly with no upload', () => {
    expect(cmp.vm.totalProgress).toBe(0)
    expect(cmp.vm.totalUploaded).toBe(0)
    expect(cmp.vm.uploading).not.toBeTruthy()
  })

  it('Computes totalProgress correctly with upload', (done) => {
    cmp.setProps({ submitted: true })

    const newItem = Object.assign({}, cmp.vm.item)
    newItem.files.push({
      "uploadId": 1,
      "fileName": "@ ! _ %20foo.png",
      "size": 18069,
      "totalUploaded": 9034.5
    })

    cmp.setProps({ item: newItem })
    cmp.vm.$nextTick(() => {
      expect(cmp.vm.totalProgress).toBe('9.03 KB')
      expect(cmp.vm.totalUploaded).toBe(9034.5)
      expect(cmp.vm.uploading).toBeTruthy()
      done()
    })
  })

  it('Remove package emits proper event', (done) => {
    cmp.vm.removePackage()
    const emitted = cmp.emitted('remove-package')

    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([item])
    done()
  })

  it('Toggle files sets prop and emits event, if there are multiple files', (done) => {
    // Toggle files with item only having one file, should not set files and not emit event
    cmp.vm.toggleFiles()
    expect(cmp.vm.showFiles).not.toBeTruthy()

    // Add files to item and toggle files again
    const newItem = Object.assign({}, cmp.vm.item)
    newItem.files.push({
      "uploadId": 1,
      "fileName": "@ ! _ %20foo.png",
      "size": 18069
    })
    cmp.setProps({ item: newItem })
    cmp.vm.toggleFiles()

    expect(cmp.vm.showFiles).toBeTruthy()
    expect(cmp.emitted('toggle-files').length).toBe(1)
    done()
  })

  it('Shows the proper display name', () => {
    cmp.setProps({ name: '%40 ! _ %2520foo.png' })
    expect(cmp.vm.displayName).toBe('@ ! _ %20foo.png')
  })
})
