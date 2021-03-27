/* eslint-disable no-undef */
import { actions, mutations, state } from './viewer'

describe('viewer module', () => {
  let testState = { ...state }
  const actionParams = {
    commit: (fnName, payload) => mutations[fnName](testState, payload)
  }

  beforeEach(() => {
    testState = { ...state }
  })

  it('Sets activeViewer when calling openViewer', () => {
    actions.openViewer(actionParams, { a: 1, b: 2 })
    expect(testState.activeViewer).toMatchObject({ a: 1, b: 2 })
  })

  it('Sets open and view attributes when calling setSidePanel', () => {
    actions.setSidePanel(actionParams, {open: true, view: 'panel'})
    expect(testState.viewerSidePanelOpen).toBe(true)
    expect(testState.viewerSidePanelView).toBe('panel')
  })

  it('Resets state after calling closeViewer', () => {
    // set test state to value to see if its equal to initial state after closeViewer
    Object.keys(testState).forEach(key => testState[key] = 'wowie')
    actions.closeViewer(actionParams)
    expect(testState).toMatchObject(state)
  })

  it('Sets active tool when calling setActiveTool', () => {
    actions.setActiveTool(actionParams, 'sometool')
    expect(testState.viewerActiveTool).toBe('sometool')
  })

  it('Sets slide info when calling updateViewerSlideInfo', () => {
    actions.updateViewerSlideInfo(actionParams, { curRotation: 1, curZoom: 1})
    expect(testState.viewerSlideInfo.curRotation).toBe(1)
    expect(testState.viewerSlideInfo.curZoom).toBe(1)
  })

  it('Sets channels when calling setChannels', () => {
    actions.setChannels(actionParams, [1])
    expect(testState.viewerChannels).toMatchObject([1])
  })

  it('updates channel when calling updateChannel', () => {
    testState.viewerChannels = [{ id: 123, value: 2 }]
    actions.updateChannel({ ...actionParams, state: testState }, {id: 123, value: 3});

    expect(testState.viewerChannels[0]).toMatchObject({id: 123, value: 3})
  })
  
  it('Appends data to viewer annotations when calling createLayer', () => {
    actions.createLayer(actionParams, 'layer')
    expect(testState.viewerAnnotations).toMatchObject(['layer'])
  })

  it('Updates viewer annotation when calling updateLayer', () => {
    testState.viewerAnnotations = [{ id: 123, value: 2 }]
    actions.updateLayer({ ...actionParams, state: testState }, {id: 123, value: 3});

    expect(testState.viewerAnnotations[0]).toMatchObject({id: 123, value: 3})
  })

  it('Deletes viewer annotation when calling deleteLayer', () => {
    testState.viewerAnnotations = [{ id: 123, value: 2 }]
    actions.deleteLayer({ ...actionParams, state: testState }, {id: 123, value: 3});

    expect(testState.viewerAnnotations[0]).toBe(undefined)
  })

  it('Sets annotations when calling setAnnotations', () => {
    actions.setAnnotations(actionParams, [1, 2, 3])
    expect(testState.viewerAnnotations).toMatchObject([1, 2, 3])
  })

  it('Sets annotations when calling setAnnotations', () => {
    actions.setAnnotations(actionParams, [1, 2, 3])
    expect(testState.viewerAnnotations).toMatchObject([1, 2, 3])
  })
})
