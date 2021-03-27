import Vuex from "vuex";
import CreateButton from "./CreateButton.vue";
import { shallow } from "vue-test-utils";
import { state, actions, mutations, getters } from "../../../vuex/store";

describe("CreateButton.vue", () => {
  let cmp
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      state,
      actions,
      mutations,
      getters
    });
    cmp = shallow(CreateButton, {
      store
    })
  });

  it("closeMenus: sets all properties", () => {
    cmp.vm.createMenuOpen = true
    cmp.vm.recordMenuOpen = true

    cmp.vm.closeMenus()

    expect(cmp.vm.createMenuOpen).toBe(false)
    expect(cmp.vm.recordMenuOpen).toBe(false)
  })
})
