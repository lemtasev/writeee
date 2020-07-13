<template>

    <div class="init-container">

        <div class="init-line">正在加载</div>
        <div class="init-line">{{missionMessage}}</div>

        <div class="progress-box">
            <el-progress :percentage="percentage"
                         :color="progressColor"
                         :show-text="false"></el-progress>
        </div>

    </div>

</template>

<script>
  import systemService from '@/service/SystemService'
  // import * as openHistoryService from '@/service/OpenHistoryService'
  import merge from 'merge'

  export default {
    name: 'Init',
    components: {
      // MonacoEditor
    },
    data () {
      return {
        percentage: 0,
        progressColor: '#2f6ade',
        workspace: '',
        missionMessage: ''
      }
    },
    watch: {
      percentage (v) {
        console.log('percentage', v)
        this.$electron.remote.getCurrentWindow().setProgressBar(v / 100) // 任务栏进度条
        if (v === 100) {
          console.log('init ready')
          console.log('workspace', this.workspace)
          setTimeout(() => {
            if (this.workspace) {
              // open home page
              this.$electron.remote.getGlobal('sharedObject').workspace = this.workspace
              this.$electron.ipcRenderer.send('open-main-window')
            } else {
              // open Welcome page
              this.$electron.ipcRenderer.send('open-welcome-window')
            }
            // close this page
            this.$electron.remote.getCurrentWindow().close()
            this.$electron.remote.getCurrentWindow().setProgressBar(-1) // 任务栏进度条
          }, 1000)
        }
      }
    },
    created () {
      console.log(`${this.$options.name} created`)
      let that = this

      let missionArr = [
        async function (callback) {
          let missionName = '初始化菜单'
          that.missionMessage = `正在【${missionName}】`
          systemService.findOpenHistory().then(ret => {
            let li = []
            if (ret && ret.length > 0) {
              li = ret[0].value
            }
            if (li && li.length > 0) {
              that.workspace = li[li.length - 1]
            }
            that.$electron.ipcRenderer.send('refresh-app-menu', {original: true})
            callback(missionName)
          })
        },
        async function (callback) {
          let missionName = '初始化系统设置'
          that.missionMessage = `正在【${missionName}】`
          // todo 查询系统设置，储存到 sharedObject
          systemService.findUserSetting('userSetting').then(ret => {
            let userSetting
            if (ret && ret.length > 0) {
              userSetting = ret[0].value
            }
            let defaultSetting = require('@/defaultSetting.js').default.defaultSetting
            userSetting = merge(defaultSetting, userSetting)
            console.log(userSetting)
            that.$electron.remote.getGlobal('sharedObject').userSetting = userSetting
            callback(missionName)
          })
        }
      ]
      let length = missionArr.length
      let per = Math.round(100 / length)
      let firstPer = 100 - per * length + per
      missionArr.forEach((fn, i) => {
        fn((missionName) => {
          that.percentage += i === 0 ? firstPer : per
          that.missionMessage = `【${missionName}】完成`
        })
      })
    },
    methods: {
    }
  }
</script>

<style lang="less" scoped>

    @import '../common.less';

    .init-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background-color: @themeColor;
        .init-line {
            padding: 10px 0;
            width: 90%;
            color: white;
        }
        .progress-box {
            padding: 10px 0;
            width: 90%;
        }
    }

</style>
