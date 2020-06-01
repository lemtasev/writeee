const state = {
  count: 0
}

const mutations = {
  set (state, n) {
    state.count = n
  }
}

const actions = {
  set ({ commit, n }) {
    commit('set', n)
  }
}

export default {
  state,
  mutations,
  actions
}
